const opn = require("opn");
const projectPreprocessor = require("@ui5/project").projectPreprocessor;
const ui5Server = require("@ui5/server").server;

async function serve(dependencyTree) {
	// Process dependency tree
	const tree = await projectPreprocessor.processTree(dependencyTree);

	const openPath = process.env.OPENUI5_SRV_OPEN;
	const acceptRemoteConnections = !!process.env.OPENUI5_SRV_ACC_RMT_CON;
	const port = process.env.OPENUI5_SRV_PORT || 8080;

	return ui5Server.serve(tree, {
		port,
		changePortIfInUse: true,
		acceptRemoteConnections
	}).then(({port}) => {
		let browserUrl = "http://localhost:" + port;
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
	});
}

module.exports = {
	serve
}

