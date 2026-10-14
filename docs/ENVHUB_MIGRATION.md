# EnvHub Migration

This runbook migrates Echo production from `/srv/apps/echo/.env` to EnvHub
without changing either deployment boundary:

- Vercel continues to build and deploy the frontend from `frontend/`.
- A `vX.Y.Z-be` Git tag continues to build the backend image and deploy it to
  the VPS.

The backend workflow uses GitHub OIDC to obtain a five-minute EnvHub token.
That token retrieves both the VPS transport values and backend runtime values.
No user-managed deployment credential is persisted in GitHub Secrets or on the
VPS. `ECHO_VERSION` is deployment metadata from the Git tag, not an EnvHub
value.

## What lives where

| Value | Source | Reason |
| --- | --- | --- |
| `VITE_API_URL` | EnvHub `echo/frontend-production` | Vercel fetches it during the production build; Vite then embeds the public URL into browser assets. |
| `CORS_ORIGIN` | EnvHub `echo-backend/production` | It is mutable backend runtime configuration. |
| `VPS_HOST`, `VPS_USER`, `VPS_PORT` | EnvHub `echo-backend/production` | They identify the production SSH destination. |
| `VPS_SSH_PRIVATE_KEY` | EnvHub `echo-backend/production` | It authenticates the short-lived GitHub runner to the VPS. |
| `VPS_SSH_KNOWN_HOSTS` | EnvHub `echo-backend/production` | It pins the VPS host key so the runner does not trust an unknown server. |
| `ECHO_VERSION` | The `vX.Y.Z-be` Git tag | It selects the immutable GHCR image for that release. |
| `PORT`, `NODE_ENV`, `DATABASE_PATH`, `UPLOADS_PATH` | `compose.prod.yml` | These are fixed container layout constants. |

Future backend credentials belong in EnvHub. Infrastructure constants and
public frontend settings remain separate from backend secrets even though both
are managed in EnvHub.

The workflow still uses GitHub's automatic, per-job `github.token` to publish
the image to GHCR. That token is created by GitHub for the job and is not a
repository or environment secret configured by the project owner.

## Prerequisites

- EnvHub server version `0.2.2` or newer and CLI version `0.2.1` or newer.
- EnvHub URL `https://env.tresnaid.space`.
- Echo GitHub repository ID `1383221212` and owner ID `32062861`.
- Existing GitHub `Production` environment.
- An unencrypted SSH private deploy key whose public key is authorized for the
  deployment user on the VPS.
- A backup location outside `/srv/apps/echo` that only the VPS owner can read.

Identity values and their purpose are documented separately in
[ENVHUB_IDENTITIES.md](ENVHUB_IDENTITIES.md).

## 1. Create the EnvHub scopes

In the EnvHub dashboard:

1. Create or open project `echo-backend`.
2. Create or open environment `production`.
3. Add the backend runtime value:

   ```text
   CORS_ORIGIN=https://echo.tresnaid.space
   ```

4. Add these VPS deployment values:

   | Name | Value |
   | --- | --- |
   | `VPS_HOST` | `43.134.169.70` |
   | `VPS_USER` | `tresnaid` |
   | `VPS_PORT` | `22`, unless SSH actually listens on another port |
   | `VPS_SSH_PRIVATE_KEY` | The complete unencrypted private key, including its `BEGIN` and `END` lines |
   | `VPS_SSH_KNOWN_HOSTS` | The complete verified `known_hosts` line for the VPS |

   Values in this table are either real public connection values or a
   description of the real secret to paste. Do not literally save the
   descriptive text in the last two rows.

5. Obtain and verify `VPS_SSH_KNOWN_HOSTS` from a trusted computer:

   ```sh
   ssh-keyscan -H -t ed25519 43.134.169.70 > echo-vps-known-hosts
   ssh-keygen -lf echo-vps-known-hosts
   ```

   Compare that fingerprint with the host-key fingerprint printed on the VPS:

   ```sh
   sudo ssh-keygen -lf /etc/ssh/ssh_host_ed25519_key.pub
   ```

   Only after they match, paste the contents of `echo-vps-known-hosts` into
   `VPS_SSH_KNOWN_HOSTS`. This check prevents a different server from
   impersonating the VPS during deployment.

6. Save each value. Editing an existing value is allowed; a revoked identity
   name is unrelated to these value names.
7. Create the `echo-github-production` GitHub identity exactly as described in
   [ENVHUB_IDENTITIES.md](ENVHUB_IDENTITIES.md).

Do not add `ECHO_VERSION` to EnvHub. The tag that triggered the deployment is
the only version source.

## 2. Install a compatible EnvHub CLI on the VPS

The EnvHub repository is private, so its GitHub release URL cannot be downloaded
with unauthenticated `curl`. The running EnvHub container already contains the
correct binary. Extract that exact binary instead:

```sh
cd /srv/apps/envhub
container_id="$(docker compose ps -q envhub)"
if [ -z "${container_id}" ]; then
  echo "The EnvHub container is not running" >&2
  exit 1
fi

work_dir="$(mktemp -d)"
docker cp "${container_id}:/usr/local/bin/envhub" "${work_dir}/envhub"
"${work_dir}/envhub" version
sudo install -m 0755 "${work_dir}/envhub" /usr/local/bin/envhub
rm -rf "${work_dir}"
envhub version
```

The first version command shows the version copied from the running EnvHub
container. The final command must print `envhub 0.2.1` or newer. This method
needs no GitHub token. The Echo release workflow stops before changing the
running container if the CLI is missing, malformed, or older than `0.2.1`.

## 3. Back up the current VPS deployment

This is a rollback snapshot, not the new configuration path:

