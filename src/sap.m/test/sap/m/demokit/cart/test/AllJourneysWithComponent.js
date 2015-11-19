jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
jQuery.sap.require("sap.ui.qunit.qunit-coverage");
jQuery.sap.require("sap.ui.thirdparty.sinon");
jQuery.sap.require("sap.ui.thirdparty.sinon-qunit");

/*
global QUnit
 */
QUnit.config.autostart = false;
QUnit.config.reorder = false;


sap.ui.require([
		'sap/ui/test/Opa5',
		'sap/ui/demo/cart/test/AllJourneysConfig',
		'sap/ui/demo/cart/localService/mockserver'
	], function (Opa5,  AllJourneysConfig, mockserver) {
		"use strict";
		mockserver.init();

		AllJourneysConfig.buyProductConfig();
		AllJourneysConfig.deleteProductConfig();


		sap.ui.require([
				'sap/ui/demo/cart/test/BuyProductJourney',
				'sap/ui/demo/cart/test/DeleteProductJourney'
			], function (BuyProductJourney, DeleteProductJourney) {

				BuyProductJourney.start(
					function (Given) {
						Given.iStartMyUIComponent({
							componentConfig: {
								name: "sap.ui.demo.cart"
							},
							hash: ""
						});
					},
					function (Then) {
						Then.iTeardownMyUIComponent();
					});

				DeleteProductJourney.start(
					function (Given) {
						Given.iStartMyUIComponent({
							componentConfig: {
								name: "sap.ui.demo.cart"
							},
							hash: ""
						});
					},
					function (Then) {
						Then.iTeardownMyUIComponent();
					});

				QUnit.start();
			}
		);

	}
);