#!/usr/bin/env node

import { execSync } from "child_process";
import { existsSync, copyFile } from "fs";
import { config } from "dotenv";
import { fileURLToPath } from "url";
import * as path from "path";

console.log(process.argv);

function appIsRunning() {
  // If `docker compose ps -q` returns nothing then no containers are running, and
  // nothing should execute unless it's being passed to the docker-compose binary
  if (execSync(`${DOCKER_COMPOSE} ps -q`).toString().length == 0) {
    console.error("The container is not running.");
    console.error("Bring the container up with npx nuxi-docker up -d");
    process.exit(1);
  }
}

function help() {
  console.log("nuxi-docker - a preconfigured docker environment to interact with nuxt projects with the nuxi cli");
  console.log("");
  console.log("QUICK START");
  console.log("to bring the containers up:");
  console.log("    npx nuxi-docker up -d");
  console.log("");
  console.log("to start the dev site:");
  console.log("    npx nuxi-docker dev");
  console.log("");
  console.log("add, analyze, build-module, cleanup, dev, devtools, generate, info, init, prepare, preview, typecheck, and upgrade are proxied straight to nuxi in the app container:");
  console.log("    npx nuxi-docker <COMMAND> [args]");
  console.log("");
  console.log("nuxi-build (to avoid collision with docker-compose build) runs nuxi build in the app container:");
  console.log("    npx nuxi-docker nuxi-build [args]");
  console.log("");
  console.log("nuxi, nuxt, node, npm, npx, yarn, pnpm, pnpx, bun, bunx are proxied to the binaries in the app container:");
  console.log("    npx nuxi-docker <COMMAND> [args]");
  console.log("");
  console.log("shell/bash initiates a terminal in the app container:");
  console.log("    npx nuxi-docker shell");
  console.log("");
  console.log("postgres proxies commands to the postgres container:");
  console.log("    npx nuxi-docker postgres [args]");
  console.log("");
  console.log("postgres shell/bash initiates a terminal in the postgres container:");
  console.log("    npx nuxi-docker postgres shell");
  console.log("");
  console.log("psql opens a postgres cli terminal in the postgres container:");
  console.log("    npx nuxi-docker psql");
  console.log("");
  console.log("anything else is proxied to docker-compose");
  process.exit(0);
}

function composeFileExists(composeFilename) {
  // Check if the Docker Compose file exists
  if (!existsSync(composeFilename)) {
    console.error(`Unable to find Docker Compose file: '${composeFilename}'`);
    process.exit(1);
  }
}

if (process.argv.length < 3) {
  help();
}

const __dirname = path.join(fileURLToPath(import.meta.url), "..", "..");

// Define Docker Compose command prefix
let DOCKER_COMPOSE;
try {
  execSync("docker compose", { stdio: "ignore" });
  DOCKER_COMPOSE = "docker compose";
} catch (error) {
  DOCKER_COMPOSE = "docker-compose";
}

// init command
if (process.argv[2] === "init") {
  const PROJECT_DIRECTORY = path.join(
    process.argv.length > 3 ? process.argv[3] : "nuxt-app"
  );
  const PARENT_DIRECTORY = process.cwd();
  console.log(__dirname);
  const COMPOSE_FILE = path.join(
    __dirname,
    "docker",
    "docker-compose.init.yml"
  );
  composeFileExists(COMPOSE_FILE);

  const env_variables = [
    `PROJECT_DIRECTORY="${PROJECT_DIRECTORY}"`,
    `PARENT_DIRECTORY="${PARENT_DIRECTORY}"`,
    `DOCKER_USER_UID=$UID`,
    `DOCKER_USER_GID=$GID`,
  ];

  const base_args = [DOCKER_COMPOSE, "-f", COMPOSE_FILE];

  try {
    execSync(
      `${env_variables.join(" ")} ${base_args.join(" ")} run nuxt-app-init`,
      { stdio: "inherit" }
    );
  } catch (err) {
    throw err;
  }

  for (const filename of ["docker-compose.yml", "Dockerfile", ".env"]) {
    copyFile(
      path.join(__dirname, "docker", filename),
      path.join(PARENT_DIRECTORY, PROJECT_DIRECTORY, filename),
      (err) => {
        if (err) throw err;
      }
    );
  }

  console.log("--------------------------------------");
  console.log("");
  console.log("init complete!");
  console.log("");
  console.log("enter the project directory:");
  console.log(`    cd ${PROJECT_DIRECTORY}`);
  console.log("");
  console.log("to bring the containers up:");
  console.log("    npx nuxi-docker up -d");
  console.log("");
  console.log("to start the dev site:");
  console.log("    npx nuxi-docker dev");
  console.log("");
  console.log("--------------------------------------");

  process.exit(1);
}

