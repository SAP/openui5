sap.ui.define(["sap/ui/core/mvc/ControllerExtensionProvider", "sap/ui/core/mvc/XMLView"], function(ControllerExtensionProvider, XMLView) {
    "use strict";

    //register an extension provider to simulate a real extension coming from flex
    ControllerExtensionProvider.registerExtensionProvider("sample.ExtensionProvider");

    //add an async view
    XMLView.create({
        viewName: "sample.Main"
    }).then(function(oView) {
        oView.placeAt("content1");
    });
});