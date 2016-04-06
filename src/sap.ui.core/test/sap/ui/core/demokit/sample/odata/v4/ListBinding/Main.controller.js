/*!
 * ${copyright}
 */
sap.ui.define([
		'sap/m/Dialog',
		'sap/m/MessageBox',
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel'
	], function(Dialog, MessageBox, Controller, JSONModel) {
	"use strict";

//	function onRejected(oError) {
//		MessageBox.alert(oError.message, {
//			icon : MessageBox.Icon.ERROR,
//			title : oError.isConcurrentModification
//				? "Concurrent Modification"
//				: "Unknown Error"
//		});
//	}

	var MainController = Controller.extend("sap.ui.core.sample.odata.v4.ListBinding.Main", {
		cancelChangeTeamBudget : function (oEvent) {
			this.getView().byId("ChangeTeamBudgetDialog").close();
		},

		cancelChangeManagerOfTeam : function (oEvent) {
			this.getView().byId("ChangeManagerOfTeamDialog").close();
		},

		changeTeamBudget : function (oEvent) {
			var oView = this.getView(),
				oForm = oView.byId("ChangeTeamBudgetByID"),
				oUiModel = oView.getModel("ui");

			oForm.getObjectBinding()
				.setParameter("TeamID", oUiModel.getProperty("/TeamID"))
				.setParameter("Budget", oUiModel.getProperty("/Budget"))
				.execute()
				.then(function () {
					var oTeamDetails = oView.byId("TeamDetails");

					oTeamDetails.setBindingContext(null);
					oTeamDetails.setBindingContext(oForm.getBindingContext());
					MessageBox.alert("Budget changed", {
						icon : MessageBox.Icon.SUCCESS,
						title : "Success"});
				});
			oView.byId("ChangeTeamBudgetDialog").close();
		},

		changeManagerOfTeam : function (oEvent) {
			var oView = this.getView(),
				oForm = oView.byId("ChangeTeamManagerByID"),
				oUiModel = oView.getModel("ui");

			oForm.getObjectBinding()
				.setParameter("ManagerID", oUiModel.getProperty("/ManagerID"))
				.execute()
				.then(function () {
					// TODO update parent (this would require a read, but the read delivers the
					// old value)
					MessageBox.alert("Manager changed", {
						icon : MessageBox.Icon.SUCCESS,
						title : "Success"});
				});
			oView.byId("ChangeManagerOfTeamDialog").close();
		},

		getEmployeeByID : function (oEvent) {
			var oOperation = this.getView().byId("GetEmployeeByID").getObjectBinding();

			oOperation.setParameter("EmployeeID",
					this.getView().getModel("search").getProperty("/EmployeeID"))
				.execute()
				.catch(function (oError) {
					MessageBox.alert(oError.message, {
						icon : MessageBox.Icon.ERROR,
						title : "Error"});
				});
		},

		getEmployeeMaxAge : function (oEvent) {
			this.getView().byId("GetEmployeeMaxAge").getObjectBinding().execute();
		},

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
			var oCreateEmployeeDialog = this.getView().byId("CreateEmployeeDialog");

			oCreateEmployeeDialog.close();
		},

		onCreateEmployee : function (oEvent) {
			var oCreateEmployeeDialog = this.getView().byId("CreateEmployeeDialog");

			oCreateEmployeeDialog.setModel(new JSONModel({
				"ENTRYDATE" : "2015-10-01"
			}), "new");
			oCreateEmployeeDialog.open();
		},

		onDeleteEmployee : function (oEvent) {
//			var oEmployeeContext = oEvent.getSource().getBindingContext();

//			TODO the code will be needed when "remove" is implemented
//			MessageBox.alert(oEmployeeContext.getPath(), {
//					icon : MessageBox.Icon.SUCCESS,
//					title : "Success"});
		},

		onEmployeeSelect : function (oEvent) {
			var oContext = oEvent.getParameters().listItem.getBindingContext();
			this.getView().byId("EmployeeEquipments").setBindingContext(oContext);
		},

		onInit : function () {
			this.getView().setModel(new JSONModel({
				EmployeeID: undefined
			}), "search");
		},

		onSaveEmployee : function (oEvent) {
//			var oCreateEmployeeDialog = this.getView().byId("CreateEmployeeDialog"),
//				oEmployeeData = oCreateEmployeeDialog.getModel("new").getObject("/"),
//				that = this;

			//TODO validate oEmployeeData according to types
			//TODO deep create incl. LOCATION etc.
//				TODO the code will be needed when "create" is implemented
//				MessageBox.alert(JSON.stringify(oData), {
//					icon : MessageBox.Icon.SUCCESS,
//					title : "Success"});
//				that.onCancelEmployee();
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
		},

		openChangeTeamBudgetDialog : function (oEvent) {
			var oView = this.getView(),
				oUiModel = oView.getModel("ui");

			// TODO There must be a simpler way to copy values from the model to our parameters
			oUiModel.setProperty("/TeamID", oView.byId("Team_Id").getBinding("text").getValue());
			oUiModel.setProperty("/Budget", oView.byId("Budget").getBinding("text").getValue());
			oView.byId("ChangeTeamBudgetDialog").open();
		},

		openChangeManagerOfTeamDialog : function (oEvent) {
			var oView = this.getView(),
				oUiModel = oView.getModel("ui");

			// TODO There must be a simpler way to copy values from the model to our parameters
			oUiModel.setProperty("/ManagerID",
				oView.byId("ManagerID").getBinding("text").getValue());
			oView.byId("ChangeManagerOfTeamDialog").open();
		}
	});

	return MainController;
});
