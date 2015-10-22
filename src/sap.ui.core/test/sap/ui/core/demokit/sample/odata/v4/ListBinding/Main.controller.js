/*!
 * ${copyright}
 */
sap.ui.define([
		'sap/m/Dialog',
		'sap/m/MessageBox',
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel',
		'sap/ui/model/odata/ODataUtils',
		'sap/ui/model/odata/v4/_ODataHelper',
		"sap/ui/thirdparty/odatajs-4.0.0"
	], function(Dialog, MessageBox, Controller, JSONModel, ODataUtils, _ODataHelper, Olingo) {
	"use strict";
//	/*global odatajs */

	function onRejected(oError) {
		MessageBox.alert(oError.message, {
			icon: sap.m.MessageBox.Icon.ERROR,
			title: oError.isConcurrentModification
				? "Concurrent Modification"
				: "Unknown Error"
		});
	}

	var MainController = Controller.extend("sap.ui.core.sample.odata.v4.ListBinding.Main", {
		onBeforeRendering : function () {
			var oView = this.getView();

			oView.setBusy(true);

			function setTeamContext() {
				var oEmployees = oView.byId("Employees"),
					oTeamContext = oView.byId("TeamSelect").getBinding("items").getContexts()[0];

				oView.byId("TeamDetails").setBindingContext(oTeamContext);
				oEmployees.setBindingContext(oTeamContext);
				oEmployees.getBinding("items").attachEventOnce("change", setEmployeeContext);
			}

			function setEmployeeContext() {
				var oEmployeesControl = oView.byId("Employees"),
					oEmployeeContext = oEmployeesControl.getBinding("items").getContexts()[0];

				oView.byId("EmployeeEquipments").setBindingContext(oEmployeeContext);
				oEmployeesControl.setSelectedItem(oEmployeesControl.getItems()[0]);
				oView.setBusy(false);
			}

			//TODO: as long as there is no dataReceived event in V4 we attach to "change"
			oView.byId("TeamSelect").getBinding("items").attachEventOnce("change", setTeamContext);
		},

		onCancelEmployee : function (oEvent) {
			var oCreateEmployeeDialog = this.getView().byId("createEmployeeDialog");

			oCreateEmployeeDialog.close();
		},

		onCreateEmployee : function (oEvent) {
			var oCreateEmployeeDialog = this.getView().byId("createEmployeeDialog");

			oCreateEmployeeDialog.setModel(new JSONModel({
				"ENTRYDATE" : "2015-10-01"
			}), "new");
			oCreateEmployeeDialog.open();
		},

		onDeleteEmployee : function (oEvent) {
			var oEmployeeContext = oEvent.getSource().getBindingContext();

			oEmployeeContext.getModel().remove(oEmployeeContext).then(function () {
				MessageBox.alert(oEmployeeContext.getPath(), {
					icon: sap.m.MessageBox.Icon.SUCCESS,
					title: "Success"});
			}, onRejected);
		},

		onEmployeeSelect : function (oEvent) {
			var oContext = oEvent.getParameters().listItem.getBindingContext();
			this.getView().byId("EmployeeEquipments").setBindingContext(oContext);
		},

		onSaveEmployee : function (oEvent) {
			var oCreateEmployeeDialog = this.getView().byId("createEmployeeDialog"),
				oEmployeeData = oCreateEmployeeDialog.getModel("new").getObject("/"),
				that = this;

			//TODO validate oEmployeeData according to types
			//TODO deep create incl. LOCATION etc.

			this.getView().getModel().create("/EMPLOYEES", oEmployeeData).then(function (oData) {
				MessageBox.alert(JSON.stringify(oData), {
					icon: sap.m.MessageBox.Icon.SUCCESS,
					title: "Success"});
				that.onCancelEmployee();
			}, onRejected);
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

		onUpdateEmployee : function (oEvent) {
			var oEmployeeContext = oEvent.getSource().getBindingContext(),
				aItems = this.getView().byId("Employees").getItems();

			oEmployeeContext.getModel().read(oEmployeeContext.getPath(), true)
				.then(function (oEntityInstance) {
					oEntityInstance["@odata.etag"] = "W/\"19700000000000.0000000\"";

					// have "ETag" column check for updates
					aItems.forEach(function (oItem) {
						oItem.getCells()[5].getBinding("text").checkUpdate();
					});
				});
		}
	});

	return MainController;
});
