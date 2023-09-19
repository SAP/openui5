// define a root UIComponent which exposes the main view

sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/model/odata/v4/ODataModel",
	"sap/ui/mdc/tableOpaTests/mockserver/mockServer"
], function(
	/** @type sap.ui.core.UIComponent */ UIComponent,
	/** @type sap.ui.model.v4.ODataModel */ ODataModel,
	/** @type mockserver.mockServer */ MockServer) {
	"use strict";

	return UIComponent.extend("sap.ui.mdc.tableOpaTests.appUnderTestMDCTable.Component", {
		metadata: {
			id: "appUnderTestMDCTable",
			manifest: "json"
		},

		init: function() {
			const oMockServer = new MockServer();
			oMockServer.init();

			const oModel = new ODataModel({
				serviceUrl: "/sap/opu/odata4/IWBEP/V4_SAMPLE/default/IWBEP/V4_GW_SAMPLE_BASIC/0001/",
				groupId: "$direct",
				synchronizationMode: 'None',
				autoExpandSelect: true,
				operationMode: "Server"
			});

			// set model on component
			this.setModel(oModel);

			// call the init function of the parent
			UIComponent.prototype.init.apply(this, arguments);
		}
	});
});