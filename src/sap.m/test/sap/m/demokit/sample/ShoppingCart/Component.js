sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
		"use strict";

		return UIComponent.extend("sap.m.sample.ShoppingCart.Component", {

			metadata : {
				dependencies : {
					libs : [
						"sap.m"
					]
				},
				config : {
					sample : {
						iframe : "webapp/index.html",
						stretch : true,
						files : [
							"webapp/Component.js",
							"webapp/css/style.css",
							"webapp/i18n/appTexts.properties",
							"webapp/img/114_iPhone-Retina_Web_Clip.png",
							"webapp/img/144_iPad_Retina_Web_Clip.png",
							"webapp/img/57_iPhone_Desktop_Launch.png",
							"webapp/img/72_iPad_Desktop_Launch.png",
							"webapp/img/favicon.ico",
							"webapp/img/product/HT-1010.jpg",
							"webapp/img/product/HT-1030.jpg",
							"webapp/img/product/HT-1032.jpg",
							"webapp/img/product/HT-1040.jpg",
							"webapp/img/product/HT-1052.jpg",
							"webapp/img/product/HT-1063.jpg",
							"webapp/img/product/HT-1064.jpg",
							"webapp/img/product/HT-1071.jpg",
							"webapp/img/product/HT-1072.jpg",
							"webapp/img/product/HT-1073.jpg",
							"webapp/img/product/HT-1111.jpg",
							"webapp/img/product/HT-1112.jpg",
							"webapp/img/product/HT-1114.jpg",
							"webapp/img/product/HT-1138.jpg",
							"webapp/img/product/HT-2027.jpg",
							"webapp/img/product/HT-6120.jpg",
							"webapp/index.html",
							"webapp/model/Config.js",
							"webapp/model/Product.json",
							"webapp/model/ProductCategory.json",
							"webapp/model/metadata.xml",
							"webapp/test/AllJourneysConfig.js",
							"webapp/test/AllJourneysWithIFrame.js",
							"webapp/test/BuyProductJourney.js",
							"webapp/test/BuyProductJourneyJQueryOnly.html",
							"webapp/test/DeleteProductJourney.js",
							"webapp/test/action/BuyProductJourneyAction.js",
							"webapp/test/arrangement/BuyProductJourneyArrangement.js",
							"webapp/test/arrangement/DeleteProductJourneyArrangement.js",
							"webapp/test/assertion/BuyProductJourneyAssertion.js",
							"webapp/test/opaTestsWithIFrame.qunit.html",
							"webapp/test/pageobjects/Cart.js",
							"webapp/test/pageobjects/Category.js",
							"webapp/test/pageobjects/Dialog.js",
							"webapp/test/pageobjects/Home.js",
							"webapp/test/pageobjects/Product.js",
							"webapp/util/Formatter.js",
							"webapp/view/App.view.xml",
							"webapp/view/Cart.controller.js",
							"webapp/view/Cart.view.xml",
							"webapp/view/Category.controller.js",
							"webapp/view/Category.view.xml",
							"webapp/view/Home.controller.js",
							"webapp/view/Home.view.xml",
							"webapp/view/NotFound.controller.js",
							"webapp/view/NotFound.view.xml",
							"webapp/view/Order.controller.js",
							"webapp/view/Order.view.xml",
							"webapp/view/Product.controller.js",
							"webapp/view/Product.view.xml",
							"webapp/view/Welcome.controller.js",
							"webapp/view/Welcome.view.xml"
						]
					}
				}
			}

		});
	});
