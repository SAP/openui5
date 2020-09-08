sap.ui.define("fixture.ModuleWaiter", [
	"sap/ui/test/autowaiter/WaiterBase"
], function (WaiterBase) {
	"use strict";

	var ModuleWaiter = WaiterBase.extend("fixture.ModuleWaiter");
	return new ModuleWaiter();
});
