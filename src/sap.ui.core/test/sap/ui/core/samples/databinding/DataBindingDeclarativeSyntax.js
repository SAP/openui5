sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/mvc/View",
    "sap/ui/core/mvc/XMLView"
], function (JSONModel, View, XMLView) {
    "use strict";

	(async function() {
        const oModel = new JSONModel({
            singleEntry: {
                firstName: "John",
                lastName: "Doe",
                birthday: { day: 1, month: 4, year: 1970 },
                amount: 6000.94,
                gender: 'male',
                address: [{ city: "Walldorf" }],
                enabled: true
            },
            table: [{
                firstName: "Horsti",
                lastName: "von Drueben",
                birthday: { day: 1, month: 4, year: 1972 },
                amount: 6000.94,
                gender: 'male',
                address: [{ city: "Walldorf" }],
                enabled: true
            }, {
                firstName: "Egon",
                lastName: "the Ugly",
                birthday: { day: 10, month: 4, year: 1952 },
                amount: 6000.94,
                gender: 'male',
                address: [{ city: "Walldorf" }],
                enabled: true
            }, {
                firstName: "Verena",
                lastName: "die Schoene",
                birthday: { day: 10, month: 4, year: 1982 },
                amount: 6000.94,
                gender: 'female',
                address: [{ city: "Walldorf" }],
                enabled: true
            }]
        });

        const oModel2 = new JSONModel({
            amount: 3000.53,
            currency: "$"
        });

        // XMLView
		const oXMLView = await XMLView.create({
			viewName: "testdata.complexsyntax"
		});
		oXMLView.setModel(oModel).setModel(oModel2, "model2");
        oXMLView.placeAt("XMLView");

        // TypedView
		const oTypedView = await View.create({
			viewName: "module:testdata/ComplexSyntax"
		});
		oTypedView.setModel(oModel).setModel(oModel2, "model2");
		oTypedView.placeAt("TypedView");
	})();
});
