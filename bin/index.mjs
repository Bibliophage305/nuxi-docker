#!/usr/bin/env node

import { execSync } from "child_process";
import { existsSync, copyFile } from "fs";
import { config } from "dotenv";
import { fileURLToPath } from "url";
import * as path from "path";

function help() {
  console.log("");
  console.log("nuxi-docker - a preconfigured docker environment to interact with Nuxt projects using the Nuxi CLI");
  console.log("");
  console.log("QUICK START");
  console.log("Start a new project:");
  console.log("    npx nuxi-docker init <PROJECT>");
  console.log("Or install in an existing project:");
  console.log("    npx nuxi-docker install");
  console.log("Bring up the containers:");
  console.log("    npx nuxi-docker up -d");
  console.log("");
  console.log("Start the development site:");
  console.log("    npx nuxi-docker dev");
  console.log("");
  console.log("INITIALISATION");
  console.log("To create a new Nuxt.js project and set it up within the Nuxi-Docker environment:");
  console.log("    npx nuxi-docker init <PROJECT>");
  console.log("");
  console.log("INSTALLATION");
  console.log("To integrate Nuxi-Docker into an existing Nuxt.js project:");
  console.log("    npx nuxi-docker install");
  console.log("");
  console.log("COMMANDS PROXIED TO NUXI");
  console.log("The following commands are proxied directly to Nuxi in the app container:");
  console.log("    add, analyze, build-module, cleanup, dev, devtools, generate, info, init, prepare, preview, typecheck, and upgrade");
  console.log("Usage:");
  console.log("    npx nuxi-docker <COMMAND> [args]");
  console.log("");
  console.log("NUXI BUILD");
  console.log("To run Nuxi's build command in the app container (useful to avoid collision with docker-compose build):");
  console.log("    npx nuxi-docker nuxi-build [args]");
  console.log("");
  console.log("COMMANDS PROXIED TO BINARIES IN THE APP CONTAINER");
  console.log("The commands 'nuxi', 'nuxt', 'node', 'npm', 'npx', 'yarn', 'pnpm', 'pnpx', 'bun', and 'bunx' are proxied to the binaries in the app container.");
  console.log("Usage:");
  console.log("    npx nuxi-docker <COMMAND> [args]");
  console.log("");
  console.log("SHELL ACCESS");
  console.log("Initiate a terminal in the app container:");
  console.log("    npx nuxi-docker shell");
  console.log("");
  console.log("POSTGRES OPERATIONS");
  console.log("Commands prefixed with 'postgres' are forwarded to the Postgres container:");
  console.log("    npx nuxi-docker postgres [args]");
  console.log("    npx nuxi-docker postgres shell");
  console.log("    npx nuxi-docker psql");
  console.log("");
  console.log("DOCKER COMPOSE PROXY");
  console.log("Any other command is proxied to Docker Compose.");
  console.log("");
  process.exit(0);
}

if (process.argv.length < 3) {
  help();
}

if (process.argv[2] == "help") {
  help();
}

function composeFileExists(composeFilename) {
  // Check if the Docker Compose file exists
  if (!existsSync(composeFilename)) {
    console.error(`Unable to find Docker Compose file: '${composeFilename}'`);
    process.exit(1);
  }  
}

// Define Docker Compose command prefix
let DOCKER_COMPOSE;
try {
  execSync("docker compose", { stdio: "ignore" });
  DOCKER_COMPOSE = "docker compose";
} catch (error) {
  DOCKER_COMPOSE = "docker-compose";
}

const __dirname = path.join(fileURLToPath(import.meta.url), "..", "..");
const DOCKERFILE_DIRECTORY = path.join(__dirname, "docker");

const env_variables = [
  `DOCKERFILE_DIRECTORY="${DOCKERFILE_DIRECTORY}"`,
];

// install command
if (process.argv[2] == "install") {
  const PROJECT_DIRECTORY = process.cwd();
  const COMPOSE_FILENAME = "docker-compose.yml";
  const files_to_copy = [];
  if (existsSync(path.join(PROJECT_DIRECTORY, COMPOSE_FILENAME))) {
    console.log(`${COMPOSE_FILENAME} already exists in this project`);
    process.exit(1);
  }
  files_to_copy.push(COMPOSE_FILENAME);
  if (existsSync(path.join(PROJECT_DIRECTORY, ".env"))) {
    console.log(".env already exists in this project, skipping");
  } else {
    files_to_copy.push(".env");
  }

  for (const filename of files_to_copy) {
    copyFile(
      path.join(__dirname, "docker", filename),
      path.join(PROJECT_DIRECTORY, filename),
      (err) => {
        if (err) throw err;
      }
    );
  }

  console.log("--------------------------------------");
  console.log("");
  console.log("install complete!");
  console.log("");
  console.log("to bring the containers up:");
  console.log("    npx nuxi-docker up -d");
  console.log("");
  console.log("to start the dev site:");
  console.log("    npx nuxi-docker dev");
  console.log("");
  console.log("--------------------------------------");

  process.exit(0);
}

// init command
if (process.argv[2] === "init") {
  console.log("")
  console.log("welcome to nuxi-docker")
  console.log("")
  console.log("building the init container then passing you to nuxi init")
  console.log("")
  const PROJECT_DIRECTORY = path.join(
    process.argv.length > 3 ? process.argv[3] : "nuxt-app"
  );
  const PARENT_DIRECTORY = process.cwd();
  const COMPOSE_FILE = path.join(
    __dirname,
    "docker",
    "docker-compose.init.yml"
  );
  composeFileExists(COMPOSE_FILE);

  env_variables.push(
    `PROJECT_DIRECTORY="${PROJECT_DIRECTORY}"`,
    `PARENT_DIRECTORY="${PARENT_DIRECTORY}"`,
    `DOCKER_USER_UID=$UID`,
    `DOCKER_USER_GID=$GID`,
  );

  const BASE_ARGS = [DOCKER_COMPOSE, "-f", COMPOSE_FILE];

  try {
    execSync(
      `${env_variables.join(" ")} ${BASE_ARGS.join(" ")} run nuxt-app-init`,
      { stdio: "inherit" }
    );
  } catch (err) {
    throw err;
  }

  for (const filename of ["docker-compose.yml", ".env"]) {
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

const BASE_ARGS = [DOCKER_COMPOSE, "-f", COMPOSE_FILE];

const args = [];

function appIsRunning() {
  // If `docker compose ps -q` returns nothing then no containers are running, and
  // nothing should execute unless it's being passed to the docker-compose binary
  if (execSync(`${env_variables.join(" ")} ${BASE_ARGS.join(" ")} ps -q`).toString().length == 0) {
    console.error("The container is not running.");
    console.error("Bring the container up with npx nuxi-docker up -d");
    process.exit(1);
  }
}

switch (process.argv[2]) {

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
  execSync(`${env_variables.join(" ")} ${BASE_ARGS.join(" ")} ${args.join(" ")}`, { stdio: "inherit" });
} catch (err) {
  console.error("");
  console.error("nuxi-docker: failed to execute this command:");
  console.error(`    ${BASE_ARGS.join(" ")} ${args.join(" ")}`);
  console.error("");
  console.error("npx nuxi-docker help for a list of valid commands");
}
