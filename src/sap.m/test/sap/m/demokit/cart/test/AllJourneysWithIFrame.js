sap.ui.require([
		'sap/ui/demo/cart/test/configureOpa'
	], function () {
		"use strict";

		sap.ui.require([
				'sap/ui/demo/cart/test/BuyProductJourney',
				'sap/ui/demo/cart/test/DeleteProductJourney'
			], function (BuyProductJourney, DeleteProductJourney) {


				BuyProductJourney.start(function (Given) {
						Given.iStartMyAppInAFrame('../index.html?responderOn=true');
					},
					function (Then) {
						Then.iTeardownMyAppFrame();
					}
				);

				DeleteProductJourney.start(
					function (Given) {
						Given.iStartMyAppInAFrame('../index.html?responderOn=true&sap-ui-language=en');
					},
					function (Then) {
						Then.iTeardownMyAppFrame();
					}
				);

				QUnit.start();

			}
		);

	}
);

