sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/mdc/p13n/StateUtil"
], function(Controller, StateUtil) {
	"use strict";

	return Controller.extend("sap.ui.mdc.tableOpaTests.appMDCTreeTableV4.Controller", {
		onInit: function() {
			StateUtil.attachStateChange(this._onStateChange.bind(this));
		},

		_onStateChange: function(oEvent) {
			var oMdcControl = oEvent.getParameter("control");

			StateUtil.retrieveExternalState(oMdcControl).then(function(oState) {
				var oOutput = this.getView().byId("CEretrieveTableState");
				if (oOutput) {
					oOutput.setValue(JSON.stringify(oState, null, "  "));
				}
			}.bind(this));
		}
	});
});