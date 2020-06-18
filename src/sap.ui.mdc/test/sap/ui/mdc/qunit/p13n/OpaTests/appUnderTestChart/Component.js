/*!
 * ${copyright}
 */

/**
 * @fileOverview Application component to display information on entities from the TEA_BUSI
 *   OData service.
 * @version @version@
 */
sap.ui.define([
	"sap/ui/core/sample/common/Component",
	"sap/ui/test/TestUtils",
	"sap/ui/fl/FakeLrepConnectorLocalStorage",
	'sap/chart/library' // In here as chart lib cannot be loaded in manifest due to interference with sinon - workarround
], function (
	CommonComponent,
	TestUtils,
	FakeLrepConnectorLocalStorage,
	chartLib // In here as chart lib cannot be loaded in manifest due to interference with sinon - workarround
) {
	"use strict";

	return CommonComponent.extend("appUnderTestChart.Component", {
		metadata: {
			manifest: "json"
		},

		init: function () {
			CommonComponent.prototype.init.apply(this, arguments);

			FakeLrepConnectorLocalStorage.forTesting.synchronous.store("id_1550048095839_52_Copy", {
				conditions: {},
				content: {
					title: "Country Visible On First Position"
				},
				creation: "2019-02-13T08:54:55.879Z",
				fileName: "id_1550048095839_52_Copy",
				fileType: "ctrl_variant",
				layer: "USER",
				namespace: "apps/appUnderTestChart/variants/",
				originalLanguage: "EN",
				packageName: "$TMP",
				reference: "appUnderTestChart.Component",
				self: "apps/appUnderTestChart/variants/id_1550048095839_52_Copy.ctrl_variant",
				support: {
					generator: "Change.createInitialFileContent",
					service: "",
					user: "",
					sapui5Version: "1.63.0-SNAPSHOT"
				},
				texts: {},
				validAppVersions: {
					creation: "${version}",
					from: "${version}"
				},
				variantManagementReference: "IDViewOfAppUnderTestChart--IDVariantManagementOfAppUnderTestChart",
				variantReference: "IDViewOfAppUnderTestChart--IDVariantManagementOfAppUnderTestChart"
			});
			FakeLrepConnectorLocalStorage.forTesting.synchronous.store("id_1550048095839_53_addItem", {
				changeType: "addItem",
				conditions: {},
				content: {
					index: 0,
					kind: "Dimension",
					label: "Country",
					name: "Country",
					propertyPath: "Country",
					role: "category"
				},
				context: "",
				creation: "2019-03-18T09:55:05.883Z",
				dependentSelector: {},
				fileName: "id_1550048095839_53_addItem",
				fileType: "change",
				jsOnly: false,
				layer: "VENDOR",
				moduleName: "",
				namespace: "apps/appUnderTestChart/changes/",
				oDataInformation: {},
				originalLanguage: "EN",
				packageName: "$TMP",
				projectId: "appUnderTestChart",
				reference: "appUnderTestChart.Component",
				selector: {id: "IDViewOfAppUnderTestChart--IDChartOfAppUnderTestChart", idIsLocal: true},
				id: "IDViewOfAppUnderTestChart--IDChartOfAppUnderTestChart",
				idIsLocal: true,
				support: {
					generator: "Change.createInitialFileContent",
					sapui5Version: "1.64.0-SNAPSHOT",
					user: "",
					service: ""
				},
				compositeCommand: "",
				sourceChangeFileName: "",
				texts: {},
				validAppVersions: {creation: "${version}", from: "${version}"},
				from: "${version}",
				variantReference: "id_1550048095839_52_Copy"
			});
			FakeLrepConnectorLocalStorage.forTesting.synchronous.store("id_1550048095839_54_addItem", {
				changeType: "addItem",
				conditions: {},
				content: {
					index: 0,
					kind: "Dimension",
					label: "Country",
					name: "Country",
					propertyPath: "Country",
					role: "category"
				},
				context: "",
				creation: "2019-03-18T09:55:05.883Z",
				dependentSelector: {},
				fileName: "id_1550048095839_54_addItem",
				fileType: "change",
				jsOnly: false,
				layer: "USER",
				moduleName: "",
				namespace: "apps/appUnderTestChart/changes/",
				oDataInformation: {},
				originalLanguage: "EN",
				packageName: "$TMP",
				projectId: "appUnderTestChart",
				reference: "appUnderTestChart.Component",
				selector: {id: "IDViewOfAppUnderTestChart--IDChartOfAppUnderTestChart", idIsLocal: true},
				id: "IDViewOfAppUnderTestChart--IDChartOfAppUnderTestChart",
				idIsLocal: true,
				support: {
					generator: "Change.createInitialFileContent",
					sapui5Version: "1.64.0-SNAPSHOT",
					user: "",
					service: ""
				},
				compositeCommand: "",
				sourceChangeFileName: "",
				texts: {},
				validAppVersions: {creation: "${version}", from: "${version}"},
				from: "${version}",
				variantReference: "id_1550048095839_52_Copy"
			});

			FakeLrepConnectorLocalStorage.enableFakeConnector();
			TestUtils.setupODataV4Server(this.oSandbox, {
				"$metadata": {
					source: "metadata.xml"
				},
				"SalesDenormalized?$apply=groupby((Date,ProductName),aggregate(Amount))": {
					source: "SalesDenormalized01.json"
				},
				"SalesDenormalized?$apply=groupby((Date,ProductName),aggregate(Amount,Forecast))": {
					source: "SalesDenormalized02.json"
				},
				"SalesDenormalized": {
					source: "SalesDenormalized03.json"
				},
				"SalesDenormalized?$apply=groupby((Country,Date,ProductName),aggregate(Amount,Forecast))": {
					source: "SalesDenormalized04.json"
				},
				"SalesDenormalized?$apply=groupby((Country,Date,ProductName),aggregate(Amount))": {
					source: "SalesDenormalized05.json"
				},
				"SalesDenormalized?$apply=groupby((Country,Date,ProductName),aggregate(Amount,Forecast))&$orderby=Forecast": {
					source: "SalesDenormalized06.json"
				},
				"SalesDenormalized?$apply=groupby((ProductName),aggregate(Amount))": {
					source: "SalesDenormalized07.json"
				},
				"SalesDenormalized?$apply=groupby((ProductName),aggregate(Amount,Forecast))": {
					source: "SalesDenormalized08.json"
				},
				"SalesDenormalized?$apply=groupby((ProductName),aggregate(Forecast))": {
					source: "SalesDenormalized09.json"
				},
				"SalesDenormalized?$apply=groupby((ProductName),aggregate(Forecast))&$orderby=Forecast": {
					source: "SalesDenormalized10.json"
				},
				"SalesDenormalized?$apply=groupby((Country,CurrencyCode,Date,ProductName),aggregate(Amount))": {
					source: "SalesDenormalized11.json"
				}
			}, "appUnderTestChart/data", "/sap/opu/odata4/IWBEP/TEA/default/IWBEP/TEA_BUSI/0001/");
		}
	});
});
