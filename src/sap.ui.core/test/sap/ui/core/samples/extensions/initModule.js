sap.ui.define(["sap/ui/core/mvc/Controller", "sap/ui/core/mvc/XMLView"], function(Controller, XMLView) {
    "use strict";

    //register an extension provider to simulate a real extension coming from flex
    Controller.registerExtensionProvider("sample.ExtensionProvider");

    //add an async view
    XMLView.create({
        viewName: "sample.Main"
    }).then(function(oView) {
        oView.placeAt("content1");
    });
});