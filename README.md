# Nuxi-Docker

Nuxi-Docker is a preconfigured Docker development environment tailored to streamline interaction with Nuxt.js projects using the Nuxi CLI.

## Installation

### Creating a New Project

To create a new Nuxt.js project and set it up within the Nuxi-Docker environment:

```bash
npx nuxi-docker init <PROJECT>
```

This command automates project creation by executing `nuxi init <PROJECT>` and copying the necessary Docker configurations for the new project.

### Installing Nuxi-Docker in an Existing Nuxt Project

If you already have an existing Nuxt.js project and want to integrate it with the Nuxi-Docker environment, you can use the `install` command:

```bash
npx nuxi-docker install
```

This command sets up the necessary configurations and Docker environment within your current Nuxt project.

## Usage

### Commands Proxied to Nuxi

The following commands are proxied directly to Nuxi in the app container:

- `add`
- `analyze`
- `build-module`
- `cleanup`
- `dev`
- `devtools`
- `generate`
- `info`
- `init`
- `prepare`
- `preview`
- `typecheck`
- `upgrade`

To use these commands, execute:

```bash
npx nuxi-docker <COMMAND> [args]
```

### Nuxi Build

To avoid collision with Docker Compose's `build`, use `nuxi-build` to run Nuxi's build in the app container:

```bash
npx nuxi-docker nuxi-build [args]
```

### Commands proxied to binaries in the app container

The commands `nuxi`, `nuxt`, `node`, `npm`, `npx`, `yarn`, `pnpm`, `pnpx`, `bun`, and `bunx` are proxied to the binaries in the app container. Use them by running:

```bash
npx nuxi-docker <COMMAND> [args]
```

### Shell Access

Initiate a terminal in the app container using:

```bash
npx nuxi-docker shell
```

### Postgres Operations

Commands prefixed with `postgres` are forwarded to the Postgres container:

- `npx nuxi-docker postgres [args]`: Execute Postgres-related commands.
- `npx nuxi-docker postgres shell`: Initiate a terminal in the Postgres container.
- `npx nuxi-docker psql`: Open a Postgres CLI terminal in the Postgres container.

### Docker Compose Proxy

Any other command is proxied to Docker Compose.
