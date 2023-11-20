/*eslint strict: [2, "global"] */
"use strict";
jQuery.sap.require("sap.ui.core.library");
jQuery.sap.require("fixture.async-sync-conflict_legacyAPIs.library-using-AMD.library");

sap.ui.getCore().initLibrary({
	name: "fixture.async-sync-conflict_legacyAPIs.library-using-require-declare",
	dependencies: ["sap.ui.core","fixture.async-sync-conflict_legacyAPIs.library-using-AMD"]
});