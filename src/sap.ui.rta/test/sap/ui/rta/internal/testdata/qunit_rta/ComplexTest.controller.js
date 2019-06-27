(function() {
	"use strict";

	sap.ui.controller("sap.ui.rta.qunitrta.ComplexTest", {
		onInit : function () {
			jQuery.sap.require("sap.ui.core.util.MockServer");
			this._sResourcePath = jQuery.sap.getResourcePath("sap/ui/rta/qunitrta/");
			var sManifestUrl = this._sResourcePath + "/manifest.json",
				oManifest = jQuery.sap.syncGetJSON(sManifestUrl).data,
				oUriParameters = jQuery.sap.getUriParameters();

			var iAutoRespond = (oUriParameters.get("serverDelay") || 1000),
				oMockServer, dataSource, sMockServerPath, sMetadataUrl, aEntities = [],
				oDataSources = oManifest["sap.app"]["dataSources"],
				MockServer = sap.ui.core.util.MockServer;

			sap.ui.core.util.MockServer.config({
				autoRespond: true,
				autoRespondAfter: iAutoRespond
			});

			var fnGetDataPromise = function(oView) {
				return new Promise(function (resolve) {
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

					//do we have a mock url in the app descriptor
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
								aEntitySetsNames : aEntities
							});
						}
						//else if *Other types can be inserted here, like Annotations*
						oMockServer.start();
						jQuery.sap.log.info("Running the app with mock data for " + property);

						if (property === "mainService") {
							var oModel, oView;

							oModel = new sap.ui.model.odata.v2.ODataModel(dataSource.uri, {
								json: true,
								loadMetadataAsync: true
							});

							oModel.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);
							oModel.setDefaultCountMode(sap.ui.model.odata.CountMode.None);
							this._oModel = oModel;

							oView = this.getView();
							oView.setModel(oModel);

							var data = {
								readonly: false,
								mandatory: false,
								visible: true,
								enabled: true
							};

							var oStateModel = new sap.ui.model.json.JSONModel();
							oStateModel.setData(data);
							oView.setModel(oStateModel, "state");

							this._dataPromise = fnGetDataPromise(oView);
						}
					} else {
						jQuery.sap.log.error("Running the app with mock data for " + property);
					}
				}
			}
		},

		_getUrlParameter : function(sParam) {
			var sReturn = "";
			var sPageURL = window.location.search.substring(1);
			var sURLVariables = sPageURL.split('&');
			for (var i = 0; i < sURLVariables.length; i++) {
				var sParameterName = sURLVariables[i].split('=');
				if (sParameterName[0] === sParam) {
					sReturn = sParameterName[1];
				}
			}
			return sReturn;
		},

		switchToAdaptionMode : function() {
			jQuery.sap.require("sap.ui.rta.RuntimeAuthoring");
			var oRta = new sap.ui.rta.RuntimeAuthoring({
				rootControl : sap.ui.getCore().byId("Comp1---idMain1"),
				customFieldUrl : this._sResourcePath + "/testdata/rta/CustomField.html",
				showCreateCustomField : (this._getUrlParameter("sap-ui-xx-ccf") === "true"),
				flexSettings: {
					developerMode: false
				}
			});
			oRta.attachEvent('stop', function() {
				oRta.destroy();
			});
			oRta.start();
		},

		isDataReady: function () {
			return this._dataPromise;
		}

	});
})();

