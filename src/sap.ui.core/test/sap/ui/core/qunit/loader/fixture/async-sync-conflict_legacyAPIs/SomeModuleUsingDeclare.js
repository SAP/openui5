/*eslint strict: [2, "global"] */
/* eslint-disable no-implicit-globals */
"use strict";
function jQuerySapDeclare(module) {
	module = module.replace(/\./g, "/") + ".js";
	sap.ui.loader._.declareModule(module);
}

jQuerySapDeclare("fixture.async-sync-conflict_legacyAPIs.SomeModuleUsingDeclare");
window.fixture["async-sync-conflict_legacyAPIs"].executions++;
window.fixture["async-sync-conflict_legacyAPIs"].SomeModuleUsingDeclare = window.fixture["async-sync-conflict_legacyAPIs"].EXPECTED_EXPORT;
window.fixture["async-sync-conflict_legacyAPIs"].externalModuleLoaded = true;
