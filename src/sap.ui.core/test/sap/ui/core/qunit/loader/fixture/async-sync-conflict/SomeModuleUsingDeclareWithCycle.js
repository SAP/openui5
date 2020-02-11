/*eslint strict: [2, "global"] */
"use strict";
function jQuerySapDeclare(module) {
	module = module.replace(/\./g, "/") + ".js";
	sap.ui.loader._.declareModule(module);
}

jQuerySapDeclare("fixture.async-sync-conflict.SomeModuleUsingDeclareWithCycle");
window.fixture["async-sync-conflict"].executions++;
window.fixture["async-sync-conflict"].SomeModuleUsingDeclareWithCycle = window.fixture["async-sync-conflict"].EXPECTED_EXPORT;
window.fixture["async-sync-conflict"].externalModuleLoaded = true;
sap.ui.requireSync("fixture/async-sync-conflict/SomeModuleUsingDeclareWithCycle");
