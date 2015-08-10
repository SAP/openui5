jQuery.sap.require("util.Formatter");
jQuery.sap.require("sap.m.MessageToast");
jQuery.sap.require("sap.m.MessageBox");

sap.ui.controller("view.Product", {

	onInit : function () {
		this._router = sap.ui.core.UIComponent.getRouterFor(this);
		this._router.getRoute("product").attachPatternMatched(this._routePatternMatched, this);
		this._router.getRoute("cartProduct").attachPatternMatched(this._routePatternMatched, this);

		// register for events
		var oBus = sap.ui.getCore().getEventBus();
		oBus.subscribe("shoppingCart", "updateProduct", this.fnUpdateProduct, this);
	},

	_routePatternMatched: function(oEvent) {
		var sId = oEvent.getParameter("arguments").productId,
			oView = this.getView(),
			sPath = "/Products('" + sId + "')";

		/**
		 * This is how you would implement deepLinking in your app.
		 *
		 * Because the oDataService which we use is not fully implemented, we cannot deep link. This code only workds
		 * with the mockserver, which can be enabled via URL-parameter "responerOn=true"
		 */
		var that = this;
		var oModel = oView.getModel();
		var oData = oModel.getData(sPath);
		oView.bindElement(sPath);
		//if there is no data the model has to request new data
		if (!oData) {
			oView.getElementBinding().attachEventOnce("dataReceived", function() {
				that._checkIfProductAvailable(sPath, sId);
			});
		}
	},

	fnUpdateProduct: function(sChannel, sEvent, oData) {
		var sPath = "/Products('" + oData.productId + "')";
		this.getView().bindElement(sPath);
		this._checkIfProductAvailable(sPath, oData.productId);
	},

	_checkIfProductAvailable: function(sPath, sId) {
		var oModel = this.getView().getModel();
		var oData = oModel.getData(sPath);

		// show not found page
		if (!oData) {
			this._router.getTargets().display("notFound", sId);
		}
	},

	handleAddButtonPress : function (oEvent) {
		var oBundle = sap.ui.getCore().getModel("i18n").getResourceBundle();
		var oProduct = this.getView().getBindingContext().getObject();
		var sProdStatus = oProduct.status;
		var that = this;

		switch (sProdStatus) {
		case "D":
			//show message dialog
			sap.m.MessageBox.show(
				oBundle.getText("PRODUCT_STATUS_DISCONTINUED_MSG"),{
				icon: sap.m.MessageBox.Icon.ERROR,
				titles: oBundle.getText("PRODUCT_STATUS_DISCONTINUED_TITLE"),
				actions: [sap.m.MessageBox.Action.CLOSE]
		});
			break;
		case "O":
			// show message dialog
			sap.m.MessageBox.show(
				oBundle.getText("PRODUCT_STATUS_OUT_OF_STOCK_MSG"), {
					icon: sap.m.MessageBox.Icon.QUESTION,
					title: oBundle.getText("PRODUCT_STATUS_OUT_OF_STOCK_TITLE"),
					actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
					onClose: function (oAction) {
						// order
						if (sap.m.MessageBox.Action.OK === oAction) {
							that._addProduct(oProduct);
						}
					}
				});
			break;
		case "A":
			this._addProduct(oProduct);
			break;
		default:
			if (!model.Config.isMock) {
				this._addProduct(oProduct);
			} else {
				// log error
				jQuery.sap.log.error("Unhandled product status: " + oProduct.status + ", " + model.Config.isMock);
			}
			break;
		}
	},

	_addProduct: function(oProduct) {
		var oCartModel = this.getView().getModel("cartProducts");
		var oCartData = oCartModel.getData();
		var aCartEntries = oCartData.entries;

		// find existing entry for product
		var oEntry = null;
		for (var i = 0 ; i < aCartEntries.length ; i ++) {
			if (aCartEntries[i].ProductId === oProduct.ProductId) {
				oEntry = aCartEntries[i];
				break;
			}
		}

		if (oEntry === null) {
			// create new entry
			oEntry = {
				Id : jQuery.sap.uid(),
				Quantity : 1,
				Name : oProduct.Name,
				ProductId : oProduct.ProductId,
				ProductName : oProduct.Name,
				Price : oProduct.Price,
				SupplierName : oProduct.SupplierName,
				Status : oProduct.status,
				Weight : oProduct.Weight,
				PictureUrl : oProduct.PictureUrl
			};
			oCartData.entries[oCartData.entries.length] = oEntry;

		} else {
			// update existing entry
			oEntry.Quantity += 1;
		}

		// recalculate total price
		oCartData.totalPrice = 0;
		for (var j = 0 ; j < oCartData.entries.length ; j ++) {
			oCartData.totalPrice += parseFloat(oCartData.entries[j].Price) * oCartData.entries[j].Quantity;
		}

		//if there is at least one entry, the edit button is shown
		oCartData.showEditAndProceedButton = true;

		// update model
		oCartModel.setData(oCartData);

		var oBundle = sap.ui.getCore().getModel("i18n").getResourceBundle();
		sap.m.MessageToast.show(oBundle.getText("PRODUCT_MSG_ADDED_TO_CART"));
	},

	handleCartButtonPress :  function (oEvent) {
		this._router.navTo("cart");
	},

	handleNavButtonPress : function (oEvent) {
		this.getOwnerComponent().myNavBack();
	}

});
