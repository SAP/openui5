/*!
 * ${copyright}
 */
sap.ui.define([
		'sap/ui/core/mvc/Controller'
	], function(Controller) {
	"use strict";

	var MainController = Controller.extend("sap.ui.core.sample.odata.v4.ListBinding.Main", {
		onBeforeRendering : function () {
			var oView = this.getView();

			function setTeamContext() {
				var oEmployees = oView.byId("Employees"),
					oTeamContext = oView.byId("TeamSelect").getBinding("items").getContexts()[0];

				oView.byId("TeamDetails").setBindingContext(oTeamContext);
				oEmployees.setBindingContext(oTeamContext);
				oEmployees.getBinding("items").attachEventOnce("change", setEmployeeContext);
			}

			function setEmployeeContext() {
				var oEmployeeContext = oView.byId("Employees").getBinding("items").getContexts()[0],
					oEmployeesControl = oView.byId("Employees");

				oView.byId("EmployeeEquipments").setBindingContext(oEmployeeContext);
				oEmployeesControl.setSelectedItem(oEmployeesControl.getItems()[0]);
			}

			//TODO: as long as there is no dataReceived event in V4 we attach to "change"
			oView.byId("TeamSelect").getBinding("items").attachEventOnce("change", setTeamContext);
		},

		onTeamSelect : function (oEvent) {
			var oView = this.getView(),
				oEmployeesControl = oView.byId("Employees"),
				oEmployeesBinding = oEmployeesControl.getBinding("items"),
				oTeamContext = oEvent.getParameters().selectedItem.getBindingContext();

			function setEquipmentContext() {
				var oEquipmentControl = oView.byId("EmployeeEquipments");
				oEquipmentControl.setBindingContext(oEmployeesBinding.getContexts()[0]);
				oEmployeesControl.setSelectedItem(oEmployeesControl.getItems()[0]);
			}

			oEmployeesControl.setBindingContext(oTeamContext);
			oEmployeesBinding.attachEventOnce("change", setEquipmentContext);
			oView.byId("TeamDetails").setBindingContext(oTeamContext);
		},
		onEmployeeSelect : function (oEvent) {
			var oContext = oEvent.getParameters().listItem.getBindingContext();
			this.getView().byId("EmployeeEquipments").setBindingContext(oContext);
		}
	});

	return MainController;

});