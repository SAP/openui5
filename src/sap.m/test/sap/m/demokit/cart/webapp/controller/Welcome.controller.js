sap.ui.define([
	"./BaseController",
	"../model/cart",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"../model/formatter"
], (BaseController, cart, JSONModel, Filter, FilterOperator, formatter) => {
	"use strict";

	return BaseController.extend("sap.ui.demo.cart.controller.Welcome", {
		_iCarouselTimeout: 0, // a pointer to the current timeout

		_iCarouselLoopTime: 8000, // loop to next picture after 8 seconds

		formatter,

		_mFilters: {
			Promoted: [new Filter({path: "Type", operator: FilterOperator.EQ, value1: "Promoted"})],
			Viewed: [new Filter({path: "Type", operator: FilterOperator.EQ, value1: "Viewed"})],
			Favorite: [new Filter({path: "Type", operator: FilterOperator.EQ, value1: "Favorite"})]
		},

		onInit() {
			const oViewModel = new JSONModel({
				welcomeCarouselShipping: 'sap/ui/demo/cart/img/Shipping_273087.jpg',
				welcomeCarouselInviteFriend: 'sap/ui/demo/cart/img/InviteFriend_276352.jpg',
				welcomeCarouselTablet: 'sap/ui/demo/cart/img/Tablet_275777.jpg',
				welcomeCarouselCreditCard: 'sap/ui/demo/cart/img/CreditCard_277268.jpg',
				Promoted: [],
				Viewed: [],
				Favorite: [],
				Currency: "EUR"
			});
			this.getView().setModel(oViewModel, "view");
			this.getRouter().attachRouteMatched(this._onRouteMatched, this);

			// select random carousel page at start
			const oWelcomeCarousel = this.byId("welcomeCarousel");
			const iRandomIndex = Math.floor(Math.abs(Math.random()) * oWelcomeCarousel.getPages().length);
			oWelcomeCarousel.setActivePage(oWelcomeCarousel.getPages()[iRandomIndex]);
		},

		/**
		 * Lifecycle hook that will initialize the welcome carousel
		 */
		onAfterRendering() {
			this.onCarouselPageChanged();
		},

		_onRouteMatched(oEvent) {
			const sRouteName = oEvent.getParameter("name");

			// always display two columns for home screen
			if (sRouteName === "home") {
				this._setLayout("Two");
			}
			// we do not need to call this function if the url hash refers to product or cart product
			if (sRouteName !== "product" && sRouteName !== "cartProduct") {
				const aPromotedData = this.getView().getModel("view").getProperty("/Promoted");
				if (!aPromotedData.length) {
					const oModel = this.getModel();
					Object.keys(this._mFilters).forEach((sFilterKey) => {
						oModel.read("/FeaturedProducts", {
							urlParameters: {
								"$expand": "Product"
							},
							filters: this._mFilters[sFilterKey],
							success: (oData) => {
								this.getModel("view").setProperty(`/${sFilterKey}`, oData.results);
								if (sFilterKey === "Promoted") {
									this._selectPromotedItems();
								}
							}
						});
					});
				}
			}
		},

		/**
		 * clear previous animation and initialize the loop animation of the welcome carousel
		 */
		onCarouselPageChanged() {
			clearTimeout(this._iCarouselTimeout);
			this._iCarouselTimeout = setTimeout(() => {
				const oWelcomeCarousel = this.byId("welcomeCarousel");
				if (oWelcomeCarousel) {
					oWelcomeCarousel.next();
					this.onCarouselPageChanged();
				}
			}, this._iCarouselLoopTime);
		},

		/**
		 * Event handler to determine which link the user has clicked
		 * @param {sap.ui.base.Event} oEvent the press event of the link
		 */
		onSelectProduct(oEvent) {
			const oContext = oEvent.getSource().getBindingContext("view");
			const sCategoryId = oContext.getProperty("Product/Category");
			const sProductId = oContext.getProperty("Product/ProductId");
			this.getRouter().navTo("product", {
				id: sCategoryId,
				productId: sProductId
			});
		},

		/**
		 * Navigates to the category overview on phones
		 */
		onShowCategories() {
			this.getRouter().navTo("categories");
		},

		/**
		 * Event handler to determine which button was clicked
		 * @param {sap.ui.base.Event} oEvent the button press event
		 */
		async onAddToCart(oEvent) {
			const oResourceBundle = await this.getModel("i18n").getResourceBundle();
			const oProduct = oEvent.getSource().getBindingContext("view").getObject();
			const oCartModel = this.getModel("cartProducts");
			cart.addToCart(oResourceBundle, oProduct, oCartModel);
		},

		/**
		 * Navigate to the generic cart view
		 * @param {sap.ui.base.Event} oEvent the button press event
		 */
		onToggleCart(oEvent) {
			const bPressed = oEvent.getParameter("pressed");

			this._setLayout(bPressed ? "Three" : "Two");
			this.getRouter().navTo(bPressed ? "cart" : "home");
		},

		/**
		 * Select two random elements from the promoted products array.
		 */
		_selectPromotedItems() {
			let iRandom1;
			const aPromotedItems = this.getView().getModel("view").getProperty("/Promoted");
			const iRandom2 = Math.floor(Math.random() * aPromotedItems.length);
			do {
				iRandom1 = Math.floor(Math.random() * aPromotedItems.length);
			} while (iRandom1 === iRandom2);
			this.getModel("view").setProperty("/Promoted", [aPromotedItems[iRandom1], aPromotedItems[iRandom2]]);
		}
	});
});
