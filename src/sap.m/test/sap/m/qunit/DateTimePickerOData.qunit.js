/*global QUnit, sinon */
sap.ui.define([
	"sap/ui/test/TestUtils",
	"sap/ui/core/Core",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/model/odata/v2/ODataModel"
], function(
	TestUtils,
	Core,
	XMLView,
	ODataModel
) {
	"use strict";

	var sMyxml =
		"<mvc:View xmlns:mvc=\"sap.ui.core.mvc\" xmlns=\"sap.m\">" +
		"	<VBox binding=\"{/EdmTypesCollection(ID='1')}\">" +
		"		<DateTimePicker id='picker1'" +
		"			value=\"{parts: [" +
		"				{ path: 'DateTimeOffset', type: 'sap.ui.model.odata.type.DateTimeOffset' }," +
		"				{ path: 'TimezoneID', type: 'sap.ui.model.odata.type.String' }" +
		"			], type:'sap.ui.model.odata.type.DateTimeWithTimezone'}\"" +
		"		/>" +
		"		<DateTimePicker id='picker2'" +
		"			value=\"{parts: [" +
		"				{ path: 'EmptyDate', type: 'sap.ui.model.odata.type.DateTimeOffset' }," +
		"				{ path: 'TimezoneID', type: 'sap.ui.model.odata.type.String' }" +
		"			], type:'sap.ui.model.odata.type.DateTimeWithTimezone'}\"" +
		"		/>" +
		"	</VBox>" +
		"</mvc:View>";

	QUnit.module("DateTimeWithTimezone", {
		before: function() {
			this.oFakeServer = TestUtils.useFakeServer(sinon.sandbox.create(),
				"sap/m/qunit/data/datetime", {
					"/sap/opu/odata/sap/ZUI5_EDM_TYPES/$metadata" : {
						source : "metadataV2.xml"
					},
					"/sap/opu/odata/sap/ZUI5_EDM_TYPES/EdmTypesCollection(ID='1')" : {
						source: "EdmTypesV2.json"
					}
			});
		},
		after: function () {
			this.oFakeServer.restore();
		},
		beforeEach: function() {
			this.oModelV2 = new ODataModel({
				serviceUrl : "/sap/opu/odata/sap/ZUI5_EDM_TYPES/",
				useBatch : false
			});
		},
		afterEach: function() {
			this.oModelV2.destroy();
		}
	});

	QUnit.test("showTimezone: true", function(assert) {
		var done = assert.async();

		XMLView.create({
			definition: sMyxml
		}).then(function(oView) {
			// act
			oView.setModel(this.oModelV2)
				.placeAt("qunit-fixture");

			this.oModelV2.attachEventOnce("requestCompleted", function() {
				var oDTP, oDTP2;

				Core.applyChanges();
				oDTP = oView.byId("picker1");
				oDTP2 = oView.byId("picker2");

				// assert
				assert.equal(oDTP._$input.val(), "Jan 6, 2015, 2:25:21 AM", "picker1 has correct input value");
				assert.equal(oDTP.$("timezoneLabel").text(), "Americas, New York", "picker1 has correct timezone label");
				assert.equal(oDTP2._$input.val(), "", "picker2 has correct input value");
				assert.equal(oDTP2.$("timezoneLabel").text(), "Americas, New York", "picker2 has correct timezone label");

				// clean
				oView.destroy();
				done();
			});
		}.bind(this));
	});
});