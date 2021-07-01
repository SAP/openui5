const opn = require("opn");
const projectPreprocessor = require("@ui5/project").projectPreprocessor;
const ui5Server = require("@ui5/server").server;

async function serve(dependencyTree) {
	// Process dependency tree
	const tree = await projectPreprocessor.processTree(dependencyTree);

	const openPath = process.env.OPENUI5_SRV_OPEN;
	const acceptRemoteConnections = !!process.env.OPENUI5_SRV_ACC_RMT_CON;
	const testCsp = !!process.env.OPENUI5_SRV_CSP;

	let port = 8080;
	let changePortIfInUse = true;
	if (process.env.OPENUI5_SRV_PORT) {
		port = parseInt(process.env.OPENUI5_SRV_PORT);
		changePortIfInUse = false;
	}

	return ui5Server.serve(tree, {
		port,
		changePortIfInUse,
		acceptRemoteConnections,
		sendSAPTargetCSP: testCsp ? {
			defaultPolicy: "sap-target-level-1",
			defaultPolicyIsReportOnly: true,
			defaultPolicy2: "sap-target-level-3",
			defaultPolicy2IsReportOnly: true
		} : false,
		serveCSPReports: testCsp
	}).then((server) => {
		let browserUrl = "http://localhost:" + server.port;
		console.log("TestSuite server started");
		if (acceptRemoteConnections) {
			console.log("Accepting remote connections");
		}

		if (openPath) {
			let relPath = openPath;
			if (!relPath.startsWith("/")) {
				relPath = "/" + relPath;
			}
			browserUrl += relPath;
			console.log(`Opening ${browserUrl} in your default browser...`);
			opn(browserUrl);
		} else {
			console.log(`URL: ${browserUrl}`);
		}

		return server;
	});
}

module.exports = {
	serve
};
