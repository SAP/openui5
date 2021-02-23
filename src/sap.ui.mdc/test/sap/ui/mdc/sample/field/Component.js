/*
 * ! ${copyright}
 */

/**
 * @fileOverview Application component to display information on entities from the TEA_BUSI OData service.
 * @version
 * @version@
 */
sap.ui.define([
	'jquery.sap.global',
	'sap/ui/core/mvc/View',
	'sap/ui/core/mvc/ViewType',
	'sap/ui/core/UIComponent',
	'sap/ui/model/odata/v2/ODataModel',
	'sap/ui/core/util/MockServer',
	'sap/ui/mdc/field/ConditionsType', // as used in XML view
	'sap/ui/model/odata/ODataUtils'
], function(jQuery, View, ViewType, UIComponent, ODataModel, MockServer, ConditionsType, ODataUtils) {
	"use strict";

	var Component = UIComponent.extend("sap.ui.mdc.sample.field.Component", {
		metadata: {
			manifest: "json"
		},
		exit: function() {
		},

		init: function() {
			// initialization has to be done here because parent.init() calls createContent()
			sap.ui.getCore().loadLibrary("sap.ui.mdc");

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

			// as Mockserver don't support case insensitive filtering disable it
			var fnCreateFilterSegment = ODataUtils._createFilterSegment;
			ODataUtils._createFilterSegment =  function(sPath, oMetadata, oEntityType, sOperator, oValue1, oValue2, bCaseSensitive) {
				return fnCreateFilterSegment.apply(this, [sPath, oMetadata, oEntityType, sOperator, oValue1, oValue2, true]);
			};

			UIComponent.prototype.init.apply(this, arguments);
		},
		config: {
			sample: {
				stretch: true,
				files: [
					"Test.view.xml", "Test.controller.js"
				]
			}
		}
	});

	return Component;
});
