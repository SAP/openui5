sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/model/odata/v2/ODataModel",
    "sap/m/sample/TreeOData/localService/mockserver"
], function (UIComponent, ODataModel, mockserver) {
    "use strict";

    return  UIComponent.extend("sap.m.sample.TreeOData.Component", {
        metadata: {
            rootView: {
                "viewName": "sap.m.sample.TreeOData.View",
                "type": "XML",
                "async": true
            },
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
                        "localService/mockdata/Nodes.json",
                        "localService/metadata.xml",
                        "localService/mockserver.js",
                        "Component.js",
                        "View.view.xml"
                    ]
                }
            }
        },
        init : function (){
            // call the init function of the parent
            UIComponent.prototype.init.apply(this, arguments);

            var sODataServiceUrl = "/here/goes/your/odata/service/url/";

            // init our mock server
            mockserver.init(sODataServiceUrl);

            // set model on component
            this.setModel(
                new ODataModel(sODataServiceUrl, {
                    json : true,
                    useBatch : true
                })
            );
        }
    });
});
