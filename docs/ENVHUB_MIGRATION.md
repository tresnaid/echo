# EnvHub Migration

This runbook migrates Echo production from `/srv/apps/echo/.env` to EnvHub
without changing either deployment boundary:

- Vercel continues to build and deploy the frontend from `frontend/`.
- A `vX.Y.Z-be` Git tag continues to build the backend image and deploy it to
  the VPS.

The backend workflow uses GitHub OIDC to obtain a five-minute EnvHub token.
No EnvHub credential is persisted in GitHub Secrets or on the VPS.
`ECHO_VERSION` is deployment metadata from the Git tag, not an EnvHub value.

## What lives where

| Value | Source | Reason |
| --- | --- | --- |
| `VITE_API_URL` | EnvHub `echo/frontend-production` | Vercel fetches it during the production build; Vite then embeds the public URL into browser assets. |
| `CORS_ORIGIN` | EnvHub `echo/production` | It is mutable backend runtime configuration. |
| `ECHO_VERSION` | The `vX.Y.Z-be` Git tag | It selects the immutable GHCR image for that release. |
| `PORT`, `NODE_ENV`, `DATABASE_PATH`, `UPLOADS_PATH` | `compose.prod.yml` | These are fixed container layout constants. |
| VPS host, SSH user and SSH key | Existing GitHub Secrets | They are transport credentials used before EnvHub can run on the remote host. |

Future backend credentials belong in EnvHub. Infrastructure constants and
public frontend settings remain separate from backend secrets even though both
are managed in EnvHub.

## Prerequisites

- EnvHub server and CLI version `0.2.1`.
- EnvHub URL `https://env.tresnaid.space`.
- Echo GitHub repository ID `1383221212` and owner ID `32062861`.
- Existing GitHub `Production` environment.
- Existing `VPS_HOST`, `VPS_USER`, and `VPS_SSH_KEY` repository secrets.
- A backup location outside `/srv/apps/echo` that only the VPS owner can read.

Identity values and their purpose are documented separately in
[ENVHUB_IDENTITIES.md](ENVHUB_IDENTITIES.md).

## 1. Create the EnvHub scopes

In the EnvHub dashboard:

1. Create or open project `echo`.
2. Create or open environment `production`.
3. Add `CORS_ORIGIN` with this value:

   ```text
   https://echo.tresnaid.space
   ```

4. Save it, then edit it once in the dashboard to confirm updates work.
5. Create the `echo-github-production` GitHub identity exactly as described in
   [ENVHUB_IDENTITIES.md](ENVHUB_IDENTITIES.md).

Do not add `ECHO_VERSION` to EnvHub. The tag that triggered the deployment is
the only version source.

## 2. Install the pinned EnvHub CLI on the VPS

Connect to the VPS as the deployment user and run:

```sh
version=0.2.1
case "$(uname -m)" in
  x86_64) arch=amd64 ;;
  aarch64|arm64) arch=arm64 ;;
  *) echo "Unsupported architecture: $(uname -m)" >&2; exit 1 ;;
esac

work_dir="$(mktemp -d)"
curl --fail --location --output "${work_dir}/envhub_${version}_linux_${arch}" \
  "https://github.com/gumelartresnadwinanda/envhub/releases/download/v${version}/envhub_${version}_linux_${arch}"
curl --fail --location --output "${work_dir}/SHA256SUMS" \
  "https://github.com/gumelartresnadwinanda/envhub/releases/download/v${version}/SHA256SUMS"

(
  cd "${work_dir}"
  grep " envhub_${version}_linux_${arch}$" SHA256SUMS | sha256sum --check --strict
)
sudo install -m 0755 "${work_dir}/envhub_${version}_linux_${arch}" /usr/local/bin/envhub
envhub version
```

The last command must print `envhub 0.2.1`. The release workflow deliberately
stops before changing the running container if the CLI is missing or has a
different version.

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

At the time of this migration, the latest backend tag is `v0.0.2-be`, so the
planned next tag is `v0.0.3-be`. After this change is reviewed and merged into
`main`, confirm that tag is still unused and create it from the merged commit:

```sh
git switch main
git pull --ff-only
git tag --list v0.0.3-be
git tag v0.0.3-be
git push origin v0.0.3-be
```

The first command must print nothing. If it prints `v0.0.3-be`, choose the next
unused patch version instead. The new tag starts the existing backend workflow,
which now:

1. tests and builds the backend image;
2. exchanges GitHub OIDC for a five-minute EnvHub token;
3. copies `compose.prod.yml` to `/srv/apps/echo`;
4. runs Compose through `envhub run`;
5. explicitly uses `--env-file /dev/null`, so a legacy `.env` cannot affect the
   release;
6. checks `http://127.0.0.1:3001/api/health` before reporting success.

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

If the OIDC exchange or EnvHub fetch fails, the workflow stops before
`docker compose up`; the currently running Echo container remains active.

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
