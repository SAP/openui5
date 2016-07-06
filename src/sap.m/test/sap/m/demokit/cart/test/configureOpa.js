sap.ui.define([
		'sap/ui/test/Opa5',
		'sap/ui/demo/cart/test/arrangement/Arrangement',
		'sap/ui/demo/cart/test/action/BuyProductJourneyAction',
		'sap/ui/demo/cart/test/assertion/BuyProductJourneyAssertion'
	], function (Opa5, Arrangement, BuyProductJourneyAction, BuyProductJourneyAssertion) {
		"use strict";


		Opa5.extendConfig({
			arrangements : new Arrangement(),
			actions : new BuyProductJourneyAction(),
			assertions : new BuyProductJourneyAssertion(),
			viewNamespace : "sap.ui.demo.cart.view."
		});

	}
);
