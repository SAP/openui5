sap.ui.define([
	'sap/ui/demo/cart/controller/BaseController',
	'sap/ui/demo/cart/model/cart',
	'sap/ui/model/json/JSONModel',
	'sap/ui/model/Filter',
	'sap/ui/demo/cart/model/formatter'
], function (BaseController, cart, JSONModel, Filter, formatter) {
	"use strict";

	return BaseController.extend("sap.ui.demo.cart.controller.Welcome", {

		_iCarouselTimeout: 0, // a pointer to the current timeout
		_iCarouselLoopTime: 8000, // loop to next picture after 8 seconds

		formatter: formatter,

		_mFilters: {
			Promoted: [new Filter("Type", "EQ", "Promoted")],
			Viewed: [new Filter("Type", "EQ", "Viewed")],
			Favorite: [new Filter("Type", "EQ", "Favorite")]
		},

		onInit: function () {
			var oViewModel = new JSONModel({
				welcomeCarouselShipping: 'img/ShopCarouselShipping.jpg',
				welcomeCarouselInviteFriend: 'img/ShopCarouselInviteFriend.jpg',
				welcomeCarouselTablet: 'img/ShopCarouselTablet.jpg',
				welcomeCarouselCreditCard: 'img/ShopCarouselCreditCard.jpg',
				Promoted: [],
				Viewed: [],
				Favorite: [],
				Currency: "EUR"
			});
			this.getView().setModel(oViewModel, "view");
			this.getRouter().attachRouteMatched(this._onRouteMatched, this);
			this.getRouter().getTarget("welcome").attachDisplay(this._onRouteMatched, this);

			// select random carousel page at start
			var oWelcomeCarousel = this.byId("welcomeCarousel");
			var iRandomIndex = Math.floor(Math.random() * oWelcomeCarousel.getPages().length - 1);
			oWelcomeCarousel.setActivePage(oWelcomeCarousel.getPages()[iRandomIndex]);
		},

		/**
		 * lifecycle hook that will initialize the welcome carousel
		 */
		onAfterRendering: function () {
			this.onCarouselPageChanged();
		},

		_onRouteMatched: function (oEvent) {
			// we do not need to call this function if the url hash refers to product or cart product
			if (oEvent.getParameter("name") !== "product" && oEvent.getParameter("name") !== "cartProduct") {
				var aPromotedData = this.getView().getModel("view").getProperty("/Promoted");
				if (!aPromotedData.length) {
					var oModel = this.getModel();
					Object.keys(this._mFilters).forEach(function (sFilterKey) {
						oModel.read("/FeaturedProducts", {
							urlParameters: {
								"$expand": "Product"
							},
							filters: this._mFilters[sFilterKey],
							success: function (oData) {
								this.getModel("view").setProperty("/" + sFilterKey, oData.results);
								if (sFilterKey === "Promoted") {
									this._selectPromotedItems();
								}
							}.bind(this)
						});
					}.bind(this));
				}
			}
		},

		/**
		 * clear previous animation and initialize the loop animation of the welcome carousel
		 */
		onCarouselPageChanged: function () {
			clearTimeout(this._iCarouselTimeout);
			this._iCarouselTimeout = setTimeout(function () {
				var oWelcomeCarousel = this.byId("welcomeCarousel");
				if (oWelcomeCarousel) {
					oWelcomeCarousel.next();
					this.onCarouselPageChanged();
				}
			}.bind(this), this._iCarouselLoopTime);
		},

		/**
		 * Event handler to determine which link the user has clicked
		 * @param {sap.ui.base.Event} oEvent the press event of the link
		 */
		onSelectProduct: function (oEvent) {
			var oContext = oEvent.getSource().getBindingContext("view");
			var sCategoryId = oContext.getProperty("Product/Category");
			var sProductId = oContext.getProperty("Product/ProductId");
			this.getOwnerComponent().getRouter().navTo("product", {
				id: sCategoryId,
				productId: sProductId
			});
		},

		/**
		 * Navigates to the category page on phones
		 */
		onShowCategories: function () {
			this.getRouter().navTo("categories");
		},

		/**
		 * Opens a lightbox when clicking on the picture
		 * @param {sap.ui.base.Event} oEvent the press event of the image
		 */
		onPicturePress: function (oEvent) {
			var sPath = "view>" + oEvent.getSource().getBindingContext("view").getPath() + "/Product";
			this.byId("lightBox").bindElement({path: sPath});
			this.byId("lightBox").open();
		},

		/**
		 * Event handler to determine which button was clicked
		 * @param {sap.ui.base.Event} oEvent the button press event
		 */
		onAddButtonPress: function (oEvent) {
			var oResourceBundle = this.getModel("i18n").getResourceBundle();
			var oProduct = oEvent.getSource().getBindingContext("view").getObject();
			var oCartModel = this.getModel("cartProducts");
			cart.addToCart(oResourceBundle, oProduct, oCartModel);
		},

		/**
		 * Select two random elements from the promoted products array
		 * @private
		 */
		_selectPromotedItems: function () {
			var aPromotedItems = this.getView().getModel("view").getProperty("/Promoted");
			var iRandom1, iRandom2 = Math.floor(Math.random() * aPromotedItems.length);
			do {
				iRandom1 = Math.floor(Math.random() * aPromotedItems.length);
			} while (iRandom1 === iRandom2);
			this.getModel("view").setProperty("/Promoted", [aPromotedItems[iRandom1], aPromotedItems[iRandom2]]);
		}
	});
});