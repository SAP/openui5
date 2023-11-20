sap.ui.define( [
	"sap/m/sample/ComparisonPattern/app/model/formatter",
	"sap/m/MessageBox",
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/ResizeHandler",
	"sap/ui/model/json/JSONModel"
], function (formatter, MessageBox, Controller, ResizeHandler, JSONModel) {
	"use strict";

	var SCREEN_MAX_SIZES = {
		PHONE: 600,
		TABLET: 1024
	};

	var ITEMS_COUNT_PER_SCREEN_SIZE = {
		PHONE: 1,
		TABLET: 2,
		DESKTOP: 4
	};

	return Controller.extend("sap.m.sample.ComparisonPattern.app.controller.Comparison", {
		formatter: formatter,

		onInit: function () {
			this._oRootControl = this.getOwnerComponent().getRootControl();
			this.oRouter = this.getOwnerComponent().getRouter();
			this.oRouter.attachRouteMatched(this.onRouteMatched, this);

			this._aCachedItems = {};
			this._aAllProducts = this.getOwnerComponent().getModel().getData().ProductCollection;
			this._aSelectedItems = [];
			this._iPagesCount = this._getPagesCount(this._oRootControl.$().innerWidth());
			this._bIsDesktop = this._checkIsDesktop();

			this._iFirstItem = 0;
			this._iLastItem = this._iPagesCount;

			this._setModels();

			// Resize handler is needed in order us to determine how many items
			// will be shown next to each other, depending on the screen size.
			this._iResizeHandlerId = ResizeHandler.register(
				this.getOwnerComponent().getRootControl(),
				this._onResize.bind(this));
		},

		onRouteMatched: function(oEvent) {
			this._aSelectedItems = this.getOwnerComponent().aSelectedItems;
			this._aSelectedItemsIds = this._getSelectedItemsIds();

			// Pages count needs to be updated in some scenarios: for example, when we
			// are on a Desktop screen and want to show 4 items,  but the user previously
			// has selected to compare only 2 items. When later he selects to compare
			// more items and the screen size allows more items to be shown, we update
			// the visible pages count of the Carousel control and also the corresponding
			// data about these items displayed in the table-like view.
			this._iPagesCount = this._getPagesCount(this._oRootControl.$().innerWidth());
			this._bIsDesktop = this._checkIsDesktop();
			this._updateFirstPage();

			this._aProductsToShow = this._getProductsToShow(this._aAllProducts);

			this.getView().getModel("settings").setData({
				pagesCount: this._iPagesCount,
				isDesktop: this._bIsDesktop
			});
			this.getView().getModel("products").setData(this._aProductsToShow);
		},

		onAfterRendering: function () {
			this._oCarouselSnapped = this.getView().byId("carousel-snapped");
			this._oCarouselExpanded = this.getView().byId("carousel-expanded");
			this._oDynamicPage = this.getView().byId("dynamic-page");
		},

		onPageChanged: function (oEvent) {
			var aActivePages = oEvent.getParameter("activePages"),
				oProductsData;

			// The data about the selected products (in the table-like view) needs to be
			// updated, according to the new active (visible) pages of the Carousel control.
			// This event is triggered upon sliding through Carousel's pages.
			this._iFirstItem = aActivePages[0];
			this._iLastItem = aActivePages[aActivePages.length - 1] + 1;
			this._updateCarouselsActivePage();

			oProductsData = this._getModelData(this._aProductsToShow.Products);
			this.getView().getModel("products").setData(oProductsData);
		},

		onPanelExpanded: function (oEvent) {
			var oSource = oEvent.getSource();

			oSource.getParent().getContent()[1].getItems().forEach(function (oControl) {
				oControl.getItems()[1].setVisible(oSource.getExpanded());
			});
		},

		onStateChange: function (oEvent) {
			var bIsExpanded = oEvent.getParameter("isExpanded");

			// This is needed because of animation issues with Carousel control
			// when it is placed in the Title area of the DynamicPage
			bIsExpanded && this._oDynamicPage.removeSnappedContent(this._oCarouselSnapped);
			!bIsExpanded && this._oDynamicPage.addSnappedContent(this._oCarouselSnapped);
		},

		handleButtonPress: function (oEvent) {
			MessageBox.information(
				"Item added to shopping cart.");
		},

		_onResize: function (oEvent) {
			var iWidth = oEvent.size.width,
				iNewPagesCount = this._getPagesCount(iWidth);

			if (iNewPagesCount !== this._iPagesCount) {
				this._iPagesCount = iNewPagesCount;
				this.getView().getModel("settings").setProperty("/pagesCount", this._iPagesCount);

				this._bIsDesktop = this._checkIsDesktop();
				this.getView().getModel("settings").setProperty("/isDesktop", this._bIsDesktop);

				this._updateFirstPage();
				this._updateProductsData();
			}
		},

		_updateFirstPage: function () {
			var iAllProductsCount = this._aSelectedItems.length;

			// In some cases we need to adjust the first visible page, because it may
			// happen that the screen was smaller and we only showed 1 item, but then
			// the screen becomes bigger and we need to show, for example, 4 items.
			// If the user was on the last page of the Carousel control (considered
			// as first and only visibile page),  when the screen gets bigger and the
			// visible pages become more, the first page should be adjusted in a way
			// that allows us to show the required number of visible pages.
			if (this._iFirstItem + this._iPagesCount > iAllProductsCount) {
				this._iFirstItem = iAllProductsCount - this._iPagesCount;
				this._updateCarouselsActivePage();
			}
		},

		_updateCarouselsActivePage: function () {
			// Synchronization of the two Carousels
			this._oCarouselSnapped.setActivePage(this._oCarouselSnapped.getPages()[this._iFirstItem]);
			this._oCarouselExpanded.setActivePage(this._oCarouselExpanded.getPages()[this._iFirstItem]);
		},

		_setModels: function () {
			this.getView().setModel(new JSONModel(), "settings");
			this.getView().setModel(new JSONModel(), "products");
		},

		_updateProductsData: function () {
			var oProductsData = this._getModelData(this._aProductsToShow.Products);

			this.getView().getModel("products").setData(oProductsData);
		},

		_getPagesCount: function (iWidth) {
			var iAllProducts = this._aSelectedItems.length,
				iPagesCount;

			if (iWidth <= SCREEN_MAX_SIZES.PHONE) {
				iPagesCount = ITEMS_COUNT_PER_SCREEN_SIZE.PHONE;
			} else if (iWidth <= SCREEN_MAX_SIZES.TABLET) {
				iPagesCount = ITEMS_COUNT_PER_SCREEN_SIZE.TABLET;
			} else {
				iPagesCount = ITEMS_COUNT_PER_SCREEN_SIZE.DESKTOP;
			}

			if (iAllProducts && iPagesCount > iAllProducts) {
				iPagesCount = iAllProducts;
			}

			return iPagesCount;
		},

		_checkIsDesktop: function () {
			return this._iPagesCount === ITEMS_COUNT_PER_SCREEN_SIZE.DESKTOP;
		},

		_getSelectedItemsIds: function () {
			return this._aSelectedItems.map(function (item) {
				return parseInt(item.split("/").pop());
			});
		},

		_getProductsToShow: function (aAllProducts) {
			var aSelectedProducts = [];

			this._aSelectedItemsIds.forEach(function (id) {
				aSelectedProducts.push(aAllProducts[id]);
			});

			return this._getModelData(aSelectedProducts);
		},

		_getModelData: function (aSelectedProducts) {
			var allProps = [],
				ilastPage = this._iFirstItem + this._iPagesCount,
				oProp,
				oCurrentProduct,
				oCurrentProductInformation,
				oPropertyValue;

			this._iLastItem = ilastPage > aSelectedProducts.length ? aSelectedProducts.length : ilastPage;

			// Manipulates data in a way that allows us to be able to display the name
			// of the property as a Panel title and the values of this property on each
			// of the products to be displayed in different columns in a table-like view.
			for (var key in aSelectedProducts[0]) {
				if (aSelectedProducts[0].hasOwnProperty(key) && key !== "ProductPicUrl") {
					oProp = {};
					oProp.key = key;
					oProp.values = [];

					for (var i = this._iFirstItem; i < this._iLastItem; i++) {
						oCurrentProduct = aSelectedProducts[i];
						oCurrentProductInformation = this._aCachedItems[oCurrentProduct.ProductId]
													&& this._aCachedItems[oCurrentProduct.ProductId][key];

						// Performance optimization logic: reusing already created information for products,
						// instead of creating a new one, each time a same product is selected.
						if (oCurrentProductInformation) {
							oProp.values.push(oCurrentProductInformation);

						} else {
							oPropertyValue = {
								text: "<strong>" + aSelectedProducts[i][key] + "</strong>",
								description: "Some description of the property here"
							};

							oProp.values.push(oPropertyValue);
							this._cacheProductInformation(oCurrentProduct, key, oPropertyValue);
						}
					}

					allProps.push(oProp);
				}
			}

			return {
				Products: aSelectedProducts,
				Props: allProps
			};
		},

		_cacheProductInformation: function (oProduct, sProp, oPropertyValue) {
			var sProductId = oProduct.ProductId;

			if (!this._aCachedItems[sProductId]) {
				this._aCachedItems[sProductId] = {};
			}

			this._aCachedItems[sProductId][sProp] = oPropertyValue;
		}

	});

});