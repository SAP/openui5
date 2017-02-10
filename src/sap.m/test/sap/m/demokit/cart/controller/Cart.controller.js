sap.ui.define([
	'sap/ui/demo/cart/controller/BaseController',
	'sap/ui/model/json/JSONModel',
	'sap/ui/Device',
	'sap/ui/demo/cart/model/formatter',
	'sap/m/MessageBox',
	'sap/m/MessageToast',
	'sap/m/Dialog',
	'sap/m/Button'
], function (
	BaseController,
	JSONModel,
	Device,
	formatter,
	MessageBox,
	MessageToast,
	Dialog,
	Button) {
	var sCartModelName = "cartProducts";
	var sSavedForLaterEntries = "savedForLaterEntries";
	var sCartEntries = "cartEntries";

	return BaseController.extend("sap.ui.demo.cart.controller.Cart", {
		formatter: formatter,

		onInit: function () {
			this._router = sap.ui.core.UIComponent.getRouterFor(this);
			this._router.getRoute("cart").attachPatternMatched(this._routePatternMatched, this);

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
			var oCartModel = this.getModel("cartProducts");
			var oCartEntries = oCartModel.getProperty("/cartEntries");
			//enables the proceed and edit buttons if the cart has entries
			if (!jQuery.isEmptyObject(oCartEntries)) {
				oCartModel.setProperty("/showProceedButton", true);
				oCartModel.setProperty("/showEditButton", true);
			}
			//set selection of list back
			var oEntryList = this.getView().byId("entryList");
			oEntryList.removeSelections();
		},

		onEditOrDoneButtonPress: function () {
			this._toggleCfgModel();
		},

		_toggleCfgModel: function () {
			var oCfgModel = this.getView().getModel("cfg");
			var oData = oCfgModel.getData();
			var bDataNoSetYet = !oData.hasOwnProperty("inDelete");
			var bInDelete = (bDataNoSetYet) ? true : oData.inDelete;
			var oBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			oCfgModel.setData({
				inDelete: !bInDelete,
				notInDelete: bInDelete,
				listMode: bInDelete ? Device.system.phone ? "None" : "SingleSelectMaster" : "Delete",
				listItemType: bInDelete ? Device.system.phone ? "Active" : "Inactive" : "Inactive",
				pageTitle: (bInDelete) ? oBundle.getText("CART_TITLE_DISPLAY") : oBundle.getText("CART_TITLE_EDIT")
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
		 * Calls the private function <code>_changeList</code>, like the <code>onAddBackToBasket</code> function
		 * and hands over the binding context of the product item.
		 * If the cart is now empty, the "Proceed" button will be set to invisible.
		 * @public
		 * @param {sap.ui.base.Event} oEvent Event object
		 */
		onSaveForLater: function (oEvent) {
			var oBindingContext = oEvent.getSource().getBindingContext(sCartModelName);
			var oModel = oBindingContext.getModel();
			this._changeList(sSavedForLaterEntries, sCartEntries, oBindingContext);

			if (Object.keys(oModel.getData().cartEntries).length === 0) {
				oModel.setProperty("/showProceedButton", false);
			}
		},

		/**
		 * Called when the "Add back to basket" link of a product in the saved for later list is pressed.
		 * Calls the private function <code>_changeList</code>, like the <code>onSaveForLater</code> function and hands over the binding context
		 * of the product item.
		 * @public
		 * @param {sap.ui.base.Event} oEvent Event object
		 */
		onAddBackToBasket: function (oEvent) {
			var oBindingContext = oEvent.getSource().getBindingContext(sCartModelName);

			this._changeList(sCartEntries, sSavedForLaterEntries, oBindingContext);

			oBindingContext.getModel().setProperty("/showProceedButton", true);
		},

		/**
		 * Called from both <code>onSaveForLater</code> and <code>onAddBackToBasket</code> functions.
		 * Updates the <code>cart</code> model and the <code>saveForLater</code> model when product items are moved between them.
		 * The product is added to the first list and then removed from the other list.
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
				this._router.getTargets().display("productView");
				var bus = sap.ui.getCore().getEventBus();
				bus.publish("shoppingCart", "updateProduct", {productId: sId});
			} else {
				this._router.navTo("cartProduct", {productId: sId});
			}
		},

		onCartEntriesDelete: function (oEvent) {
			this._deleteProduct(sCartEntries, oEvent)
		},

		onSaveForLaterDelete: function (oEvent) {
			this._deleteProduct(sSavedForLaterEntries, oEvent)
		},

		/**
		 * Helper function for the deletion of items from <code>cart</code> or <code>savedForLater</code> list.
		 * If the delete button is pressed, a message dialog will open.
		 * @private
		 * @param {string} sCollection
		 * @param {sap.ui.base.Event} oEvent Event object
		 */
		_deleteProduct : function (sCollection, oEvent) {
			var oBindingContext = oEvent.getParameter("listItem").getBindingContext(sCartModelName);
			var sEntryId = oBindingContext.getObject().ProductId;
			var oModel = oBindingContext.getModel();
			var oBundle = this.getResourceBundle();

			// show confirmation dialog
			MessageBox.show(
				oBundle.getText("CART_DELETE_DIALOG_MSG"), {
					title: oBundle.getText("CART_DELETE_DIALOG_TITLE"),
					actions: [MessageBox.Action.DELETE, MessageBox.Action.CANCEL],
					onClose: function (oAction) {
						if (oAction !== MessageBox.Action.DELETE) {
							return;
						}
						var oCartModel = oBindingContext.getModel();
						var oCollectionEntries = $.extend({}, oCartModel.getData()[sCollection]);

						delete oCollectionEntries[sEntryId];

						// update model
						oCartModel.setProperty("/" + sCollection, $.extend({}, oCollectionEntries));
						if (Object.keys(oModel.getData().cartEntries).length === 0) {
							oModel.setProperty("/showProceedButton", false);
							oModel.setProperty("/showEditButton", false);
						}
					}
				}
			);
		},

		/**
		 * Called when the proceed button in the cart is pressed.
		 * An order dialog will open.
		 * @public
		 * @param {sap.ui.base.Event} oEvent Event object
		 */
		onProceedButtonPress: function (oEvent) {
			var that = this;
			if (!this._orderDialog) {

				// create busy dialog
				var oBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
				this._orderBusyDialog = new sap.m.BusyDialog({
					title: oBundle.getText("CART_BUSY_DIALOG_TITLE"),
					text: oBundle.getText("CART_BUSY_DIALOG_TEXT"),
					showCancelButton: false,
					close: function () {
						sap.m.MessageBox.show(
							oBundle.getText("CART_ORDER_SUCCESS_MSG"), {
								title: oBundle.getText("CART_ORDER_SUCCESS_TITLE")
							});
					}
				});

				// create order dialog
				var oInputView = sap.ui.view({
					id: "Order",
					viewName: "sap.ui.demo.cart.view.Order",
					type: "XML"
				});
				this._orderDialog = new Dialog({
					title: oBundle.getText("CART_ORDER_DIALOG_TITLE"),
					stretch: Device.system.phone,
					content: [
						oInputView
					],
					// Accept button
					leftButton: new Button({
						text: oBundle.getText("CART_ORDER_DIALOG_CONFIRM_ACTION"),
						type: "Accept",
						press: function () {
							var bInputValid = oInputView.getController()._checkInput();
							if (bInputValid) {
								that._orderDialog.close();
								var msg = "Your order was placed.";
								that._resetCart();
								MessageToast.show(msg, {});
							}
						}
					}),
					// Cancel button
					rightButton: new Button({
						text: oBundle.getText("DIALOG_CANCEL_ACTION"),
						press: function () {
							that._orderDialog.close();
						}
					})
				});

				this.getView().addDependent(this._orderDialog);
			}

			// open order dialog
			this._orderDialog.open();
		},

		/**
		 * Helper function to reset the cart model.
		 * @private
		 */
		_resetCart: function () {
			var oCartModel = this.getView().getModel(sCartModelName);
			var oCartModelData = oCartModel.getData();

			//all relevant cart properties are set back to default. Content is deleted.
			oCartModelData.cartEntries = {};
			oCartModelData.totalPrice = "0";
			oCartModelData.showEditButton = false;
			oCartModelData.showProceedButton = false;
			oCartModel.setData(oCartModelData);

			//navigates back to home screen
			this._router.navTo("home");
			if (!Device.system.phone) {
				this._router.getTargets().display("welcome");
			}
		}
	});
});
