sap.ui.require([
		'sap/ui/demo/cart/localService/mockserver',
		'sap/ui/demo/cart/test/configureOpa'
	], function (mockserver) {
		"use strict";
		mockserver.init();

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

