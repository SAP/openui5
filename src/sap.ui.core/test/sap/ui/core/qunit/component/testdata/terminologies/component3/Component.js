sap.ui.define(['jquery.sap.global', 'sap/ui/core/UIComponent'],
    function (jQuery, UIComponent) {
        "use strict";

        return UIComponent.extend("testdata.terminologies.component3.Component", {
            metadata: {
                version: "1.0",
                rootView: {
                    viewName: "testdata.terminologies.component3.Main",
                    type: "XML",
                    id: "mainView",
                    async: true
                },
                manifest: "json"
            }
        });
    });
