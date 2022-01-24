/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/ui/fl/write/api/ContextSharingAPI",
	"sap/m/ColumnListItem",
	"sap/ui/core/Fragment",
	"sap/base/util/uid",
	"sap/ui/rta/appContexts/controller/RestAPIConnector"
], function (
	Controller,
	MessageBox,
	MessageToast,
	ContextSharingAPI,
	ColumnListItem,
	Fragment,
	uid,
	RestAPIConnector
) {
	"use strict";

	var _sLayer;
	var oContextVisibilityComponent;

	var oRanking = {
		Initial: 0,
		Default: 1024,
		Before: function (iRank) {
			return iRank + 1024;
		},
		Between: function (iRank1, iRank2) {
			// limited to 53 rows
			return (iRank1 + iRank2) / 2;
		},
		After: function (iRank) {
			return iRank + 0.5;
		}
	};


	function onSelectionChange(oEvent) {
		if (oEvent.getParameter("selected") === true) {
			var oUpButton = this.byId("moveUpButton");
			var oDownButton = this.byId("moveDownButton");
			oUpButton.setEnabled(true);
			oDownButton.setEnabled(true);
		}
	}

	function initializeRanks(oModel) {
		var aContexts = oModel.getProperty("/appContexts") || [];
		aContexts.forEach(function (oContext, iIndex) {
			oContext.rank = iIndex + 1;
		});
		oModel.setProperty("/appContexts", aContexts);
	}

	function compareRanks(oContextA, oContextB) {
		return oContextA.rank - oContextB.rank;
	}

	function sortByRank(oModel) {
		var aContexts = oModel.getProperty("/appContexts") || [];
		aContexts.sort(compareRanks);
		oModel.setProperty("/appContexts", aContexts);
		oModel.refresh(true);
	}

	function createFragment(sFragmentName) {
		return Fragment.load({
			id: this.getView().getId(),
			name: "sap.ui.rta.appContexts.view." + sFragmentName,
			controller: this
		}).then(function (oDialog) {
			oDialog.setModel(this.oAppContextsModel);
			this.getView().addDependent(oDialog);
			return oDialog;
		}.bind(this));
	}

	function prefillFragment(oBindingContext) {
		var aRoles = this.oAppContextsModel.getProperty("types/role", oBindingContext) || [];
		this.oComponent.setSelectedContexts({ role: aRoles });
	}

	function createAndAddNewContext(bEmpty, oBindingContext) {
		var aAllContexts = this.oAppContextsModel.getProperty("/appContexts");
		var oNewContext = bEmpty ? { types: { role: [] } } : Object.assign({}, this.oAppContextsModel.getProperty("", oBindingContext));
		oNewContext.id = uid();
		oNewContext.title = "";
		oNewContext.description = "";
		oNewContext.rank = aAllContexts.length + 1;
		aAllContexts.push(oNewContext);
		this.oAppContextsModel.setProperty("/appContexts", aAllContexts);
		return oNewContext;
	}

	return Controller.extend("sap.ui.rta.appContexts.controller.ManageContexts", {
		onInit: function () {
			this.oAppContextsModel = this.getView().getModel("appContexts");
			this.oI18n = this.getView().getModel("i18n").getResourceBundle();

			_sLayer = this.getOwnerComponent().getLayer();

			var oTable = this.byId("manageContexts");
			oTable.attachSelectionChange(onSelectionChange.bind(this));

			this.oAppContextsModel.setData(RestAPIConnector.getAppContextData());
			// initializeRanks must be called after setData(...), to correctly initialize ranks on app contexts retrieved by RestAPIConnector
			initializeRanks(this.oAppContextsModel);

			return ContextSharingAPI.createComponent({ layer: _sLayer }).then(function (oContextSharingComponent) {
				oContextVisibilityComponent = oContextSharingComponent;
				this.oComponent = oContextVisibilityComponent.getComponentInstance();
			}.bind(this));
		},

		formatContextColumnCell: function (aRoles) {
			var sRoleMessage = aRoles.length + " " + this.oI18n.getText("TXT_TABLE_CONTEXT_CELL_ROLE");
			sRoleMessage += aRoles.length === 1 ? "" : "s";
			return sRoleMessage;
		},

		formatEnabled: function () {
			var oTable = this.byId("manageContexts");
			return oTable.getSelectedItems().length !== 0;
		},

		formatContextTooltip: function (aRoles) {
			return (this.oI18n.getText("TXT_TABLE_CONTEXT_CELL_ROLE") + (aRoles.length === 1 ? "" : "s")).toUpperCase() + " - \n" + aRoles.join("\n");
		},

		moveUp: function (oEvent) {
			this.moveSelectedItem("Up");
			oEvent.getSource().focus();
		},

		moveDown: function (oEvent) {
			this.moveSelectedItem("Down");
			oEvent.getSource().focus();
		},

		moveSelectedItem: function (sDirection) {
			var oTable = this.byId("manageContexts");
			var oSelectedItem = oTable.getSelectedItem(0);
			var oSelectedItemContext = oSelectedItem.getBindingContext("appContexts");

			var iSiblingItemIndex = oTable.indexOfItem(oSelectedItem) + (sDirection === "Up" ? -1 : 1);
			var oSiblingItem = oTable.getItems()[iSiblingItemIndex];
			var oSiblingItemContext = oSiblingItem ? oSiblingItem.getBindingContext("appContexts") : undefined;
			if (!oSiblingItemContext) {
				return;
			}

			// swap the selected and the siblings rank
			var iSiblingItemRank = oSiblingItemContext.getProperty("rank");
			var iSelectedItemRank = oSelectedItemContext.getProperty("rank");

			this.oAppContextsModel.setProperty("rank", iSiblingItemRank, oSelectedItemContext);
			this.oAppContextsModel.setProperty("rank", iSelectedItemRank, oSiblingItemContext);

			sortByRank(this.oAppContextsModel);
			// after move select the sibling
			oTable.getItems()[iSiblingItemIndex].setSelected(true).focus();
		},

		onDropSelectedProductsTable: function (oEvent) {
			var oDraggedItem = oEvent.getParameter("draggedControl");
			var oDraggedItemContext = oDraggedItem.getBindingContext("appContexts");
			if (!oDraggedItemContext) {
				return;
			}

			var iNewRank = oRanking.Default;
			var oDroppedItem = oEvent.getParameter("droppedControl");

			if (oDroppedItem instanceof ColumnListItem) {
				// get the dropped row data
				var sDropPosition = oEvent.getParameter("dropPosition");
				var oDroppedItemContext = oDroppedItem.getBindingContext("appContexts");
				var iDroppedItemRank = oDroppedItemContext.getProperty("rank");
				var oDroppedTable = oDroppedItem.getParent();
				var iDroppedItemIndex = oDroppedTable.indexOfItem(oDroppedItem);

				// find the new index of the dragged row depending on the drop position
				var iNewItemIndex = iDroppedItemIndex + (sDropPosition === "After" ? 1 : -1);
				var oNewItem = oDroppedTable.getItems()[iNewItemIndex];
				if (!oNewItem) {
					// dropped before the first row or after the last row
					iNewRank = oRanking[sDropPosition](iDroppedItemRank);
				} else {
					// dropped between first and the last row
					var oNewItemContext = oNewItem.getBindingContext("appContexts");
					iNewRank = oRanking.Between(iDroppedItemRank, oNewItemContext.getProperty("rank"));
				}
			}
			// set the rank property and update the model to refresh the bindings
			this.oAppContextsModel.setProperty("rank", iNewRank, oDraggedItemContext);
			sortByRank(this.oAppContextsModel);
			initializeRanks(this.oAppContextsModel);
		},

		onMenuAction: function (oEvent) {
			var oItem = oEvent.getParameter("item");
			var sItemPath = oItem.getText();

			switch (sItemPath) {
				case this.oI18n.getText("MAA_DIALOG_ADAPT_UI"):
					return this.handleUiAdaptation(oEvent);
				case this.oI18n.getText("MENU_BTN_EDIT"):
					return this.edit(oEvent);
				case this.oI18n.getText("MENU_BTN_SHARE"):
					return this.share(oEvent);
				case this.oI18n.getText("MAA_DIALOG_DELETE"):
					return this.deleteContext(oEvent);
				case this.oI18n.getText("MAA_DIALOG_SAVE_AS_APP"):
					return this.save(oEvent);
				default:
					return undefined;
			}
		},

		edit: function (oEvent) {
			var oBindingContext = oEvent.getSource().getBindingContext("appContexts");
			prefillFragment.call(this, oBindingContext);

			if (!this._pEditDialog) {
				this._pEditDialog = createFragment.call(this, "EditContextsDialog");
			}

			this._pEditDialog.then(function (oDialog) {
				oDialog.addContent(oContextVisibilityComponent);
				this.oEditedContext = Object.assign({}, this.oAppContextsModel.getProperty("", oBindingContext));
				oDialog.bindElement(oBindingContext.getPath());
				oDialog.open();
			}.bind(this));
		},

		editSelect: function (oEvent) {
			var oBindingContext = oEvent.getSource().getBindingContext();
			var aSelected = this.oComponent.getSelectedContexts();
			this.oAppContextsModel.setProperty("types/role", aSelected.role, oBindingContext);
			oEvent.getSource().getParent().close();
		},

		editClose: function (oEvent) {
			var oBindingContext = oEvent.getSource().getBindingContext();
			this.oAppContextsModel.setProperty("", this.oEditedContext, oBindingContext);
			oEvent.getSource().getParent().close();
		},

		save: function (oEvent) {
			var oBindingContext = oEvent.getSource().getBindingContext("appContexts");

			prefillFragment.call(this, oBindingContext);
			if (!this._pSaveAsDialog) {
				this._pSaveAsDialog = createFragment.call(this, "SaveAsContextsDialog");
			}

			var bCreateEmptyContext = oEvent.getSource().getId().endsWith("manageContexts-newContextButton");
			var oNewContext = createAndAddNewContext.call(this, bCreateEmptyContext, oBindingContext);

			this._pSaveAsDialog.then(function (oDialog) {
				oDialog.addContent(oContextVisibilityComponent);
				oDialog.bindElement("/appContexts/".concat(oNewContext.rank - 1));
				oDialog.open();
			});
		},

		saveSelect: function (oEvent) {
			var oBindingContext = oEvent.getSource().getBindingContext();
			var sTitle = this.oAppContextsModel.getProperty("title", oBindingContext);
			if (sTitle === "") {
				return this.byId("savecontextdialog-title-input").setValueState("Error");
			}
			var aSelected = this.oComponent.getSelectedContexts();
			this.oAppContextsModel.setProperty("types/role", aSelected.role, oBindingContext);
			oEvent.getSource().getParent().close();
		},

		saveClose: function (oEvent) {
			var aAllContexts = this.oAppContextsModel.getProperty("/appContexts");
			aAllContexts.pop();
			this.oAppContextsModel.setProperty("/appContexts", aAllContexts);
			oEvent.getSource().getParent().close();
		},

		share: function () {
			// TODO: not implemented yet
			var oTable = this.byId("manageContexts");
			var oSelectedItemContext = oTable.getSelectedItem(0).getBindingContext("appContexts");
			var sSharedContextTitle = this.oAppContextsModel.getProperty("title", oSelectedItemContext);
			MessageToast.show("Context '" + sSharedContextTitle + "' shared!");
		},

		deleteContext: function (oEvent) {
			var oBindingContext = oEvent.getSource().getBindingContext("appContexts");
			var sToBeDeletedId = this.oAppContextsModel.getProperty("id", oBindingContext);
			var aAllContexts = this.oAppContextsModel.getProperty("/appContexts");
			var aNewContexts = aAllContexts.filter(function (oContext) {
				return oContext.id !== sToBeDeletedId;
			});
			this.oAppContextsModel.setProperty("/appContexts", aNewContexts);
			initializeRanks(this.oAppContextsModel);
		},

		pressColumnListItem: function (oEvent) {
			var oBindingContext = oEvent.getSource().getBindingContext("appContexts");
			var sTitle = this.oAppContextsModel.getProperty("title", oBindingContext);
			MessageBox.confirm("Do you want to adapt context '" + sTitle + "'?");
		},

		handleUiAdaptation: function () {
			// TODO: not implemented yet
			return false;
		}
	});
});