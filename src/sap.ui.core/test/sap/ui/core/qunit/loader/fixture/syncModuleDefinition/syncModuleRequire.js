/* global sap */

sap.ui.loader.config({
	paths: {
		"fixture": "./fixture"
	}
});
sap.ui.requireSync("fixture/syncModuleDefinition/moduleDefinition");
