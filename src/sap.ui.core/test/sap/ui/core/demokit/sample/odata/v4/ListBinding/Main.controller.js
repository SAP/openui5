/*!
 * ${copyright}
 */
sap.ui.define([
		'sap/ui/core/mvc/Controller'
	], function(Controller) {
	"use strict";

	var MainController = Controller.extend("sap.ui.core.sample.odata.v4.ListBinding.Main", {
		onBeforeRendering : function () {
			var oBinding = this.getView().byId("TeamSelect").getBinding("items"),
				oTeamDetails = this.getView().byId("TeamDetails");

			function setInitialContext() {
				oTeamDetails.setBindingContext(oBinding.getContexts()[0]);
			}


			if (oBinding.getContexts().length){
				setInitialContext();
				return;
			}
			//TODO: there is no dataReceived event in V4!?, hence we attach to "change"
			oBinding.attachEventOnce("change", setInitialContext, this);
		},

		onEmployeeSelect : function (oEvent) {
			var oContext = oEvent.getParameters().listItem.getBindingContext();
			this.getView().byId("EmployeeEquipments").setBindingContext(oContext);
		},

		onTeamSelect : function (oEvent) {
			var oContext = oEvent.getParameters().selectedItem.getBindingContext();

			this.getView().byId("Employees").setBindingContext(oContext);
			this.getView().byId("TeamDetails").setBindingContext(oContext);
			this.getView().byId("EmployeeEquipments").setBindingContext();
			// TODO: is that best practice to clean up the equipment table??
			this.getView().byId("EmployeeEquipments").getBinding("items").refresh();
		}
	});

	return MainController;

});