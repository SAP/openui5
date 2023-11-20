sap.ui.define("fixture.PendingModuleAsync", [
	"sap/ui/test/autowaiter/WaiterBase"
], function (WaiterBase) {
	"use strict";

	var PendingModule = WaiterBase.extend("fixture.PendingModuleAsync");

	return new PendingModule();
});