```sh
backup_dir="/srv/backups/echo-before-envhub"
if [ -e "${backup_dir}" ]; then
  echo "Backup already exists: ${backup_dir}" >&2
  exit 1
fi
sudo install -d -m 0700 "${backup_dir}"
sudo install -m 0600 /srv/apps/echo/.env "${backup_dir}/legacy.env"
sudo install -m 0600 /srv/apps/echo/compose.yml "${backup_dir}/compose.yml"
printf '%s\n' "${backup_dir}"
```

The backup path is `/srv/backups/echo-before-envhub`. The SQLite database and uploads remain in
`/srv/apps/echo/data` and are not replaced by this migration. Back them up using
the VPS's normal data backup procedure before release.

## 4. Move Vercel build configuration to EnvHub

In EnvHub:

1. Create environment `frontend-production` under project `echo`.
2. Add `VITE_API_URL=https://api-echo.tresnaid.space`.
3. Create the `echo-vercel-production` machine identity described in
   [ENVHUB_IDENTITIES.md](ENVHUB_IDENTITIES.md).
4. Copy its one-time token directly into Vercel as a sensitive Production-only
   variable named `ENVHUB_TOKEN`.

In the Vercel Echo project, keep:

- Root Directory: `frontend`
- Build Command: `pnpm run build`
- Output Directory: `dist`

After `ENVHUB_TOKEN` is saved, remove the old Vercel `VITE_API_URL`. The Node
build wrapper fetches the frontend value from EnvHub's runtime endpoint, unsets
the token, and then runs Vite. The browser receives only `VITE_API_URL`; it
never receives the EnvHub token. No EnvHub CLI download is needed in Vercel.

Do this before merging the frontend EnvHub integration PR. Otherwise Vercel's
automatic build will fail closed because `ENVHUB_TOKEN` is missing.

An EnvHub value change is not itself a Vercel deployment trigger. Redeploy the
latest Vercel production deployment after changing `VITE_API_URL`.

## 5. Merge and release

After this change is reviewed and merged into `main`, inspect the existing
backend tags and choose the next unused patch version. For example, if
`v0.0.4-be` is the newest tag, use `v0.0.5-be`:

```sh
git switch main
git pull --ff-only
git tag --list 'v*-be' --sort=-v:refname
git tag --list v0.0.5-be
git tag v0.0.5-be
git push origin v0.0.5-be
```

The exact-tag check (`git tag --list v0.0.5-be` in the example) must print
nothing. If it prints the tag, choose the next unused patch version instead.
The new tag starts the existing backend workflow, which now:

1. tests and builds the backend image;
2. exchanges GitHub OIDC for a five-minute EnvHub token;
3. fetches the VPS address, user, port, private key, and pinned host key from
   EnvHub into temporary runner files;
4. copies `compose.prod.yml` to `/srv/apps/echo` using strict SSH host-key
   checking;
5. passes the same short-lived token to the VPS and runs Compose through
   `envhub run`;
6. explicitly uses `--env-file /dev/null`, so a legacy `.env` cannot affect the
   release;
7. checks `http://127.0.0.1:3001/api/health` before reporting success.

The SSH private key and the complete EnvHub response exist only in the
ephemeral runner's restricted temporary directory and are deleted when the
step exits. Although the same production response is also fetched by
`envhub run` on the VPS, Compose forwards only explicitly declared application
variables such as `CORS_ORIGIN` into the container.

## 6. Verify the cutover

Confirm the GitHub workflow is green, then run on the VPS:

```sh
curl --fail http://127.0.0.1:3001/api/health
docker inspect echo-backend --format '{{.Config.Image}}'
docker inspect echo-backend --format '{{range .Config.Env}}{{println .}}{{end}}' | grep '^CORS_ORIGIN='
```

Then load `https://echo.tresnaid.space`, create or edit a prompt, and confirm
the browser can call `https://api-echo.tresnaid.space` without a CORS error.

Docker stores a container's resolved process environment in its metadata, so a
user with Docker daemon access can inspect it. EnvHub removes the persistent
`.env` and GitHub secret copy; it does not protect values from VPS root or
Docker administrators.

## 7. Remove the legacy `.env`

Only after the new release and application checks pass:

```sh
backup_dir="/srv/backups/echo-before-envhub"
test -f /srv/apps/echo/.env
sudo mv /srv/apps/echo/.env "${backup_dir}/legacy.env.removed-from-app"
test ! -e /srv/apps/echo/.env
```

The deployment is now `.env`-less. Keep the restricted backup through at least
one successful later release, then remove it according to the backup retention
policy.

## Rollback

If the OIDC exchange, EnvHub fetch, SSH validation, copy, or remote deployment
fails, the workflow stops before replacing a healthy container whenever
possible. The currently running Echo container remains active for failures
that occur before `docker compose up`.

To restore the previous file-based deployment manually:

```sh
backup_dir="/srv/backups/echo-before-envhub"
sudo install -m 0600 "${backup_dir}/legacy.env" /srv/apps/echo/.env
sudo install -m 0600 "${backup_dir}/compose.yml" /srv/apps/echo/compose.yml
cd /srv/apps/echo
docker compose up -d backend
curl --fail http://127.0.0.1:3001/api/health
```

Rollback restores the previous behavior only. Fix the EnvHub identity or value,
then perform a new patch release tag; never move or reuse an existing tag.

## Local development with EnvHub

Local `.env` files remain supported for contributors, but a developer who wants
the same `.env`-less workflow can create a separate `development` environment
and machine identity, then run:

```sh
export ENVHUB_SERVER=https://env.tresnaid.space
export ENVHUB_TOKEN=ehm_your_development_token
envhub run -- pnpm --dir backend dev
```

Never reuse the production GitHub identity or production values for local
development. The local machine token is shown once, must be stored outside the
repository, and should be revoked when the device is retired.
