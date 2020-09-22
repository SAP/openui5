sap.ui.define(['sap/ui/core/UIComponent', 'sap/ui/core/mvc/View'],
	function (Component, View) {
	"use strict";

	var OPC = Component.extend("testdata.mvc.stashed.Component", {
		metadata: {
			version: "1.0",
            manifest: "json"
        },
        createContent: function() {
            var oApp = new sap.m.App();
            var oModel = this.getModel();
            var oMetaModel = oModel.getMetaModel();
            oMetaModel.loaded().then(function() {
                return sap.ui.view({
                   viewName: "testdata.mvc.stashed.OP",
                   type: "XML",
                   models : oModel,
                   preprocessors : {
                       xml : {
                           bindingContexts : {
                               "meta" : oMetaModel.getMetaContext("/BusinessPartnerSet")
                           },
                           models : {
                               "meta" : oMetaModel
                            }
                        }
                    }
                });
            }).then(function(oView) {
                oApp.addPage(oView);
            });
            return oApp;
        }
    });

	return OPC;

});
