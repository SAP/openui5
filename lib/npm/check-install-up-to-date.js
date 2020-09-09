const fs = require("fs");
const path = require("path");
const {exec} = require("child_process");
const command = "npm";
const args = [
    "i",
    "--dry-run",
    "--offline",
    "--no-fund",
    "--no-audit"
];

const yarnIntegrityPath = path.join(
    __dirname, "..", "..",
    "node_modules", ".yarn-integrity"
);
if (fs.existsSync(yarnIntegrityPath)) {
    // Do not run the check when yarn has been used for an install.
    // 'npm i --dry-run' doesn't work and yarn doesn't seem to provide an
    // equivalent solution.
    return;
}

exec(`${command} ${args.join(" ")}`, function(error, stdout, stderr) {
    if (error) {
        console.log("\nFailed to check whether npm install is up to date:");
        console.log(error);
    } else if (!/up to date/.test(stdout)) {
        let chalk;
        try {
            // Might be missing, but usually this script can't even be called
            // when no modules are installed at all (see package.json)
            chalk = require("chalk");
        } catch(err) {
            chalk = {};
            ["bold", "yellow", "cyan"]
                .forEach((fn) => chalk[fn] = ($) => $);
        }

        // Using short names to have the same length when used in template literals
        const warn = chalk.bold(chalk.yellow("WARNING"));
        const ni = chalk.bold(chalk.cyan("npm i"));
        const node_modu = chalk.bold("node_modules");

        const message = `
${chalk.yellow('┌─────────────────────────────────────────┐')}
${chalk.yellow('│')}                 ${warn}                 ${chalk.yellow('│')}
${chalk.yellow('│')}                                         ${chalk.yellow('│')}
${chalk.yellow('│')} npm install is not up to date!          ${chalk.yellow('│')}
${chalk.yellow('│')} Run ${ni} to update                     ${chalk.yellow('│')}
${chalk.yellow('│')}                                         ${chalk.yellow('│')}
${chalk.yellow('│')} If this warning persists, delete your   ${chalk.yellow('│')}
${chalk.yellow('│')} ${node_modu} folder and run ${ni} again ${chalk.yellow('│')}
${chalk.yellow('└─────────────────────────────────────────┘')}
`;
        console.log(message);
    }
});
