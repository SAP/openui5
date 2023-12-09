/*!
 * ${copyright}
 */

/**
 * @fileOverview Application component to display information on entities from the TEA_BUSI OData service.
 * @version
 * @version@
 */
sap.ui.define([
	'sap/ui/core/mvc/View',
	'sap/ui/core/mvc/ViewType',
	'sap/ui/core/UIComponent',
	'sap/ui/model/odata/v2/ODataModel',
	'sap/ui/core/util/MockServer',
	'sap/ui/model/type/String', // to have it loaded
	'sap/ui/model/type/Unit', // to have it loaded
	'sap/ui/model/odata/type/DateTime', // to have it loaded
	'sap/ui/model/odata/type/String' // to have it loaded
], function(
	View,
	ViewType,
	UIComponent,
	ODataModel,
	MockServer,
	StringType,
	UnitType,
	ODataDateTimeType,
	ODataStringType
) {
	"use strict";

	var Component = UIComponent.extend("sap.ui.mdc.acc.field.Component", {
		metadata: {
			manifest: "json"
		},
		exit: function() {
		},

		init: function() {
			var sMockServerUrl = "/odata/";

			var oMockServer = new MockServer({
				rootUri: sMockServerUrl
			});

			var sPath = sap.ui.require.toUrl("sap/ui/mdc/sample/field/localService");

			// load local mock data
			oMockServer.simulate(sPath + "/metadata.xml", {
				sMockdataBaseUrl: sPath + "/mockdata",
				bGenerateMissingMockData: true,
				aEntitySetsNames: [
					"ProductCollection", "StatusCollection", "weightODataUnits", "weightUnits", "currencies", "MaterialCollection", "CountryCollection", "RegionCollection", "CityCollection"
				]
			});

			// start
			oMockServer.start();

			var oModel = new ODataModel(sMockServerUrl, {defaultBindingMode: "TwoWay"});

			this.setModel(oModel);

			UIComponent.prototype.init.apply(this, arguments);
		},
		config: {
			sample: {
				stretch: true,
				files: [
					"Field.view.xml", "Field.controller.js"
				]
			}
		}
	});

	return Component;
});
