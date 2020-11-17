sap.ui.define([
		'sap/ui/core/mvc/Controller',
		'sap/ui/core/Element',
		'sap/ui/model/json/JSONModel',
		'sap/ui/model/Filter',
		'sap/ui/model/FilterOperator',
		'sap/m/TabContainer',
		'sap/m/TabContainerItem',
		'sap/m/MessageBox',
		'sap/ui/core/Fragment',
		'sap/base/util/deepExtend',
		'sap/base/util/extend'
	],
	function (Controller, Element, JSONModel, Filter, FilterOperator, TabContainer, TabContainerItem, MessageBox, Fragment, deepExtend, extend) {
		"use strict";

		function fnNavBackButton() {
			var sMessage, oTabContainer,
				fnGoBackToTablePage = function () {
					this.oNavCon.back();
					var bButtonState = this.oPageTable.getSelectedItems().length > 0;
					this.oView.byId("idOpenSelected").setVisible(bButtonState);
				}.bind(this);

			if (this._isInEditMode()) {
				sMessage = "Your changes to the following tabs will be lost when you leave the page: \n";
				oTabContainer = this.oPageTabContainer.getContent()[0];
				if (oTabContainer) {
					oTabContainer.getItems().forEach(function (oTabItem) {
						if (oTabItem.getModified()) {
							sMessage += "\n" + oTabItem.getName();
						}
					});
				}

				this._showConfirmation(sMessage, ["Leave Page", MessageBox.Action.CANCEL],
					function (sAction) {
						if (sAction !== MessageBox.Action.CANCEL) {
							this._bEditMode = false;
							fnGoBackToTablePage();
							this._resetUnsavedItems();
						}
					}.bind(this));
			} else {
				fnGoBackToTablePage();
			}
		}

		function fnTableSelectionChange(oEvent) {
			var bButtonState = oEvent.getSource().getSelectedItems().length > 0;
			this.oView.byId("idOpenSelected").setVisible(bButtonState);
		}

		var TCController = Controller.extend("sap.m.sample.TabContainerMHC.TabContainer");

		TCController.prototype._oNewUnsavedItems = {};

		TCController.prototype.onInit = function () {
			this.oView = this.getView();
			this.oNavCon = this.oView.byId("navCon");
			this.oPageTable = this.oView.byId("idProductsTable");
			this.oPageTabContainer = this.oView.byId("tabContainerPage");
			this.oPageAddItem = this.oView.byId("addItemPage");
			this._mDialogs = {};

			var oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock/products.json"));
			oModel.setSizeLimit(200);
			this.oView.setModel(oModel);

			this.oPageTable.attachSelectionChange(fnTableSelectionChange, this);
			this.oPageTabContainer.attachNavButtonPress(fnNavBackButton, this);
			this.oPageAddItem.attachNavButtonPress(fnNavBackButton, this);
		};

		TCController.prototype.onExit = function () {
			var prop;
			for (prop in this._oNewUnsavedItems) {
				if (this._oNewUnsavedItems.hasOwnProperty(prop)) {
					this._oNewUnsavedItems[prop] = null;
				}
			}
			this._oNewUnsavedItems = null;


			this.oPageTable.detachSelectionChange(fnTableSelectionChange, this);
			this.oPageTabContainer.detachNavButtonPress(fnNavBackButton, this);
			this.oPageAddItem.detachNavButtonPress(fnNavBackButton, this);

			this.oPageAddItem = null;
			this.oPageTabContainer = null;
			this.oPageTable = null;
			this.oView = null;
		};

		TCController.prototype.openSelectedItems = function () {
			var oTabContainer, oTabContainerItemsTemplate,
				aFilters = [],
				aSelectedRows = this.oPageTable.getSelectedContexts();

			this.oNavCon.to(this.oPageTabContainer);

			aSelectedRows.forEach(function (oRow) {
				aFilters.push(new Filter("ProductId", FilterOperator.EQ, oRow.getProperty("ProductId")));
			});

			this._getFragment("Display").then(function(oObjectHeader) {
				oTabContainerItemsTemplate = new TabContainerItem({
					name: "{Name}",
					content: [
						oObjectHeader
					]
				});
				oTabContainer = new TabContainer({
					showAddNewButton: true,
					addNewButtonPress: this._handleTabContainerAddNewButtonPress.bind(this),
					itemClose: this._handleTabContainerItemClose.bind(this),
					itemSelect: this._handleTabContainerItemSelect.bind(this),
					items: {
						path: '/ProductCollection',
						filters: aFilters,
						template: oTabContainerItemsTemplate
					}
				});
				this.oPageTabContainer.removeAllContent();
				this.oPageTabContainer.insertContent(oTabContainer);
			}.bind(this));
		};

		TCController.prototype._handleTabContainerItemSelect = function (oEvent) {
			var oItem = oEvent.getParameter("item"),
				bModified = !!(oItem && oItem.getModified());
			this._setButtonsState({edit: !bModified, save: bModified, cancel: bModified});
		};

		TCController.prototype._handleTabContainerItemClose = function (oEvent) {
			oEvent.preventDefault();

			var oItem = oEvent.getParameter("item");
			if (oItem && oItem.getModified()) {
				this._showConfirmation("Your changes will be lost when you close this tab",
					["Close Tab", MessageBox.Action.CANCEL],
					function (sAction) {
						if (sAction !== MessageBox.Action.CANCEL) {
							this._closeItemInTabContainer(oItem);
						}
					}.bind(this));
			} else {
				this._closeItemInTabContainer(oItem);
			}
		};

		TCController.prototype._handleTabContainerAddNewButtonPress = function () {
			var aTableItems,
				sProductId = "ProductId-" + Math.random(),
				oTabContainer = this.oPageTabContainer.getContent()[0],
				oTabContainerItemsBinding = oTabContainer.getBinding("items"),
				aAppliedFilters = extend([], oTabContainerItemsBinding.aApplicationFilters, oTabContainerItemsBinding.aFilters),
				oModel = this.oView.getModel(),
				aData = oModel.getProperty("/ProductCollection"),
				oNewItem = {
					ProductId: sProductId,
					CurrencyCode: "EUR"
				};

			this._oNewUnsavedItems[sProductId] = oNewItem;

			// Extend the model
			aData.push(oNewItem);
			oModel.setProperty("/ProductCollection", aData);

			// Select the item in the table
			aTableItems = this.oPageTable.getItems();
			aTableItems[aTableItems.length - 1].setSelected(true);

			//Add item's id to the filter, so it would be visible in the tabContainer
			aAppliedFilters.push(new Filter("ProductId", FilterOperator.EQ, sProductId));
			oTabContainerItemsBinding.filter(aAppliedFilters);

			// Set this item as selected and in edit mode
			var aItems = oTabContainer.getItems();
			oTabContainer.setSelectedItem(aItems[aItems.length - 1]);
			this.handleTabContainerEditItem();
		};

		/**
		 * Add new item page
		 */
		TCController.prototype.handleNewItemAdd = function () {
			var oEditModel = new JSONModel({ProductId: Math.random(), CurrencyCode: "EUR"});

			this.oNavCon.to(this.oPageAddItem);
			this._bEditMode = true;

			this._getFragment("Edit").then(function(oSimpleForm) {
				oSimpleForm.setModel(oEditModel);
				this.oPageAddItem.removeAllContent();
				this.oPageAddItem.insertContent(oSimpleForm);
			}.bind(this));
		};

		TCController.prototype.handleNewItemCancel = function () {
			this._bEditMode = false;
			fnNavBackButton.apply(this, arguments);
		};

		TCController.prototype.handleNewItemSave = function () {
			var oModel = this.oView.getModel(),
				oData = oModel.getProperty("/ProductCollection"),
				oFormData = this.byId("myForm").getModel().getData();

			oData.push(oFormData);
			oModel.setProperty("/ProductCollection", oData);

			this._bEditMode = false;
			fnNavBackButton.apply(this, arguments);
		};


		TCController.prototype.handleTabContainerEditItem = function () {
			var oBindingContext, oEditModel,
				oSelectedItem = this._getTabContainerSelectedItem();

			if (!oSelectedItem) {
				return;
			}

			oSelectedItem.setModified(true);

			oBindingContext = oSelectedItem.getBindingContext();
			oEditModel = new JSONModel(deepExtend({}, oBindingContext.getProperty(oBindingContext.getPath())));

			this._getFragment("Edit").then(function(oSimpleForm) {
				oSimpleForm.setModel(oEditModel);
				oSelectedItem.removeAllContent();
				oSelectedItem.insertContent(oSimpleForm);
			});

			this._setButtonsState({edit: false, save: true, cancel: true});
		};

		TCController.prototype.handleTabContainerCancelUpdate = function () {
			var oSelectedItem = this._getTabContainerSelectedItem(),
				sProductId = oSelectedItem && oSelectedItem.getBindingContext().getProperty("ProductId");

			this._setButtonsState({edit: true, save: false, cancel: false});

			if (sProductId && !!this._oNewUnsavedItems[sProductId]) {
				this._closeItemInTabContainer(oSelectedItem);
			} else if (sProductId) {
				oSelectedItem.setModified(false);
				this._getFragment("Display").then(function(oObjectHeader) {
					oSelectedItem.removeAllContent();
					oSelectedItem.insertContent(oObjectHeader);
				});
			}
		};

		TCController.prototype.handleTabContainerSaveItem = function () {
			var oFragmentData,
				oSelectedItem = this._getTabContainerSelectedItem(),
				oBindingContext = oSelectedItem.getBindingContext(),
				oEditFragment = oSelectedItem.getContent()[0];

			this._setButtonsState({edit: true, save: false, cancel: false});

			if (!oSelectedItem) {
				return;
			}

			oFragmentData = oEditFragment.getModel().getData();
			this._oNewUnsavedItems[oFragmentData.ProductId] = null;

			oSelectedItem.setModified(false);

			oSelectedItem.getModel().setProperty(
				oBindingContext.getPath(),
				deepExtend(oBindingContext.getProperty(oBindingContext.getPath()), oFragmentData)
			);

			this._getFragment("Display").then(function(oObjectHeader) {
				oSelectedItem.removeAllContent();
				oSelectedItem.insertContent(oObjectHeader);
			});
		};

		TCController.prototype._closeItemInTabContainer = function (oItem) {
			var i,
				oTabContainer = this.oPageTabContainer.getContent()[0],
				sItemId = oItem.getBindingContext().getProperty("ProductId"),
				aSelectedTableItems = this.oPageTable.getSelectedItems(),
				oTabContainerItemsBinding = oTabContainer.getBinding("items"),
				aAppliedFilters = [].concat(oTabContainerItemsBinding.aApplicationFilters, oTabContainerItemsBinding.aFilters);

			oItem.setModified(false);

			//Un-check item from the table
			for (i = 0; i < aSelectedTableItems.length; i++) {
				if (aSelectedTableItems[i].getBindingContext().getProperty("ProductId") === sItemId) {
					this.oPageTable.setSelectedItem(aSelectedTableItems[i], /*bSelect*/ false, /*bFireEvent*/ true);
					break;
				}
			}

			for (i = 0; i < aAppliedFilters.length; i++) {
				if (aAppliedFilters[i].oValue1 === sItemId) {
					aAppliedFilters.splice(i, 1);
					break;
				}
			}
			oTabContainerItemsBinding.filter(aAppliedFilters);

			this._resetUnsavedItems(sItemId);

			// Redirect to the table, if there are no items left
			if (!aAppliedFilters.length) {
				setTimeout(fnNavBackButton.bind(this), 100);
			}
		};

		TCController.prototype._getFragment = function (sFragmentName) {
			var oView = this.getView();

			if (!this._mDialogs[sFragmentName]) {
				this._mDialogs[sFragmentName] = Fragment.load({
					id: oView.getId(),
					type: "XML",
					name: "sap.m.sample.TabContainerMHC." + sFragmentName,
					controller: this
				});
			}
			return this._mDialogs[sFragmentName];
		};

		TCController.prototype._getTabContainerSelectedItem = function () {
			var oTabContainer = this.oPageTabContainer.getContent()[0];
			return Element.registry.get(oTabContainer.getSelectedItem());
		};

		TCController.prototype._showConfirmation = function (sMessage, aActions, fnCallback) {
			aActions = aActions && aActions.length ? aActions : [MessageBox.Action.OK, MessageBox.Action.CANCEL];

			MessageBox.confirm(sMessage, {
				title: "Warning",
				icon: MessageBox.Icon.WARNING,
				initialFocus: MessageBox.Action.CANCEL,
				actions: aActions,
				onClose: fnCallback
			});
		};

		TCController.prototype._resetUnsavedItems = function (sItemId) {
			var oModel, aData,
				i = 0;

			oModel = this.oView.getModel();
			aData = oModel.getProperty("/ProductCollection");

			while (aData[i]) {
				// When sItemId is not provided, it will remove all unsaved items
				if (!sItemId && this._oNewUnsavedItems[aData[i].ProductId]) {
					this._oNewUnsavedItems[aData[i].ProductId] = null;
					aData.splice(i, 1);

				// If sItemId is provided, remove just that item from the unsaved ones
				} else if (sItemId && aData[i].ProductId === sItemId) {
					this._oNewUnsavedItems[sItemId] = null;
					aData.splice(i, 1);
					break;
				} else {
					i++;
				}
			}

			oModel.setProperty("/ProductCollection", aData);
		};

		TCController.prototype._setButtonsState = function (oState) {
			this.oView.byId("idEditItem").setVisible(oState.edit || false);
			this.oView.byId("idSaveItem").setVisible(oState.save || false);
			this.oView.byId("idCancel").setVisible(oState.cancel || false);
		};

		TCController.prototype._isInEditMode = function () {
			var bIsEditMode = this._bEditMode,
				oTabContainer = this.oPageTabContainer.getContent()[0],
				aTabContainerItems = (oTabContainer && oTabContainer.getItems()) || [];

			if (bIsEditMode) {
				return true;
			} else if (aTabContainerItems.length) {
				// Check if any of the items is being modified
				aTabContainerItems.forEach(function (oItem) {
					bIsEditMode = bIsEditMode || oItem.getModified();
				});

				return bIsEditMode;
			}

			return false;
		};

		return TCController;
	});