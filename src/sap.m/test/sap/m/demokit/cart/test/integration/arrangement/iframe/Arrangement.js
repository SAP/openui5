sap.ui.define(['sap/ui/test/Opa5'], function (Opa5) {
	return Opa5.extend("sap.ui.demo.cart.test.arrangement.DeleteProductJourneyArrangement", {
		iStartMyApp : function (sAdditionalUrlParameters) {
			sAdditionalUrlParameters = sAdditionalUrlParameters || "";
			return this.iStartMyAppInAFrame('../../index.html?sap-ui-language=en&sap-ui-animation=false&serverDelay=0' + sAdditionalUrlParameters);
		}
	});
});