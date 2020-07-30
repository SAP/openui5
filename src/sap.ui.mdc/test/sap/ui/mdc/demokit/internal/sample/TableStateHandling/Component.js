// define a root UIComponent which exposes the main view

sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/model/odata/v4/ODataModel",
	"sap/ui/mdc/sample/mockserver/mockServer"
], function(UIComponent, ODataModel, MockServer) {
	"use strict";

	return UIComponent.extend("sap.ui.mdc.sample.TableStateHandling.Component", {
		metadata: {
			manifest: "json"
		},

		init : function(){
			// call the init function of the parent
			UIComponent.prototype.init.apply(this, arguments);
			var oMockServer = new MockServer();
			oMockServer.init();

			var sODataServiceUrl = "/sap/opu/odata4/IWBEP/V4_SAMPLE/default/IWBEP/V4_GW_SAMPLE_BASIC/0001/"; // set model on component
			var oModel = new ODataModel({
				serviceUrl: sODataServiceUrl,
				groupId: "$direct",
				synchronizationMode: 'None',
				autoExpandSelect: true,
				operationMode: "Server"
			});

			// set model on component
			this.setModel(oModel);
		}
	});

});
