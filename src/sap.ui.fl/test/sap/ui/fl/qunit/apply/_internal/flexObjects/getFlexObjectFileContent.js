sap.ui.define([
	"sap/ui/fl/Layer"
], function(
	Layer
) {
	"use strict";

	return function () {
		return {
			fileName: "foo",
			fileType: "change",
			reference: "sap.ui.demoapps.rta.fiorielements.Component",
			packageName: "$TMP",
			content: {
				originalControlType: "sap.m.Label"
			},
			layer: Layer.CUSTOMER,
			texts: {
				originalText: {
					value: "My original text",
					type: "XFLD"
				}
			},
			namespace: "apps/sap.ui.demoapps.rta.fiorielements/changes/",
			projectId: "sap.ui.demoapps.rta.fiorielements",
			creation: "2021-12-14T08:34:50.8705900Z",
			originalLanguage: "EN",
			support: {
				generator: "sap.ui.rta.command",
				service: "",
				user: "",
				sapui5Version: "1.100.0-SNAPSHOT",
				sourceChangeFileName: "",
				compositeCommand: "",
				command: "rename"
			},
			oDataInformation: {},
			sourceSystem: "someSystem",
			sourceClient: "someClient"
		};
	};
});