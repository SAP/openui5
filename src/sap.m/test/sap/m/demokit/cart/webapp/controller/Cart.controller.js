sap.ui.define([
	'jquery.sap.global',
	'sap/ui/demo/cart/controller/BaseController',
	'sap/ui/model/json/JSONModel',
	'sap/ui/Device',
	'sap/ui/demo/cart/model/formatter',
	'sap/m/MessageBox',
	'sap/m/Dialog',
	'sap/m/Button',
	'sap/ui/core/routing/History'
], function (
	$,
	BaseController,
	JSONModel,
	Device,
	formatter,
	MessageBox,
	Dialog,
	Button,
	History) {
	"use strict";

	var sCartModelName = "cartProducts";
	var sSavedForLaterEntries = "savedForLaterEntries";
	var sCartEntries = "cartEntries";

	return BaseController.extend("sap.ui.demo.cart.controller.Cart", {
		formatter: formatter,

		onInit: function () {
			this._oRouter = this.getRouter();
			this._oRouter.getRoute("cart").attachPatternMatched(this._routePatternMatched, this);
			// set initial ui configuration model
			var oCfgModel = new JSONModel({});
			this.getView().setModel(oCfgModel, "cfg");
			this._toggleCfgModel();
		},

		onExit: function () {
			if (this._orderDialog) {
				this._orderDialog.destroy();
			}
			if (this._orderBusyDialog) {
				this._orderBusyDialog.destroy();
			}
		},

		_routePatternMatched: function () {
			// show welcome page if cart is loaded from URL
			var oHistory = History.getInstance();
			if (!oHistory.getPreviousHash() && !sap.ui.Device.system.phone) {
				this.getRouter().getTarget("welcome").display();
			}
			var oCartModel = this.getModel("cartProducts");
			var oCartEntries = oCartModel.getProperty("/cartEntries");
			//enables the proceed and edit buttons if the cart has entries
			if (!jQuery.isEmptyObject(oCartEntries)) {
				oCartModel.setProperty("/showProceedButton", true);
				oCartModel.setProperty("/showEditButton", true);
			}
			//set selection of list back
			var oEntryList = this.byId("entryList");
			oEntryList.removeSelections();
		},

		onEditOrDoneButtonPress: function () {
			this._toggleCfgModel();
		},

		_toggleCfgModel: function () {
			var oCfgModel = this.getView().getModel("cfg");
			var oData = oCfgModel.getData();
			var oBundle = this.getResourceBundle();
			var bDataNoSetYet = !oData.hasOwnProperty("inDelete");
			var bInDelete = (bDataNoSetYet ? true : oData.inDelete);
			var sPhoneMode = (Device.system.phone ? "None" : "SingleSelectMaster");
			var sPhoneType = (Device.system.phone ? "Active" : "Inactive");

			oCfgModel.setData({
				inDelete: !bInDelete,
				notInDelete: bInDelete,
				listMode: (bInDelete ? sPhoneMode : "Delete"),
				listItemType: (bInDelete ? sPhoneType : "Inactive"),
				pageTitle: (bInDelete ? oBundle.getText("cartTitleDisplay") : oBundle.getText("cartTitleEdit"))
			});
		},

		onNavButtonPress: function () {
			this.getOwnerComponent().myNavBack();
		},

		onEntryListPress: function (oEvent) {
			this._showProduct(oEvent.getSource());
		},

		onEntryListSelect: function (oEvent) {
			this._showProduct(oEvent.getParameter("listItem"));
		},

		/**
		 * Called when the "save for later" link of a product in the cart is pressed.
		 * @public
		 * @param {sap.ui.base.Event} oEvent Event object
		 */
		onSaveForLater: function (oEvent) {
			var oBindingContext = oEvent.getSource().getBindingContext(sCartModelName);
			this._changeList(sSavedForLaterEntries, sCartEntries, oBindingContext);
		},

		/**
		 * Called when the "Add back to basket" link of a product in the saved for later list is pressed.
		 * @public
		 * @param {sap.ui.base.Event} oEvent Event object
		 */
		onAddBackToBasket: function (oEvent) {
			var oBindingContext = oEvent.getSource().getBindingContext(sCartModelName);

			this._changeList(sCartEntries, sSavedForLaterEntries, oBindingContext);
		},

		/**
		 * Moves a product from one list to another.
		 * @private
		 * @param {string} sListToAddItem Name of list, where item should be moved to
		 * @param {string} sListToDeleteItem Name of list, where item should be removed from
		 * @param {Object} oBindingContext Binding context of product
		 */
		_changeList: function (sListToAddItem, sListToDeleteItem, oBindingContext) {
			var oCartModel = oBindingContext.getModel();
			var oProduct = oBindingContext.getObject();
			var oModelData = oCartModel.getData();
			// why are the items cloned? - the JSON model checks if the values in the object are changed.
			// if we do our modifications on the same reference, there will be no change detected.
			// so we modify after the clone.
			var oListToAddItem = $.extend({}, oModelData[sListToAddItem]);
			var oListToDeleteItem = $.extend({}, oModelData[sListToDeleteItem]);
			var sProductId = oProduct.ProductId;

			// find existing entry for product
			if (oListToAddItem[sProductId] === undefined) {
				// copy new entry
				oListToAddItem[sProductId] = $.extend({}, oProduct);
			}

			//Delete the saved Product from cart
			delete oListToDeleteItem[sProductId];
			oCartModel.setProperty("/" + sListToAddItem, oListToAddItem);
			oCartModel.setProperty("/" + sListToDeleteItem, oListToDeleteItem);
		},

		_showProduct: function (item) {
			// send event to refresh
			var sPath = item.getBindingContext(sCartModelName).getPath();
			var oEntry = this.getView().getModel(sCartModelName).getProperty(sPath);
			var sId = oEntry.ProductId;
			if (!sap.ui.Device.system.phone) {
				// Update the URL hash making the products inside the cart bookmarkable
				this._oRouter.navTo("cartProductView", {
					productId: sId
				}, true); // Don't create a history entry
			} else {
				this._oRouter.navTo("cartProduct", {productId: sId});
			}
		},

		onCartEntriesDelete: function (oEvent) {
			this._deleteProduct(sCartEntries, oEvent);
		},

		onSaveForLaterDelete: function (oEvent) {
			this._deleteProduct(sSavedForLaterEntries, oEvent);
		},

		/**
		 * Helper function for the deletion of items from <code>cart</code> or <code>savedForLater</code> list.
		 * If the delete button is pressed, a message dialog will open.
		 * @private
		 * @param {string} sCollection the collection name
		 * @param {sap.ui.base.Event} oEvent Event object
		 */
		_deleteProduct: function (sCollection, oEvent) {
			var oBindingContext = oEvent.getParameter("listItem").getBindingContext(sCartModelName);
			var sEntryId = oBindingContext.getObject().ProductId;
			var oBundle = this.getResourceBundle();

			// show confirmation dialog
			MessageBox.show(oBundle.getText("cartDeleteDialogMsg"), {
				title: oBundle.getText("cartDeleteDialogTitle"),
				actions: [
					MessageBox.Action.DELETE,
					MessageBox.Action.CANCEL
				],
				onClose: function (oAction) {
					if (oAction !== MessageBox.Action.DELETE) {
						return;
					}
					var oCartModel = oBindingContext.getModel();
					var oCollectionEntries = $.extend({}, oCartModel.getData()[sCollection]);

					delete oCollectionEntries[sEntryId];

					// update model
					oCartModel.setProperty("/" + sCollection, $.extend({}, oCollectionEntries));
				}
			});
		},

		/**
		 * Called when the proceed button in the cart is pressed.
		 * Navigates to the checkout wizard
		 * @public
		 */
		onProceedButtonPress: function () {
			this._oRouter.navTo("checkout");
		},

		/**
		 * Helper function to reset the cart model.
		 * @private
		 */
		_resetCart: function () {
			var oCartModel = this.getView().getModel(sCartModelName);

			//all relevant cart properties are set back to default. Content is deleted.
			oCartModel.setProperty("/cartEntries", {});
			oCartModel.setProperty("/savedForLaterEntries", {});
			oCartModel.setProperty("/totalPrice", "0");

			//navigates back to home screen
			this._oRouter.navTo("home");
			if (!Device.system.phone) {
				this._oRouter.getTargets().display("welcome");
			}
		}
	});
});
