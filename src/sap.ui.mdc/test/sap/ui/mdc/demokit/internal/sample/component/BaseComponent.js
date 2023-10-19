// define a root UIComponent which exposes the main view

sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/model/odata/v4/ODataModel",
	"sap/ui/mdc/sample/mockserver/mockServer",
	"sap/ui/model/json/JSONModel",
	"sap/ui/mdc/enums/TableSelectionMode"
], function(UIComponent, ODataModel, MockServer, JSONModel, TableSelectionMode) {
	"use strict";

	return UIComponent.extend("sap.ui.mdc.sample.BaseComponent", {
		metadata: {
			manifest: "json"
		},

		init: function(){
			// call the init function of the parent
			UIComponent.prototype.init.apply(this, arguments);
			const oMockServer = new MockServer();
			oMockServer.init();

			const sODataServiceUrl = "/sap/opu/odata4/IWBEP/V4_SAMPLE/default/IWBEP/V4_GW_SAMPLE_BASIC/0001/"; // set model on component
			const oModel = new ODataModel({
				serviceUrl: sODataServiceUrl,
				groupId: "$direct",
				autoExpandSelect: true,
				operationMode: "Server"
			});

			// set model on component
			this.setModel(oModel);

			const aSelectionModes = [];
			for (const p in TableSelectionMode) {
				aSelectionModes.push({key: p, text: TableSelectionMode[p]});
			}
			this.setModel(new JSONModel({"selectionmodes": aSelectionModes}), "tablesettings");
		}
	});

});
