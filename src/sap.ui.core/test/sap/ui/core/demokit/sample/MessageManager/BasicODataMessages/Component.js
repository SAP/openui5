sap.ui.define([
    "sap/ui/core/UIComponent"
], function (UIComponent) {
    "use strict";

    return UIComponent.extend("sap.ui.core.sample.MessageManager.BasicODataMessages.Component", {
        metadata: {
            rootView: "sap.ui.core.sample.MessageManager.BasicODataMessages.View",
            dependencies: {
                libs: [
					"sap.m",
                    "sap.ui.layout"
                ]
            },

            config: {
                sample: {
                    stretch: true,
                    files: [
                        "localService/mockdata/Employees.json",
                        "localService/response/ODataErrorResponse.json",
                        "localService/metadata.xml",
                        "localService/mockserver.js",
                        "Controller.controller.js",
                        "MessagePopover.fragment.xml",
                        "View.view.xml"
                    ]
                }
            }
        }
    });

});
