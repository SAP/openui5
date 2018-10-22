/* eslint-env node */
/* eslint-disable no-console */
if (process.env.npm_config_user_agent && !process.env.npm_config_user_agent.includes("yarn")) {
    console.error("===========================================================================");
    console.error(">> NOTE: This project uses Yarn. Please see: ");
    console.error(">> https://github.com/SAP/openui5/blob/master/docs/developing.md");
    console.error("===========================================================================");
    console.error("");
}
