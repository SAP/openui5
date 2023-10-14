sap.ui.define([
	'sap/ui/base/ManagedObject',
	"sap/ui/core/UIComponent",
	"sap/ui/model/odata/type/Currency", // to have it loaded
	"sap/ui/model/odata/type/Decimal", // to have it loaded
	"sap/ui/model/odata/type/Date", // to have it loaded
	"sap/ui/model/odata/type/DateTimeOffset", // to have it loaded
	"sap/ui/model/odata/type/DateTimeWithTimezone", // to have it loaded
	"sap/ui/model/odata/type/Guid", // to have it loaded
	"sap/ui/model/odata/type/Int32", // to have it loaded
	"sap/ui/model/odata/type/String", // to have it loaded
	"sap/ui/model/odata/type/TimeOfDay", // to have it loaded
	"sap/ui/mdc/field/ConditionsType", // as used in XML view
	"testutils/other/FakeFlpConnector",
	"sap/base/util/LoaderExtensions",
	"sap/m/routing/Router" // make sure Router is loaded
], function (
	ManagedObject,
	UIComponent,
	ODataCurrencyType,
	ODataDecimalType,
	ODataDateType,
	ODataDateTimeOffsetType,
	ODataDateTimeWithTimezoneType,
	ODataGuidType,
	ODataInt32Type,
	ODataStringType,
	ODataTimeOfDayType,
	ConditionsType,
	FakeFlpConnector,
	LoaderExtensions,
	Router
) {
	"use strict";

	var fnLoadManifest = function() {
		var oDefaultManifest = LoaderExtensions.loadResource("sap/ui/v4demo/templateManifest.json");
		if (self['sap-ui-mdc-config'] && self['sap-ui-mdc-config'].tenantBaseUrl) {
			oDefaultManifest["sap.app"].dataSources.default.uri = self['sap-ui-mdc-config'].tenantBaseUrl + "catalog-test/";
		}
		return oDefaultManifest;
	};

	return UIComponent.extend("sap.ui.v4demo.Component", {

		metadata: {
			manifest: fnLoadManifest()
		},

		init : function () {
			// call the init function of the parent
			UIComponent.prototype.init.apply(this, arguments);
			this.getRouter().initialize();
			this.__initFakeFlpConnector();
		},
		__initFakeFlpConnector: function() {
			FakeFlpConnector.enableFakeConnector({
				'FakeFlpSemanticObject': {
					links: [
						{
							action: "action_01",
							intent: self.location.pathname + (self.location.search && self.location.search) + "#/Books/{path: 'ID', targetType: 'raw'}",
							text: "Manage book",
							icon: "/testsuite/test-resources/sap/ui/documentation/sdk/images/HT-1031.jpg",
							description: "{title}",
							tags: [
								"superiorAction"
							]
						},
						{
							action: "action_02",
							intent: self.location.pathname + (self.location.search && self.location.search) + "#/Authors/{path: 'author_ID', targetType: 'raw'}",
							text: "Manage author",
							description: "{author/name}"
						}
					]
				}
			});
		}

	});
});
