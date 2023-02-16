import opn from "opn";
import {graphFromPackageDependencies} from "@ui5/project/graph";
import * as ui5Server from "@ui5/server";

export async function serve({cwd}) {
	const graph = await graphFromPackageDependencies({
		cwd,
		workspaceName: "default" // default value passed by CLI command
	});

	const openPath = process.env.OPENUI5_SRV_OPEN;
	const acceptRemoteConnections = !!process.env.OPENUI5_SRV_ACC_RMT_CON;
	const testCsp = !!process.env.OPENUI5_SRV_CSP;

	let port = 8080;
	let changePortIfInUse = true;
	if (process.env.OPENUI5_SRV_PORT) {
		port = parseInt(process.env.OPENUI5_SRV_PORT);
		changePortIfInUse = false;
	}

	return ui5Server.serve(graph, {
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
