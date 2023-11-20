/**
 * Initialization Code and shared classes of library sap.ui.synctestlib (0.0.1)
 */
jQuery.sap.declare("sap.ui.synctestlib.library");
jQuery.sap.require("sap.ui.core.Core");
// library dependencies
jQuery.sap.require("sap.ui.core.library");

// delegate further initialization of this library to the Core
sap.ui.getCore().initLibrary({
	name : "sap.ui.synctestlib",
	dependencies : ["sap.ui.core"],
	types: [
	],
	interfaces: [
	],
	controls: [
		"sap.ui.synctestlib.TestButton"
	],
	elements: [
	],
	version: "0.0.1"
});

