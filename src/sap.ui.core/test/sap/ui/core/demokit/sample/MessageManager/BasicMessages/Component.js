sap.ui.define([
    "sap/ui/core/UIComponent"
], function (UIComponent) {
    "use strict";

    return UIComponent.extend("sap.ui.core.sample.MessageManager.BasicMessages.Component", {
        metadata: {
            rootView: "sap.ui.core.sample.MessageManager.BasicMessages.View",
            dependencies: {
                libs: [
                    "sap.m",
                    "sap.ui.layout",
                    "sap.ui.unified"
                ]
            },

            config: {
                sample: {
                    stretch: true,
                    files: [
                        "Controller.controller.js",
                        "MessagePopover.fragment.xml",
                        "View.view.xml"
                    ]
                }
            }
        }
    });

});
