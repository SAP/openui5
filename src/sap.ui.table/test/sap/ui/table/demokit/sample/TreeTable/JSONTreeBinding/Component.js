sap.ui.define([
    'sap/ui/core/UIComponent'
], function (UIComponent) {
    "use strict";

    return UIComponent.extend("sap.ui.table.sample.TreeTable.JSONTreeBinding.Component", {
        metadata: {
            rootView: {
                "viewName": "sap.ui.table.sample.TreeTable.JSONTreeBinding.View",
                "type": "XML",
                "async": true
            },
            dependencies: {
                libs: [
                    "sap.ui.table",
                    "sap.ui.unified",
                    "sap.m"
                ]
            },

            config: {
                sample: {
                    stretch: true,
                    files: [
                        "View.view.xml",
                        "Controller.controller.js",
                        "Clothing.json"
                    ]
                }
            }
        }
    });

});
