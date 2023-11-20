sap.ui.define([
	'sap/ui/core/mvc/Controller',
	"sap/ui/integration/library"
], function (Controller, library) {
	"use strict";

	var CardDesign = library.CardDesign;

	return Controller.extend("sap.ui.integration.sample.Design.Design", {
		onDesignChange: function (oEvent) {
			var listCard = this.getView().byId("listCardId1"),
				objectCard = this.getView().byId("objectCardId1"),
				bSelected = oEvent.getParameter('selected');

			listCard.setDesign(bSelected ? CardDesign.Transparent : CardDesign.Solid);
			objectCard.setDesign(bSelected ? CardDesign.Transparent : CardDesign.Solid);
		}
	});
});