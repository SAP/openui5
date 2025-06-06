sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device",
	"../model/formatter",
	"sap/m/MessageBox",
	"sap/m/MessageToast"
], (BaseController, JSONModel, Device, formatter, MessageBox, MessageToast) => {
	"use strict";

	const sCartModelName = "cartProducts";
	const sSavedForLaterEntries = "savedForLaterEntries";
	const sCartEntries = "cartEntries";

	return BaseController.extend("sap.ui.demo.cart.controller.Cart", {
		formatter,

		onInit() {
			this._oRouter = this.getRouter();
			this._oRouter.getRoute("cart").attachPatternMatched(this._routePatternMatched, this);
			this._oRouter.getRoute("productCart").attachPatternMatched(this._routePatternMatched, this);
			this._oRouter.getRoute("comparisonCart").attachPatternMatched(this._routePatternMatched, this);
			// set initial ui configuration model
			const oCfgModel = new JSONModel({});
			this.getView().setModel(oCfgModel, "cfg");
			this._toggleCfgModel();

			const oEditButton = this.byId("editButton");
			oEditButton.addEventDelegate({
				onAfterRendering() {
					oEditButton.focus();
				}
			});
		},

		onExit() {
			if (this._orderDialog) {
				this._orderDialog.destroy();
			}
			if (this._orderBusyDialog) {
				this._orderBusyDialog.destroy();
			}
		},

		_routePatternMatched() {
			this._setLayout("Three");
			const oCartModel = this.getModel("cartProducts");
			const oCartEntries = oCartModel.getProperty("/cartEntries");
			//enables the proceed and edit buttons if the cart has entries
			if (Object.keys(oCartEntries).length > 0) {
				oCartModel.setProperty("/showProceedButton", true);
				oCartModel.setProperty("/showEditButton", true);
			}
			//set selection of list back
			const oEntryList = this.byId("entryList");
			oEntryList.removeSelections();
		},

		onEditOrDoneButtonPress() {
			this._toggleCfgModel();
		},

		async _toggleCfgModel() {
			const oCfgModel = this.getView().getModel("cfg");
			const oData = oCfgModel.getData();
			const oBundle = await this.requestResourceBundle();
			const bDataNoSetYet = !oData.hasOwnProperty("inDelete");
			const bInDelete = (bDataNoSetYet ? true : oData.inDelete);
			const sPhoneMode = (Device.system.phone ? "None" : "SingleSelectMaster");
			const sPhoneType = (Device.system.phone ? "Active" : "Inactive");

			oCfgModel.setData({
				inDelete: !bInDelete,
				notInDelete: bInDelete,
				listMode: (bInDelete ? sPhoneMode : "Delete"),
				listItemType: (bInDelete ? sPhoneType : "Inactive"),
				pageTitle: (bInDelete ? oBundle.getText("appTitle") : oBundle.getText("cartTitleEdit"))
			});
		},

		onEntryListPress(oEvent) {
			this._showProduct(oEvent.getSource());
		},

		onEntryListSelect(oEvent) {
			this._showProduct(oEvent.getParameter("listItem"));
		},

		/**
		 * Called when the "save for later" link of a product in the cart is pressed.
		 * @param {sap.ui.base.Event} oEvent Event object
		 */
		onSaveForLater(oEvent) {
			const oBindingContext = oEvent.getSource().getBindingContext(sCartModelName);
			this._changeList(sSavedForLaterEntries, sCartEntries, oBindingContext);
		},

		/**
		 * Called when the "Add back to basket" link of a product in the saved for later list is pressed.
		 * @param {sap.ui.base.Event} oEvent Event object
		 */
		onAddBackToBasket(oEvent) {
			const oBindingContext = oEvent.getSource().getBindingContext(sCartModelName);

			this._changeList(sCartEntries, sSavedForLaterEntries, oBindingContext);
		},

		/**
		 * Moves a product from one list to another.
		 * @param {string} sListToAddItem Name of list, where item should be moved to
		 * @param {string} sListToDeleteItem Name of list, where item should be removed from
		 * @param {Object} oBindingContext Binding context of product
		 */
		_changeList(sListToAddItem, sListToDeleteItem, oBindingContext) {
			const oCartModel = oBindingContext.getModel();
			const oProduct = oBindingContext.getObject();
			const oModelData = oCartModel.getData();
			// why are the items cloned? - the JSON model checks if the values in the object are changed.
			// if we do our modifications on the same reference, there will be no change detected.
			// so we modify after the clone.
			const oListToAddItem = {...oModelData[sListToAddItem]};
			const oListToDeleteItem = {...oModelData[sListToDeleteItem]};
			const sProductId = oProduct.ProductId;

			// find existing entry for product
			if (oListToAddItem[sProductId] === undefined) {
				// copy new entry
				oListToAddItem[sProductId] = {...oProduct};
			}

			//Delete the saved Product from cart
			delete oListToDeleteItem[sProductId];
			oCartModel.setProperty("/" + sListToAddItem, oListToAddItem);
			oCartModel.setProperty("/" + sListToDeleteItem, oListToDeleteItem);
		},

		_showProduct(oItem) {
			const oEntry = oItem.getBindingContext(sCartModelName).getObject();

			// close cart when showing a product on phone
			let bCartVisible = false;
			if (!Device.system.phone) {
				bCartVisible = this.getModel("appView").getProperty("/layout").startsWith("Three");
			} else {
				bCartVisible = false;
				this._setLayout("Two");
			}
			this._oRouter.navTo(bCartVisible ? "productCart" : "product", {
				id: oEntry.Category,
				productId: oEntry.ProductId
			}, !Device.system.phone);
		},

		onCartEntriesDelete(oEvent) {
			this._deleteProduct(sCartEntries, oEvent);
		},

		onSaveForLaterDelete(oEvent) {
			this._deleteProduct(sSavedForLaterEntries, oEvent);
		},

		/**
		 * Helper function for the deletion of items from <code>cart</code> or <code>savedForLater</code> list.
		 * If the delete button is pressed, a message dialog will open.
		 * @param {string} sCollection the collection name
		 * @param {sap.ui.base.Event} oEvent Event object
		 */
		async _deleteProduct(sCollection, oEvent) {
			const oBindingContext = oEvent.getParameter("listItem").getBindingContext(sCartModelName);
			const oBundle = await this.requestResourceBundle();
			const sEntryId = oBindingContext.getProperty("ProductId");
			const sEntryName = oBindingContext.getProperty("Name");

			// show confirmation dialog
			MessageBox.show(oBundle.getText("cartDeleteDialogMsg"), {
				title: oBundle.getText("cartDeleteDialogTitle"),
				actions: [
					MessageBox.Action.DELETE,
					MessageBox.Action.CANCEL
				],
				onClose(oAction) {
					if (oAction !== MessageBox.Action.DELETE) {
						return;
					}
					const oCartModel = oBindingContext.getModel();
					const oCollectionEntries = {...oCartModel.getData()[sCollection]};

					delete oCollectionEntries[sEntryId];

					// update model
					oCartModel.setProperty("/" + sCollection, {...oCollectionEntries});

					MessageToast.show(oBundle.getText("cartDeleteDialogConfirmDeleteMsg", [sEntryName]));
				}
			});
		},

		/**
		 * Called when the proceed button in the cart is pressed. Navigates to the checkout wizard
		 */
		onProceedButtonPress() {
			this.getRouter().navTo("checkout");
		}
	});
});
