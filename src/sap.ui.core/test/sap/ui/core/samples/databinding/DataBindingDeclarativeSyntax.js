sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/mvc/View",
    "sap/ui/core/mvc/XMLView"
], function (JSONModel, View, XMLView) {
    "use strict";

    var oModel = new JSONModel();
    oModel.setData({
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
    sap.ui.getCore().setModel(oModel);

    var oModel2 = new JSONModel();
    oModel2.setData({
        amount: 3000.53,
        currency: "$"
    });
    sap.ui.getCore().setModel(oModel2, "model2");

    var pXMLView = XMLView.create({
        viewName: "testdata.complexsyntax"
    });

    var pTypedView = View.create({
        viewName: "module:testdata/ComplexSyntax"
    });

    Promise.all([pXMLView, pTypedView]).then(function (aViews) {
        aViews[0].placeAt("XMLView");
        aViews[1].placeAt("TypedView");
    });
});