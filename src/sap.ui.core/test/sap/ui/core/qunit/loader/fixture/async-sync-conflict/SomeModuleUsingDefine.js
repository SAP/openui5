sap.ui.define([], function() {
	"use strict";
	window.fixture["async-sync-conflict"].executions++;
	return window.fixture["async-sync-conflict"].EXPECTED_EXPORT;
});
window.fixture["async-sync-conflict"].externalModuleLoaded = true;
