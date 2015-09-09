sap.ui.define(['sap/ui/test/Opa5'], function (Opa5) {
	return Opa5.extend("sap.ui.demo.cart.test.arrangement.DeleteProductJourneyArrangement", {
		iStartMyApp : function(){
			return this.iStartMyAppInAFrame('../index.html?responderOn=true&sap-ui-language=en');
		}
	});
});

