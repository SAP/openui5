// define a root UIComponent which exposes the main view

sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/model/odata/v4/ODataModel",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/mdc/table/OpaTests/mockserver/mockServer"
], function(
	/** @type sap.ui.core.UIComponent */ UIComponent,
	/** @type sap.ui.model.v4.ODataModel */ ODataModel,
	/** @type sap.ui.model.json.JSONModel */ JSONModel,
	/** @type sap.ui.core.mvc.XMLView */ XMLView,
	/** @type mockserver.mockServer */ MockServer) {
	"use strict";

	return UIComponent.extend("sap.ui.mdc.table.OpaTests.appODataV4Flat.Component", {
		metadata: {
			manifest: "json",
			interfaces: ["sap.ui.core.IAsyncContentCreation"]
		},
		init: function() {
			const oMockServer = new MockServer();
			oMockServer.init();

			this.setModel(new ODataModel({
				serviceUrl: "/sap/opu/odata4/IWBEP/V4_SAMPLE/default/IWBEP/V4_GW_SAMPLE_BASIC/0001/",
				groupId: "$direct",
				autoExpandSelect: true,
				operationMode: "Server"
			}));

			UIComponent.prototype.init.apply(this, arguments);
		},
		createContent: function() {
			const oUrlParams = new URLSearchParams(window.location.search);

			return XMLView.create({
				id: "MyView",
				viewName: "sap.ui.mdc.table.OpaTests.appODataV4Flat.View",
				async: true,
				preprocessors: {
					xml: {
						models: {
							data: new JSONModel({
								tableType: oUrlParams.get("tableType")
							})
						}
					}
				}
			}).then(function(oView) {
				return oView;
			});
		}
	});
});
