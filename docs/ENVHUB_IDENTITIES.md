# EnvHub Identities for Echo

An identity answers two questions: **who may fetch values**, and **from exactly
which project and environment**. It is not an application user account and it
does not grant access to the EnvHub dashboard.

Echo uses a GitHub OIDC identity for production. Optional local development
uses separate machine identities.

## Production deployment identity

Create this in EnvHub under project `echo`, environment `production`:

| Field | Exact value |
| --- | --- |
| Type | GitHub Actions / OIDC |
| Name | `echo-github-production` |
| Audience | `envhub` |
| Repository ID | `1383221212` |
| Repository owner ID | `32062861` |
| Event | `push` |
| Git ref | Leave empty |
| GitHub Environment | `Production` |
| Reusable workflow reference | Leave empty |

The GitHub Environment is case-sensitive. Use `Production`, matching the
existing environment in `tresnaid/echo` and the workflow job.

The Git ref is intentionally empty because every backend release has a new tag.
The exact repository IDs, `push` event, and protected deployment environment
still scope the identity to this release job. If a reusable workflow is adopted
later, add its exact `job_workflow_ref` claim at that time.

At deployment time GitHub signs an OIDC assertion. EnvHub validates the claims
and returns a five-minute access token. The token is masked by GitHub Actions,
sent only to that SSH session, and is not stored as a GitHub Secret or VPS file.

## Local development identities

Create a separate EnvHub `development` environment first. Then create one
machine identity per person or device using names that make revocation obvious,
for example:

```text
echo-local-tresna-laptop
echo-local-ci-test-device
```

Each identity must be scoped to `echo/development`, never `echo/production`.
The token is displayed only once. Store it in the operating system credential
manager or another owner-only secret store, export it as `ENVHUB_TOKEN` only
for the development session, and never save it in Echo's files, shell history,
GitHub Secrets, or chat.

Example creation with an EnvHub administrator token already present in the
terminal:

```sh
envhub identity machine create \
  --server https://env.tresnaid.space \
  --project echo \
  --environment development \
  --name echo-local-tresna-laptop
```

Example use:

```sh
export ENVHUB_SERVER=https://env.tresnaid.space
export ENVHUB_TOKEN=ehm_your_development_token
envhub run -- pnpm --dir backend dev
```

## Identity lifecycle

- Create the smallest scope needed: one project and one environment.
- Use GitHub OIDC for GitHub Actions; do not replace it with a permanent machine
  token in repository secrets.
- Use a distinct machine identity for every local device so one device can be
  revoked without interrupting others.
- Revoke an identity immediately when a device is lost, a token may have been
  exposed, or an automation is retired.
- Confirm the replacement identity works before revoking a planned rotation.
- Review EnvHub audit events after setup and after each production release.

## Troubleshooting identity failures

An EnvHub `unauthorized` response normally means one of the registered claims
does not exactly match GitHub's assertion. Check, in order:

1. repository ID `1383221212`;
2. repository owner ID `32062861`;
3. event `push`;
4. GitHub Environment `Production`, including capitalization;
5. audience `envhub`;
6. that the identity has not been revoked.

Do not loosen the identity to all repositories or production environments to
work around a mismatch. Correct the exact field and rerun the failed workflow.
