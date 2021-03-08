/*
 * ! ${copyright}
 */
(function() {
	"use strict";

	sap.ui.getCore().attachInit(function() {
		sap.ui.require([
			"this/sample/table/mockserver/mockServer", "sap/ui/model/odata/v4/ODataModel", "sap/ui/model/odata/OperationMode", "this/ViewFactory",
			"sap/ui/core/ComponentContainer", "sap/base/util/UriParameters"
		], function(MockServer, ODataModel, OperationMode, ViewFactory, ComponentContainer, UriParameters) {

			var uriParams = UriParameters.fromURL(window.location.href), bRTA = uriParams.get("rta"), filter = uriParams.get("filter"), sUrl = "/sap/opu/odata4/IWBEP/V4_SAMPLE/default/IWBEP/V4_GW_SAMPLE_BASIC/0001/", view = uriParams.get("view") ? uriParams.get("view") : "Table", tableViewName = {
				"ResponsiveTable": "Table",
				"Table": "GridTable",
				"WithFilter": "TableWithFilter",
				"State": "TableStateHandling"
			}, mModelOptions = {
				serviceUrl: sUrl,
				groupId: "$direct",
				synchronizationMode: 'None',
				autoExpandSelect: true,
				operationMode: OperationMode.Server
			}, oModel = new ODataModel(mModelOptions), oMetaModel = oModel.getMetaModel(), oView;
			view = filter ? "WithFilter" : view;

			var oMockServer = new MockServer();
			oMockServer.started.then(function() {
				new ComponentContainer({
					height: "100%",
					async: true,
					componentCreated: function(oEvt) {
						var oContainer = oEvt.getSource();
						var oComp = oEvt.getParameter("component");
						oComp.setModel(oModel);
						ViewFactory.create({
							id: "onlyTableView",
							viewName: "views." + tableViewName[view],
							height: "100%",
							async: true,
							preprocessors: {
								xml: {
									models: {
										collection: oMetaModel
									}
								}
							}
						}, oModel, oComp).then(function(View) {
							oView = View;
							oContainer.rerender(); // needed to ensure we see something due to all the hacks here to make async view loading work
							if (bRTA) {
								oView.addStyleClass("sapUiTop");
								sap.ui.require([
									"sap/ui/rta/RuntimeAuthoring"
								], function(RuntimeAuthoring) {
									new RuntimeAuthoring({
										rootControl: oView
									}).start();
								});
							}
						});
					},
					name: "MDCTable",
					settings: {
						id: "MDCTable"
					}
				}).placeAt("content");
			});
		});
	});
})();
