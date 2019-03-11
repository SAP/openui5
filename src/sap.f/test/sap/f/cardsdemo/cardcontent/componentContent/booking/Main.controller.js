sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast"
], function (Controller, JSONModel, MessageToast) {
    "use strict";

	return Controller.extend("sap.f.cardsdemo.cardcontent.componentContent.booking.Main", {
		onInit: function () {
			var oModel = new JSONModel({
				"cities": [
					{
						"text": "Berlin",
						"key": "BR"
					},
					{
						"text": "London",
						"key": "LN"
					},
					{
						"text": "Madrid",
						"key": "MD"
					},
					{
						"text": "Prague",
						"key": "PR"
					},
					{
						"text": "Paris",
						"key": "PS"
					},
					{
						"text": "Sofia",
						"key": "SF"
					},
					{
						"text": "Vienna",
						"key": "VN"
					}
				]
			});
			this.getView().setModel(oModel);
		},
        onBookPress: function() {
            MessageToast.show(
				"By pressing the 'Book' button a new application can be opened where the actual booking happens. This can be in the same window, in a new tab or in a dialog.",
				{
					my: "center center",
					at: "center center",
					width: "50rem"
				}
			);
		}
	});
});
