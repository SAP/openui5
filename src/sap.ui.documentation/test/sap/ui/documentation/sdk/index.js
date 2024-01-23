/*!
 * ${copyright}
 */

(function() {
    "use strict";

    sap.ui.require(["sap/ui/core/Core"], function(Core) {

        window['sap-ui-documentation-static'] = true;
        document.cookie = "dk_approval_requested=1";
        //We preset the path to api-index.json file to be the local mock folder
        window['sap-ui-documentation-config'] = {
            apiInfoRootURL: 'test-resources/sap/ui/documentation/sdk/integration/mock/docs/api/api-index.json'
        };

        Core.ready(function () {

        sap.ui.require([
            "sap/m/Page",
            "sap/ui/core/ComponentContainer",
            "sap/ui/documentation/sdk/controller/util/APIInfo"
            ], function (Page, ComponentContainer, APIInfo) {

                APIInfo._setRoot("test-resources/sap/ui/documentation/sdk/integration/mock");

                // initialize the UI component
                new Page({
                    showHeader : false,
                    content : new ComponentContainer({
                        height : "100%",
                        name : "sap.ui.documentation.sdk",
                        settings : {
                            id : "sdk"
                        }
                    })
                }).placeAt("content");
            });
        });
    });
})();
