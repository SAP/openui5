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
	"sap/ui/fl/FakeLrepConnectorLocalStorage",
	'sap/chart/library' // In here as chart lib cannot be loaded in manifest due to interference with sinon - workarround
], function (
	CommonComponent,
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
					title: "Language Visible On First Position"
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
					name: "language_code",
					role: "category"
				},
				context: "",
				creation: "2019-03-18T09:55:05.883Z",
				dependentSelector: {},
				fileName: "id_1550048095839_53_addItem",
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
		}
	});
});
