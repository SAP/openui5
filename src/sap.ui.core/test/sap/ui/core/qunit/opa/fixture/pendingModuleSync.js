sap.ui.define("fixture.PendingModuleSync", [
	"sap/ui/test/autowaiter/WaiterBase"
], function (WaiterBase) {
	"use strict";

	var PendingModule = WaiterBase.extend("fixture.PendingModuleSync");

	return new PendingModule();
});

