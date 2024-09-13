sap.ui.define([
 "sap/ui/model/json/JSONModel",
  "sap/ui/core/mvc/XMLView",
  "sap/ui/thirdparty/jquery"
], async function (JSONModel, XMLView, jQuery) {
    'use strict';

    var oModel = new JSONModel();
    oModel.setData({
        itemCol : [{
            lastName : "{Dente}",
            name : "{Al}",
            checked : true,
            linkText : "www.sap.com",
            href : "http://www.sap.com",
            rating : "{4}"
        }, {
            lastName : "{Doe}",
            name : "{John}",
            checked : true,
            linkText : "www.sap.com",
            href : "http://www.sap.com",
            rating : "{5}"
        }, {
            lastName : "{Carlin}",
            name : "{George}",
            checked : true,
            linkText : "www.sap.com",
            href : "http://www.sap.com",
            rating : "{4}"
        }, {
            lastName : "Dente",
            name : "Al",
            checked : true,
            linkText : "www.sap.com",
            href : "http://www.sap.com",
            rating : "4"
        }],
        textExp : "{someBindingSyntax}",
        textVal : "Proper text binding"
    });

    var oView = await XMLView.create({definition:jQuery('#myXml').html()});

    oView.setModel(oModel);

    oView.placeAt("content");
});
