/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/m/Dialog",
	"sap/m/MessageBox",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Sorter",
	"sap/ui/model/json/JSONModel"
], function (Log, Dialog, MessageBox, Controller, Sorter, JSONModel) {
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
			this.byId("ChangeTeamBudgetDialog").close();
		},

		cancelChangeManagerOfTeam : function (oEvent) {
			this.byId("ChangeManagerOfTeamDialog").close();
		},

		changeTeamBudget : function (oEvent) {
			var oView = this.getView(),
				oDialog = oView.byId("ChangeTeamBudgetDialog");

			oDialog.getObjectBinding().execute().then(function () {
					var oBinding = oView.byId("Budget").getBinding("text");

					oBinding.setContext(null);
					oBinding.setContext(oDialog.getBindingContext());
					MessageBox.alert("Budget changed", {
						icon : MessageBox.Icon.SUCCESS,
						title : "Success"});
				});
			oView.byId("ChangeTeamBudgetDialog").close();
		},

		changeManagerOfTeam : function (oEvent) {
			var oView = this.getView(),
				that  = this;

			this.oChangeManager.execute().then(function () {
					var oControl = oView.byId("ManagerID");

					// set text to the operation result
					oControl.bindProperty("text", "MANAGER_ID");
					oControl.getBinding("text").setContext(null);
					oControl.getBinding("text").setContext(that.oChangeManager.getBoundContext());
					MessageBox.alert("Manager changed", {
						icon : MessageBox.Icon.SUCCESS,
						title : "Success"});
				});
			oView.byId("ChangeManagerOfTeamDialog").close();
		},

		getEmployeeByID : function (oEvent) {
			var oOperation = this.byId("GetEmployeeByID").getObjectBinding();

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
			this.byId("GetEmployeeMaxAge").getObjectBinding().execute();
		},

		onCancel: function (oEvent) {
			this.getView().getModel().resetChanges();
		},

		onDeleteEmployee : function (oEvent) {
			var oEmployeeContext = oEvent.getSource().getBindingContext();

			oEmployeeContext.delete(oEmployeeContext.getModel().getGroupId()).then(function () {
				MessageBox.alert(oEmployeeContext.getPath(), {
					icon : MessageBox.Icon.SUCCESS,
					title : "Success"
				});
			});
		},

		onEmployeeSelect : function (oEvent) {
			var oContext = oEvent.getParameters().listItem.getBindingContext();
			this.byId("EmployeeEquipments").setBindingContext(oContext);
		},

		onEquipmentsChanged : function (oEvent) {
			var sReason = oEvent.getParameter('reason');

			Log.info("Change event on Equipment list binding received with reason: '"
				+ sReason + "'", "sap.ui.core.sample.odata.v4.ListBinding.Main");
		},

		onEquipmentsRefresh : function (oEvent) {
			this.byId("Equipments").getBinding("items").refresh();
		},

		onInit : function () {
			var oView = this.getView();

			oView.setModel(new JSONModel({
				EmployeeID: null
			}), "search");
			oView.setModel(new JSONModel({
				Employees : {
					AGE : { icon : "sap-icon://sort-ascending", desc : false },
					Name : { icon : "", desc : undefined }
				},
				Equipments : {
					Category : { icon : "sap-icon://sort-ascending", desc : false },
					ID : { icon : "", desc : undefined },
					Name : { icon : "", desc : undefined },
					EmployeeId : { icon : "", desc : undefined }
				}
			}), "sort");
			this.mSorters = {
				Employees : [new Sorter("AGE", /*bDescending*/false)],
				Equipments : [new Sorter("Category", /*bDescending*/false, /*bGroup*/true)]
			};
		},

		onRefresh : function (oEvent) {
			var oModel = this.getView().getModel();

			if (oModel.hasPendingChanges()) {
				MessageBox.alert("Cannot refresh due to pending changes", {
					icon : MessageBox.Icon.ERROR,
					title : "Error"
				});
			} else {
				oModel.refresh();
			}
		},

		onSave: function (oEvent) {
			var oModel = this.getView().getModel();

			// TODO this should be the default for submitBatch
			oModel.submitBatch(oModel.getUpdateGroupId()).then(function () {
				// TODO the success handler could get all errors of failed parts
				MessageBox.alert("Changes have been saved", {
					icon : MessageBox.Icon.SUCCESS,
					title : "Success"
				});
			}, function (oError) {
				MessageBox.alert(oError.message, {
					icon : MessageBox.Icon.ERROR,
					title : "Unexpected Error"
				});
			});
		},

		onTeamSelect : function (oEvent) {
			var oView = this.getView(),
				oEmployeesControl = oView.byId("Employees"),
				oEmployeesBinding = oEmployeesControl.getBinding("items"),
				oTeamContext = oEvent.getParameters().selectedItem.getBindingContext();

			function setEquipmentContext() {
				var oEquipmentControl = oView.byId("EmployeeEquipments");
				oEquipmentControl.setBindingContext(oEmployeesBinding.getCurrentContexts()[0]);
				oEmployeesControl.setSelectedItem(oEmployeesControl.getItems()[0]);
			}

			oEmployeesControl.setBindingContext(oTeamContext);
			oEmployeesBinding.attachEventOnce("change", setEquipmentContext);
			oView.byId("TeamDetails").setBindingContext(oTeamContext);
		},

		onTeamsRequested : function (oEvent) {
			this.getView().setBusy(true);
		},

		onTeamsReceived : function (oEvent) {
			var oView = this.getView();

			oView.loaded().then(function () {
				var oEmployeesTable = oView.byId("Employees"),
					oFirstTeam
						= oView.byId("TeamSelect").getBinding("items").getCurrentContexts()[0];

				oView.setBusy(false);
				oView.byId("TeamDetails").setBindingContext(oFirstTeam);
				oEmployeesTable.getBinding("items").attachEventOnce("change", function () {
					var oFirstEmployee = oEmployeesTable.getItems()[0];

					if (oFirstEmployee) {
						oView.byId("EmployeeEquipments").setBindingContext(
							oFirstEmployee.getBindingContext());
						oEmployeesTable.setSelectedItem(oFirstEmployee);
					}
				});
				oEmployeesTable.setBindingContext(oFirstTeam);
			});
		},

		openChangeTeamBudgetDialog : function (oEvent) {
			var oTeamContext = this.byId("TeamDetails").getBindingContext();

			// set default values for operation parameters
			this.byId("ChangeTeamBudgetDialog").getObjectBinding()
				.setParameter("TeamID", oTeamContext.getProperty("Team_Id"))
				.setParameter("Budget", oTeamContext.getProperty("Budget"));

			this.byId("ChangeTeamBudgetDialog").open();
		},

		openChangeManagerOfTeamDialog : function (oEvent) {
			var oView = this.getView(),
				oTeamContext = oView.byId("TeamDetails").getBindingContext();

			if (!this.oChangeManager) {
				this.oChangeManager = oView.getModel("parameterContext").bindContext(
					"com.sap.gateway.default.iwbep.tea_busi.v0001.AcChangeManagerOfTeam(...)");
			}

			// operation is bound switch the context
			this.oChangeManager.setContext(oTeamContext);
			// set default values for operation parameters
			this.oChangeManager.setParameter(
				"ManagerID", oTeamContext.getProperty("TEAM_2_MANAGER/ID"));

			oView.byId("ChangeManagerOfTeamDialog")
				.setBindingContext(this.oChangeManager.getParameterContext(), "parameterContext")
				.open();
		},

		// *********************************************************************************
		// sort on absolute binding
		// *********************************************************************************
		onSort : function (oEvent) {
			var oBinding,
				mCustomData = {},
				sId,
				sNewIcon,
				sProperty,
				aSelectedContexts,
				sSelectedId,
				bSortDesc,
				oTable,
				oSortModel = this.getView().getModel('sort');

			oEvent.getSource().getCustomData().forEach(function (oCustomData) {
				mCustomData[oCustomData.getKey()] = oCustomData.getValue();
			});
			sId = mCustomData.sorterControlId;
			sProperty = mCustomData.sorterPath;

			// update sort model state
			bSortDesc = oSortModel.getProperty("/" + sId + "/" + sProperty + "/desc");
			// choose next sort order: no sort -> ascending -> descending -> no sort
			if (bSortDesc === undefined) {
				sNewIcon = "sap-icon://sort-ascending";
				bSortDesc = false;
			} else if (bSortDesc === false) {
				sNewIcon = "sap-icon://sort-descending";
				bSortDesc = true;
			} else {
				sNewIcon = "";
				bSortDesc = undefined;
			}
			oSortModel.setProperty("/" + sId + "/" + sProperty + "/desc", bSortDesc);
			oSortModel.setProperty("/" + sId + "/" + sProperty + "/icon", sNewIcon);

			// remove sorter for same path
			this.mSorters[sId] = this.mSorters[sId].filter(function (oSorter) {
				return oSorter.sPath !== sProperty;
			});
			// add sorter if necessary before all others
			if (bSortDesc !== undefined) {
				// do grouping only for equipments
				this.mSorters[sId].unshift(new Sorter(sProperty, bSortDesc, sId === "Equipments"));
			}

			oTable = this.byId(sId);
			aSelectedContexts = oTable.getSelectedContexts();
			oBinding = oTable.getBinding("items");
			// restore selection after sort
			if (aSelectedContexts.length > 0) {
				// same property for equipment and employee
				sSelectedId = aSelectedContexts[0].getProperty("ID");
			}
			oBinding.attachEventOnce("change", function (oEvent) {
				oTable.removeSelections(true);
				oBinding.getCurrentContexts().some(function (oContext, i) {
					if (oContext.getProperty("ID") === sSelectedId) {
						oTable.setSelectedItem(oTable.getItems()[i]);
						return true;
					}
				});
			});

			oBinding.sort(this.mSorters[sId]);
		}
	});

	return MainController;
});
