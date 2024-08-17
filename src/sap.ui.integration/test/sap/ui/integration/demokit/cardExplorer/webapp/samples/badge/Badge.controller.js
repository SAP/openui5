sap.ui.define([
	'sap/ui/core/mvc/Controller'
], function(Controller) {
"use strict";

	return Controller.extend("sap.ui.integration.sample.Badge.Badge", {
			onButtonPress: function () {
				var oCard1 = this.getView().byId("cardId1"),
					oCard2 = this.getView().byId("cardId2");

				oCard1.getCustomData()[1].setVisible(true);
				oCard2.getCustomData()[0].setVisible(true);
			}
		});
});