config();

const COMPOSE_FILE = "docker-compose.yml";

// Check if the Docker Compose file exists
composeFileExists(COMPOSE_FILE);

const base_args = [DOCKER_COMPOSE, "-f", COMPOSE_FILE];
const args = [];

switch (process.argv[2]) {
  // Help!
  case "help":
    help();
    break;

  // Intercept some nuxi commands and proxy them to the nuxi cli on the app container
  case "add":
  case "analyze":
  case "build-module":
  case "cleanup":
  case "dev":
  case "devtools":
  case "generate":
  case "info":
  case "prepare":
  case "preview":
  case "typecheck":
  case "upgrade":
    appIsRunning();
    args.push("exec", "nuxt-app", "npx", "nuxi", ...process.argv.slice(2));
    break;

  // Proxy build to the nuxi cli on the app container
  case "nuxi-build":
    appIsRunning();
    args.push(
      "exec",
      "nuxt-app",
      "npx",
      "nuxi",
      "build",
      ...process.argv.slice(2)
    );
    break;

  // Proxy commands to the nuxi cli on the application container
  case "nuxi":
    appIsRunning();
    args.push("exec", "nuxt-app", "npx", "nuxi", ...process.argv.slice(3));
    break;

  // Proxy commands to appropriate binaries and applications on the application container
  case "nuxt":
  case "node":
  case "npm":
  case "npx":
  case "yarn":
  case "pnpm":
  case "pnpx":
  case "bun":
  case "bunx":
    appIsRunning();
    args.push("exec", "nuxt-app", process.argv[2], ...process.argv.slice(3));
    break;

  // Initiate a PostgreSQL CLI terminal session within the postgres container
  case "psql":
    appIsRunning();
    args.push(
      "exec",
      "postgres",
      "bash",
      "-c",
      `"PGPASSWORD=${process.env.POSTGRES_PASSWORD} psql -U ${process.env.POSTGRES_USER} ${process.env.POSTGRES_DATABASE}"`
    );
    break;

  // Initiate a shell within the application container
  case "shell":
  case "bash":
    appIsRunning();
    args.push("exec", "nuxt-app", "/bin/sh", ...process.argv.slice(3));
    break;

  // Proxy commands to the postgres container
  case "postgres":
    appIsRunning();
    args.push("exec", "postgres");

    switch (process.argv[3]) {
      // Initiate a Bash shell within the postgres container
      case "shell":
      case "bash":
        args.push("/bin/sh", ...process.argv.slice(4));
        break;

      // Proxy the rest of the command to the postgres container
      default:
        args.push(...process.argv.slice(3));
        break;
    }
    break;

  // Proxy anything else to docker-compose
  default:
    args.push(...process.argv.slice(2));
    break;
}

// Run Docker Compose with the defined arguments
try {
  execSync(`${base_args.join(" ")} ${args.join(" ")}`, { stdio: "inherit" });
} catch (err) {
  console.error("");
  console.error("nuxi-docker: failed to execute this command:");
  console.error(`    ${base_args.join(" ")} ${args.join(" ")}`);
  console.error("");
  console.error("npx nuxi-docker help for a list of valid commands");
}
