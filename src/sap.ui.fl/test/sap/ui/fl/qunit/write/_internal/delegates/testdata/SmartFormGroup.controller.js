sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/util/MockServer",
	"sap/ui/model/odata/v2/ODataModel"
], function(
	Controller,
	MockServer,
	ODataModel
) {
	"use strict";

	return Controller.extend("sap.ui.fl.test.delegate.SmartFormGroup", {
		/**
		 * Initialize the view and set up mock server and OData model
		 */
		onInit() {
			const oMockServer = new MockServer({
				rootUri: "/"
			});
			const sResourcePath = `${sap.ui.require.toUrl("test-resources/sap/ui/fl/qunit/write/_internal/delegates/testdata")}/mockserver`;
			oMockServer.simulate(`${sResourcePath}/metadata.xml`, {
				sMockdataBaseUrl: sResourcePath,
				bGenerateMissingMockData: true,
				aEntitySetsNames: ["EntityTypes"]
			});
			oMockServer.start();
			const oModel = new ODataModel("/");

			const oView = this.getView();
			oView.setModel(oModel);
			this._data = new Promise((resolve) => {
				oView.bindElement({
					path: "/EntityTypes(Property01='propValue01')",
					events: {
						dataReceived: resolve
					}
				});
			});
		},
		isDataReady() {
			return this._data;
		}
	});
});
