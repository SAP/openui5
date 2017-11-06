sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/model/odata/v2/ODataModel",
    "sap/ui/table/sample/TreeTable/BasicODataTreeBinding/localService/mockserver"
], function (UIComponent, ODataModel, mockserver) {
    "use strict";

    return  UIComponent.extend("sap.ui.table.sample.TreeTable.BasicODataTreeBinding.Component", {
        metadata: {
            rootView: {
                "viewName": "sap.ui.table.sample.TreeTable.BasicODataTreeBinding.View",
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
                        "localService/mockdata/Nodes.json",
                        "localService/metadata.xml",
                        "localService/mockserver.js",
                        "Component.js",
                        "Controller.controller.js",
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
