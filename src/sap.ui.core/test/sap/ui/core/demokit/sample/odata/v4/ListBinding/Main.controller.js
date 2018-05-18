/*!
 * ${copyright}
 */
sap.ui.define([
		'sap/m/Dialog',
		'sap/m/MessageBox',
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel',
		'sap/ui/model/Sorter'
	], function(Dialog, MessageBox, Controller, JSONModel, Sorter) {
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
				oForm = oView.byId("ChangeTeamBudgetByID"),
				oUiModel = oView.getModel("ui");

			oForm.getObjectBinding()
				.setParameter("TeamID", oUiModel.getProperty("/TeamID"))
				.setParameter("Budget", oUiModel.getProperty("/Budget"))
				.execute()
				.then(function () {
					var oBinding = oView.byId("Budget").getBinding("text");

					oBinding.setContext(null);
					oBinding.setContext(oForm.getBindingContext());
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
					var oControl = oView.byId("ManagerID");

					oControl.bindProperty("text", "MANAGER_ID");
					oControl.getBinding("text").setContext(null);
					oControl.getBinding("text").setContext(oForm.getBindingContext());
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

		onBeforeRendering : function () {
			var oView = this.getView();

			oView.setBusy(true);

			function setTeamContext() {
				var oEmployees = oView.byId("Employees"),
					oTeamContext = oView.byId("TeamSelect").getBinding("items")
						.getCurrentContexts()[0];

				oView.byId("TeamDetails").setBindingContext(oTeamContext);
				oEmployees.getBinding("items").attachEventOnce("change", setEmployeeContext);
				oEmployees.setBindingContext(oTeamContext);
			}

			function setEmployeeContext() {
				var oEmployeesControl = oView.byId("Employees"),
					oEmployeeContext = oEmployeesControl.getBinding("items")
						.getCurrentContexts()[0];

				oView.byId("EmployeeEquipments").setBindingContext(oEmployeeContext);
				if (oEmployeesControl.getItems()[0]) {
					oEmployeesControl.setSelectedItem(oEmployeesControl.getItems()[0]);
				}
				oView.setBusy(false);
			}

			oView.byId("TeamSelect").getBinding("items")
				.attachEventOnce("dataReceived", setTeamContext);
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

			jQuery.sap.log.info("Change event on Equipment list binding received with reason: '"
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

		onUpdateEmployee : function (oEvent) {
//			var oEmployeeContext = oEvent.getSource().getBindingContext(),
//				aItems = this.byId("Employees").getItems();
//
//			oEmployeeContext.getModel().read(oEmployeeContext.getPath(), true)
//				.then(function (oEntityInstance) {
//					oEntityInstance["@odata.etag"] = "W/\"19700000000000.0000000\"";
//
//					// have "ETag" column check for updates
//					aItems.forEach(function (oItem) {
//						oItem.getCells()[5].getBinding("text").checkUpdate();
//					});
//				});
		},

		openChangeTeamBudgetDialog : function (oEvent) {
			var oUiModel = this.getView().getModel("ui");

			// TODO There must be a simpler way to copy values from the model to our parameters
			oUiModel.setProperty("/TeamID", this.byId("Team_Id").getBinding("text").getValue());
			oUiModel.setProperty("/Budget", this.byId("Budget").getBinding("text").getValue());
			this.byId("ChangeTeamBudgetDialog").open();
		},

		openChangeManagerOfTeamDialog : function (oEvent) {
			// TODO There must be a simpler way to copy values from the model to our parameters
			this.getView().getModel("ui").setProperty("/ManagerID",
				this.byId("ManagerID").getBinding("text").getValue());
			this.byId("ChangeManagerOfTeamDialog").open();
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
