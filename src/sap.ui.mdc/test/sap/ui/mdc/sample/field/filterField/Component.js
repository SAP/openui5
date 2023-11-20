/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/ui/core/mvc/View',
	'sap/ui/core/mvc/ViewType',
	'sap/ui/core/UIComponent',
	'sap/ui/model/type/Currency', // to have it loaded
	'sap/ui/model/type/Date', // to have it loaded
	'sap/ui/model/type/DateTime', // to have it loaded
	'sap/ui/model/type/String', // to have it loaded
	'sap/ui/model/type/Unit', // to have it loaded
	'sap/ui/model/odata/type/Boolean', // to have it loaded
	'sap/ui/model/odata/type/Currency', // to have it loaded
	'sap/ui/model/odata/type/DateTime', // to have it loaded
	'sap/ui/model/odata/type/DateTimeOffset', // to have it loaded
	'sap/ui/model/odata/type/DateTimeWithTimezone', // to have it loaded
	'sap/ui/model/odata/type/Int32', // to have it loaded
	'sap/ui/model/odata/type/String', // to have it loaded
	'sap/ui/model/odata/type/TimeOfDay', // to have it loaded
	'sap/ui/model/odata/type/Unit', // to have it loaded
	'sap/ui/model/odata/v2/ODataModel',
	'sap/ui/core/util/MockServer',
	'sap/ui/core/Core'
], function(
	View,
	ViewType,
	UIComponent,
	CurrencyType,
	DateType,
	DateTimeType,
	StringType,
	UnitType,
	ODataBooleanType,
	ODataCurrencyType,
	ODataDateTimeType,
	ODataDateTimeOffsetType,
	ODataDateTimeWithTimezoneType,
	ODataInt32Type,
	ODataStringType,
	ODataTimeOfDayType,
	ODataUnitType,
	ODataModel,
	MockServer,
	oCore
) {
	"use strict";

	var Component = UIComponent.extend("sap.ui.mdc.sample.field.filterField.Component", {
		metadata: {
			manifest: "json"
		},
		exit: function() {
		},

		init: function() {
			// initialization has to be done here because parent.init() calls createContent()
			oCore.loadLibrary("sap.ui.mdc");

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
					"Test.view.xml", "Test.controller.js"
				]
			}
		}
	});

	return Component;
});
