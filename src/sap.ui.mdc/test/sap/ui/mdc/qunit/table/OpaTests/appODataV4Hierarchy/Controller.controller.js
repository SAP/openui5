sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(Controller) {
	"use strict";

	return Controller.extend("sap.ui.mdc.table.OpaTests.appODataV4Hierarchy.Controller", {
		onInit: function() {
			window.oTable = this.getView().byId("mdcTable");
		}
	});
});