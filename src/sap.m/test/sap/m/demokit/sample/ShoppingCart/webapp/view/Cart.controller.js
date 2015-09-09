jQuery.sap.require("util.Formatter");
jQuery.sap.require("sap.m.MessageBox");

sap.ui.controller("view.Cart", {

	onInit : function () {
		this._router = sap.ui.core.UIComponent.getRouterFor(this);
		this._router.getRoute("cart").attachPatternMatched(this._routePatternMatched, this);

		// set initial ui configuration model
		var oCfgModel = new sap.ui.model.json.JSONModel({});
		this.getView().setModel(oCfgModel, "cfg");
		this._toggleCfgModel();
	},

	onExit : function () {
		if (this._orderDialog) {
			this._orderDialog.destroy();
		}
		if (this._orderBusyDialog) {
			this._orderBusyDialog.destroy();
		}
	},

	_routePatternMatched : function(oEvent) {
		//set selection of list back
		var oEntryList = this.getView().byId("entryList");
		oEntryList.removeSelections();
	},

	handleEditOrDoneButtonPress : function (oEvent) {
		this._toggleCfgModel();
	},

	_toggleCfgModel : function () {
		var oCfgModel = this.getView().getModel("cfg");
		var oData = oCfgModel.getData();
		var bDataNoSetYet = !oData.hasOwnProperty("inDelete");
		var bInDelete = (bDataNoSetYet) ? true : oData.inDelete;
		var oBundle = sap.ui.getCore().getModel("i18n").getResourceBundle();
		oCfgModel.setData({
			inDelete : !bInDelete,
			notInDelete : bInDelete,
			listMode: bInDelete ? sap.ui.Device.system.phone ? "None" : "SingleSelectMaster" : "Delete",
			listItemType: bInDelete ? sap.ui.Device.system.phone ? "Active" : "Inactive" : "Inactive",
			pageTitle : (bInDelete) ? oBundle.getText("CART_TITLE_DISPLAY") : oBundle.getText("CART_TITLE_EDIT")
		});
	},

	handleNavButtonPress : function (oEvent) {
		this.getOwnerComponent().myNavBack();
	},

	handleEntryListPress : function (oEvent) {
		this._showProduct(oEvent.getSource());
	},

	handleEntryListSelect : function (oEvent) {
		this._showProduct(oEvent.getParameter("listItem"));
	},

	_showProduct : function (item) {
		// send event to refresh
		var sPath = item.getBindingContext("cartProducts").getPath();
		var oEntry = this.getView().getModel("cartProducts").getProperty(sPath);
		var sId = oEntry.ProductId;
		if (!sap.ui.Device.system.phone) {
			this._router.getTargets().display("product");
			var bus = sap.ui.getCore().getEventBus();
			bus.publish("shoppingCart", "updateProduct", {productId: sId});
		} else {
			this._router.navTo("cartProduct", {productId: sId});
		}
	},

	handleEntryListDelete : function (oEvent) {
		// show confirmation dialog
		var sEntryId = oEvent.getParameter("listItem").getBindingContext("cartProducts").getObject().Id;
		var oBundle = sap.ui.getCore().getModel("i18n").getResourceBundle();
		sap.m.MessageBox.show(
				oBundle.getText("CART_DELETE_DIALOG_MSG"), {
					title: oBundle.getText("CART_DELETE_DIALOG_TITLE"),
					actions: [sap.m.MessageBox.Action.DELETE, sap.m.MessageBox.Action.CANCEL],
					onClose: jQuery.proxy(function (oAction) {
						if (sap.m.MessageBox.Action.DELETE === oAction) {
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

	handleProceedButtonPress : function (oEvent) {
		var that = this;
		if (!this._orderDialog) {

			// create busy dialog
			var oBundle = sap.ui.getCore().getModel("i18n").getResourceBundle();
			this._orderBusyDialog = new sap.m.BusyDialog({
				title : oBundle.getText("CART_BUSY_DIALOG_TITLE"),
				text : oBundle.getText("CART_BUSY_DIALOG_TEXT"),
				showCancelButton : false,
				close : function () {
					sap.m.MessageBox.show(
						oBundle.getText("CART_ORDER_SUCCESS_MSG"), {
							title: oBundle.getText("CART_ORDER_SUCCESS_TITLE")
					});
				}
			});

			// create order dialog
			var oInputView = sap.ui.view({
				id : "Order",
				viewName : "view.Order",
				type : "XML"
			});
			this._orderDialog = new sap.m.Dialog({
				title : oBundle.getText("CART_ORDER_DIALOG_TITLE"),
				stretch: sap.ui.Device.system.phone,
				content : [
					oInputView
				],
				leftButton : new sap.m.Button({
					text : oBundle.getText("CART_ORDER_DIALOG_CONFIRM_ACTION"),
					type : "Accept",
					press : function () {
						var bInputValid = oInputView.getController()._checkInput();
						if (bInputValid) {
							that._orderDialog.close();
							var msg = "Your order was placed.";
							that._resetCart();
							sap.m.MessageToast.show(msg, {});
						}
					}
				}),
				rightButton : new sap.m.Button({
					text : oBundle.getText("DIALOG_CANCEL_ACTION"),
					press : function () {
						that._orderDialog.close();
					}
				})
			});
		}

		// open order dialog
		this._orderDialog.open();
	},

	_resetCart: function() {
		//delete cart content
		var oCartProductsModel = this.getView().getModel("cartProducts");
		var oCartProductsModelData = oCartProductsModel.getData();
		oCartProductsModelData.entries = [];
		oCartProductsModelData.totalPrice = "0";
		oCartProductsModelData.showEditAndProceedButton = false;
		oCartProductsModel.setData(oCartProductsModelData);
		this._router.navTo("Home");
		if (!sap.ui.Device.system.phone) {
			this._router.getTargets().display("welcome");
		}
	}
});
