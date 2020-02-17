sap.ui.define(['jquery.sap.global', 'sap/ui/core/UIComponent'],
    function (jQuery, UIComponent) {
        "use strict";

        return UIComponent.extend("testdata.terminologies.component1.Component", {
            metadata: {
                version: "1.0",
                rootView: {
                    viewName: "testdata.terminologies.Main",
                    type: "XML",
                    id: "mainView",
                    async: true
                },
                manifest: "json"
            }
        });
    });
