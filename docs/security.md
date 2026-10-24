# Application security and deployment

The API is intended to sit behind an HTTPS reverse proxy. Keep the backend's
published port bound to `127.0.0.1`, and keep Redis unpublished. The frontend's
browser requests must still be able to reach the public HTTPS API endpoint.

## Origins and authentication

The default allowed origin is the hosted frontend,
`https://embeddings.reiniss.com`. Forks and other deployments should explicitly
configure their own frontend origins. Production environment overrides can use:

```dotenv
APP_DEBUG=False
APP_CORS_ORIGINS=["https://frontend.example.com"]
APP_CLERK_AUTHORIZED_PARTIES=["https://frontend.example.com"]
```

These are JSON arrays of exact origins without trailing slashes, paths,
credentials, or wildcards. The `.env.example` file includes local development
origins; replace those for production and add preview origins deliberately.

CORS limits which browser origins may read responses. It does not authenticate
clients or prevent direct HTTP requests. Clerk validates authentication tokens,
including their authorized-party origin, and requests must identify a user.
The frontend sends its token using the `Authorization` header; cross-origin
cookie credentials are not enabled.

Visualization requests require Redis-backed rate limiting. If Redis is disabled
or unavailable, requests return HTTP 503 with a retry hint rather than allowing
unlimited computation. Excess requests return HTTP 429. Counter increments and
expiry are atomic, including recovery of counters missing an expiry. Existing
payload limits remain 100 texts per request and 100 characters per text.

Unexpected processing errors are logged on the server, while clients receive a
generic error. Configuration errors omit input values to reduce accidental
exposure of secrets in startup diagnostics.

## Container configuration

The backend runs as UID/GID 10001. Application files are owned by root and cannot
be modified by the application user. Linux capabilities are dropped and
`no-new-privileges` is enabled. Do not mount the Docker socket or host credentials
into the container.

The `model_cache` volume persists downloaded models at
`/home/app/.cache/huggingface`. A separate writable directory is used for Numba's
cache. For an existing deployment, populate the new model volume from a trusted
cache or allow a first-run download. Ensure the volume is writable by UID 10001
and test model loading before switching production traffic.

Compose caps the backend at 768 MiB RAM, 896 MiB RAM plus swap, and 128 processes
or threads. Adjust these values for the host and workload. The image completed a
six-text embedding and PCA/t-SNE/UMAP smoke test within the RAM cap. These limits
bound resource use; exhausting the allocation can still terminate the backend.
Build images and run the full test suite on a development or CI machine instead
of a resource-constrained production host.

Docker-published ports can bypass host UFW rules. Preserve the explicit localhost
binding for port 8000 and do not publish Redis. The container health check uses
the API's health endpoint.

## Network and host controls

Manage host-specific accounts, addresses, keys, firewall attachments, and recovery
instructions privately. A typical production arrangement is:

| Traffic | Policy | Purpose |
| --- | --- | --- |
| Public web | HTTPS through a reverse proxy | Keep the API available to visitors. |
| Administration | SSH keys through a private network | Reduce exposure of administrative services. |
| Databases and backend ports | Private only | Prevent direct internet access. |
| Other inbound traffic | Deny unless required | Limit accidental service exposure. |

If using Cloudflare, consider restricting origin web ports to its current
published IPv4 and IPv6 ranges after reviewing certificate renewal and monitoring
requirements. Maintain the allowlist as those ranges change. Cloudflare networks
are shared, so source allowlisting does not replace application authentication
or prove that traffic came through a particular Cloudflare account.

Use TLS 1.2/1.3 and validate the proxy-to-origin connection. Preserve essential
ICMP/ICMPv6 and outbound connectivity needed for DNS, authentication, updates,
model downloads, and any private-network service. Test replacement administrative
access and provider-console recovery before removing an existing access route.

## Deployment verification and rollback

Keep real environment files, private keys, provider identifiers, operational
logs, and personal network policies out of the public repository. The tracked
`.env.docker` contains only non-secret Docker defaults, and `ui/.env.local`
contains only the public API URL. Do not add secrets to these tracked files:
ignore rules do not protect files that Git already tracks. Store production
secrets separately, with restricted filesystem permissions.

Before deployment, preserve the previous image and configuration privately.
Validate Compose and reverse-proxy configuration, then verify:

- Public API health returns HTTP 200.
- The configured frontend's POST preflight succeeds; unrelated origins fail.
- Unauthenticated visualization requests return HTTP 401.
- A signed-in browser can generate a visualization.
- Redis failures reject work with HTTP 503; excess requests return HTTP 429.
- The non-root container can load its model and run all reductions.
- Health checks pass and internal ports remain private.

To roll back, restore the previous image and matching configuration, then recreate
only the backend with `docker compose up -d --no-deps --no-build backend`.
Preserve Redis and model volumes; do not use `docker compose down -v` for rollback.

Apply host updates in a maintenance window with recovery access available.
Container images and Python/JavaScript dependencies need separate updates; host
automatic updates do not update application images or dependencies.
