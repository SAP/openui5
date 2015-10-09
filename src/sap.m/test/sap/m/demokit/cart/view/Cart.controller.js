sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel',
	'sap/ui/Device',
	'sap/ui/demo/cart/model/formatter',
	'sap/m/MessageBox',
	'sap/m/MessageToast',
	'sap/m/Dialog',
	'sap/m/Button'
], function (
	Controller,
	JSONModel,
	Device,
	formatter,
	MessageBox,
	MessageToast,
	Dialog,
	Button) {
	return Controller.extend("sap.ui.demo.cart.view.Cart", {
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
			//set selection of list back
			var oEntryList = this.getView().byId("entryList");
			oEntryList.removeSelections();
		},

		handleEditOrDoneButtonPress: function () {
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

		handleNavButtonPress: function () {
			this.getOwnerComponent().myNavBack();
		},

		handleEntryListPress: function (oEvent) {
			this._showProduct(oEvent.getSource());
		},

		handleEntryListSelect: function (oEvent) {
			this._showProduct(oEvent.getParameter("listItem"));
		},

		_showProduct: function (item) {
			// send event to refresh
			var sPath = item.getBindingContext("cartProducts").getPath();
			var oEntry = this.getView().getModel("cartProducts").getProperty(sPath);
			var sId = oEntry.ProductId;
			if (!sap.ui.Device.system.phone) {
				this._router.getTargets().display("productView");
				var bus = sap.ui.getCore().getEventBus();
				bus.publish("shoppingCart", "updateProduct", {productId: sId});
			} else {
				this._router.navTo("cartProduct", {productId: sId});
			}
		},

		handleEntryListDelete: function (oEvent) {
			// show confirmation dialog
			var sEntryId = oEvent.getParameter("listItem").getBindingContext("cartProducts").getObject().Id;
			var oBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			MessageBox.show(
				oBundle.getText("CART_DELETE_DIALOG_MSG"), {
					title: oBundle.getText("CART_DELETE_DIALOG_TITLE"),
					actions: [MessageBox.Action.DELETE, MessageBox.Action.CANCEL],
					onClose: jQuery.proxy(function (oAction) {
						if (MessageBox.Action.DELETE === oAction) {
							var oModel = this.getView().getModel("cartProducts");
							var oData = oModel.getData();
							var aNewEntries = jQuery.grep(oData.entries, function (oEntry) {
								var keep = (oEntry.Id !== sEntryId);
								if (!keep) {
									oData.totalPrice = parseFloat(oData.totalPrice).toFixed(2) - parseFloat(oEntry.Price).toFixed(2) * oEntry.Quantity;
								}
								return keep;
							});
							oData.entries = aNewEntries;
							oData.showEditAndProceedButton = aNewEntries.length > 0;
							oModel.setData(oData);
						}
					}, this)
				});
		},

		handleProceedButtonPress: function (oEvent) {
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

		_resetCart: function () {
			//delete cart content
			var oCartProductsModel = this.getView().getModel("cartProducts");
			var oCartProductsModelData = oCartProductsModel.getData();
			oCartProductsModelData.entries = [];
			oCartProductsModelData.totalPrice = "0";
			oCartProductsModelData.showEditAndProceedButton = false;
			oCartProductsModel.setData(oCartProductsModelData);
			this._router.navTo("Home");
			if (!Device.system.phone) {
				this._router.getTargets().display("welcome");
			}
		}
	});
});
