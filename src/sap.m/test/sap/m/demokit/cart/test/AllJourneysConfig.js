sap.ui.define([
		'sap/ui/test/Opa5',
		'sap/ui/demo/cart/test/arrangement/DeleteProductJourneyArrangement',
		'sap/ui/demo/cart/test/arrangement/BuyProductJourneyArrangement',
		'sap/ui/demo/cart/test/action/BuyProductJourneyAction',
		'sap/ui/demo/cart/test/assertion/BuyProductJourneyAssertion'
	], function (Opa5, DeleteProductJourneyArrangement, BuyProductJourneyArrangement, BuyProductJourneyAction, BuyProductJourneyAssertion) {

		return {

			buyProductConfig : function(){
				Opa5.extendConfig({
					arrangements : new BuyProductJourneyArrangement(),
					actions : new BuyProductJourneyAction(),
					assertions : new BuyProductJourneyAssertion(),
					viewNamespace : "view."
				});
			},

			deleteProductConfig : function(){
				Opa5.extendConfig({
					arrangements : new DeleteProductJourneyArrangement(),
					viewNamespace : "view."
				});
			}

		};

	}
);