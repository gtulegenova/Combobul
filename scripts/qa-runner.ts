import { spawnSync } from "node:child_process";

type CliOptions = {
  list: boolean;
  openReport: boolean;
  tags?: string;
  project?: string;
  grep?: string;
  config?: string;
  env?: string;
  headed: boolean;
};

function parseArgs(argv: string[]): CliOptions {
  const args = new Set(argv);
  const getValue = (flag: string): string | undefined => {
    const index = argv.indexOf(flag);
    return index >= 0 ? argv[index + 1] : undefined;
  };

  return {
    list: args.has("--list"),
    openReport: args.has("--open-report"),
    tags: getValue("--tags"),
    project: getValue("--project"),
    grep: getValue("--grep"),
    config: getValue("--config"),
    env: getValue("--env"),
    headed: args.has("--headed"),
  };
}

function runCommand(
  command: string,
  commandArgs: string[],
  env: NodeJS.ProcessEnv = process.env,
): number {
  const result = spawnSync(command, commandArgs, { stdio: "inherit", shell: false, env });
  return result.status ?? 1;
}

// Resolve a named environment (for example --env staging) to the matching
// BASE_URL_<NAME> variable so QA can switch targets without editing .env.
function resolveEnv(options: CliOptions): NodeJS.ProcessEnv {
  const childEnv: NodeJS.ProcessEnv = { ...process.env };

  if (options.env) {
    const key = `BASE_URL_${options.env.toUpperCase()}`;
    const resolved = process.env[key];

    if (resolved) {
      childEnv.BASE_URL = resolved;
    } else {
      // eslint-disable-next-line no-console
      console.warn(`--env "${options.env}" requested but ${key} is not set. Falling back to BASE_URL.`);
    }
  }

  return childEnv;
}

function buildPlaywrightArgs(options: CliOptions): string[] {
  const args = ["playwright", "test"];

  if (options.list) {
    args.push("--list");
  }

  if (options.project) {
    args.push("--project", options.project);
  }

  if (options.tags) {
    args.push("--grep", options.tags);
  }

  if (options.grep) {
    args.push("--grep", options.grep);
  }

  if (options.config) {
    args.push("--config", options.config);
  }

  if (options.headed) {
    args.push("--headed");
  }

  return args;
}

function printHelp(): void {
  // eslint-disable-next-line no-console
  console.log(`
QA Runner (prototype)

Usage:
  npm run qa:runner -- [options]

Options:
  --list                  List tests without running them
  --project <name>        Run a specific Playwright project
  --tags <pattern>        Apply tag-based grep pattern (example: "@smoke|@mobile")
  --grep <pattern>        Generic grep pattern for test names
  --config <file>         Use a custom Playwright config file
  --env <name>            Target a named environment via BASE_URL_<NAME> (example: staging)
  --headed                Run in headed mode
  --open-report           Open the HTML report after execution
  --help                  Show this help
`);
}

function main(): void {
  const argv = process.argv.slice(2);
  if (argv.includes("--help")) {
    printHelp();
    return;
  }

  const options = parseArgs(argv);
  const childEnv = resolveEnv(options);
  const exitCode = runCommand("npx", buildPlaywrightArgs(options), childEnv);

  if (options.openReport) {
    runCommand("npx", ["playwright", "show-report"], childEnv);
  }

  process.exit(exitCode);
}

main();
