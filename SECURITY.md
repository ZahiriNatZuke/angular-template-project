# Security Policy

## Reporting a vulnerability

Use GitHub's **private vulnerability reporting** — the *Security* tab of this repository,
*Report a vulnerability*. It is a private channel: the report stays out of public view while a
fix is worked on.

**Do not open a public issue** for anything exploitable.

You will get a reply as soon as possible. This is maintained by one person in their own time, so
there is no guaranteed turnaround.

## What this repository is

A **template**, not a deployed service. The real risk is not a server of ours that someone could
attack — it is what propagates: every project started from here inherits these decisions. A weak
default in the template becomes a weak default in every project built on it, and fixing it here
does not fix the ones already shipped.

So reports are especially welcome about:

- **Authentication** — session handling, token storage and refresh, and the route guards.
- **Anything that reaches the DOM** — a path where user input could end up rendered unescaped.
- **Content Security Policy and headers** — the configuration that ships by default.
- **The build and CI pipeline**, and anything running with the workflow token.
- **Dependencies** wired into the template itself, as opposed to a transitive advisory that
  Dependabot already tracks.

## When using the template

- Never commit real secrets. The repository has secret scanning with *push protection*, and CI
  runs gitleaks over the full history — but that is a safety net, not a licence to be careless.
- Replace **every** example credential before exposing anything: whatever ships here is public
  by definition.
- Review the CSP, CORS and cookie settings for your deployment. What ships is sensible for
  development, not a production configuration you can adopt unchanged.
