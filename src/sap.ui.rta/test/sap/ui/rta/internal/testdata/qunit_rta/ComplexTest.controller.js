sap.ui.define([
	"sap/base/util/UriParameters",
	"sap/base/Log",
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/util/MockServer",
	"sap/ui/model/BindingMode",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/model/odata/CountMode",
	"sap/ui/fl/Utils",
	"sap/ui/core/Core"
], function(
	UriParameters,
	Log,
	Controller,
	MockServer,
	BindingMode,
	JSONModel,
	ODataModel,
	CountMode,
	FlUtils,
	oCore
) {
	"use strict";

	Controller.extend("sap.ui.rta.qunitrta.ComplexTest", {
		onInit() {
			this._sResourcePath = sap.ui.require.toUrl("sap/ui/rta/test");
			var oManifest = FlUtils.getAppComponentForControl(this.getView()).getManifest();
			var iServerDelay = UriParameters.fromQuery(window.location.search).get("serverDelay");

			var iAutoRespond = iServerDelay || 1000;
			var oMockServer;
			var dataSource;
			var sMockServerPath;
			var sMetadataUrl;
			var aEntities = [];
			var oDataSources = oManifest["sap.app"].dataSources;

			MockServer.config({
				autoRespond: true,
				autoRespondAfter: iAutoRespond
			});

			var fnGetDataPromise = function(oView) {
				return new Promise(function(resolve) {
					oView.bindElement({
						path: "/Headers(AccountingDocument='100015012',CompanyCode='0001',FiscalYear='2015')",
						events: {
							dataReceived: resolve
						}
					});
				});
			};

			for (var property in oDataSources) {
				if (oDataSources.hasOwnProperty(property)) {
					dataSource = oDataSources[property];

					// do we have a mock url in the app descriptor
					if (dataSource.settings && dataSource.settings.localUri) {
						if (typeof dataSource.type === "undefined" || dataSource.type === "OData") {
							oMockServer = new MockServer({
								rootUri: dataSource.uri
							});
							sMetadataUrl = this._sResourcePath + dataSource.settings.localUri;
							sMockServerPath = sMetadataUrl.slice(0, sMetadataUrl.lastIndexOf("/") + 1);
							aEntities = dataSource.settings.aEntitySetsNames ? dataSource.settings.aEntitySetsNames : [];
							oMockServer.simulate(sMetadataUrl, {
								sMockdataBaseUrl: sMockServerPath,
								bGenerateMissingMockData: true,
								aEntitySetsNames: aEntities
							});
						}
						// else if *Other types can be inserted here, like Annotations*
						oMockServer.start();
						Log.info(`Running the app with mock data for ${property}`);

						if (property === "mainService") {
							var oModel;
							var oView;

							oModel = new ODataModel(dataSource.uri, {
								json: true,
								loadMetadataAsync: true
							});

							oModel.setDefaultBindingMode(BindingMode.TwoWay);
							oModel.setDefaultCountMode(CountMode.None);
							this._oModel = oModel;

							oView = this.getView();
							oView.setModel(oModel);

							var data = {
								readonly: false,
								mandatory: false,
								visible: true,
								enabled: true
							};

							var oStateModel = new JSONModel();
							oStateModel.setData(data);
							oView.setModel(oStateModel, "state");

							this._dataPromise = fnGetDataPromise(oView);
						}
					} else {
						Log.error(`Running the app with mock data for ${property}`);
					}
				}
			}
		},

		switchToAdaptionMode() {
			sap.ui.require(["sap/ui/rta/api/startAdaptation"], function(startAdaptation) {
				var sUriParam = UriParameters.fromQuery(window.location.search).get("sap-ui-xx-ccf");
				startAdaptation({
					rootControl: oCore.byId("Comp1---idMain1"),
					customFieldUrl: `${this._sResourcePath}/testdata/rta/CustomField.html`,
					showCreateCustomField: sUriParam === "true",
					stop() {
						this.destroy();
					}
				});
			}.bind(this));
		},

		isDataReady() {
			return this._dataPromise;
		}
	});
});

