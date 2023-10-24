/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/i18n/Localization",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/odata/type/DateTimeWithTimezone",
	"sap/ui/model/odata/v4/ODataUtils"
], function (Localization, Controller, JSONModel, DateTimeWithTimezone, ODataUtils) {
	"use strict";

	return Controller.extend("sap.ui.core.sample.odata.types.v4.DateTimeOffset.DateTimeOffset", {

		oJSONModel: new JSONModel({
			Description: "<p><strong>Note:</strong> The OData V4 type"
				+ " <code>Edm.DateTimeOffset</code> represents a timestamp, which means a"
				+ " point in time that can be displayed or edited in specific time zones. For"
				+ " example, if a meeting starts at a specific date and a specific time in a"
				+ " specific time zone, its timestamp may be displayed as 27.11.2022, 14:00:00"
				+ " Honolulu or as 28.11.2022, 11:00:00 Australia/Canberra, depending on the user's"
				+ " time zone.<br>"
				+ " The OData V4 model automatically determines the data types based on the"
				+ " metadata. Use the SAPUI5 data type"
				+ " <code>sap.ui.model.odata.type.DateTimeOffset</code> with the constraint"
				+ " <code>{V4: true}</code> when manually setting a type to bind an"
				+ " <code>Edm.DateTimeOffset</code> value against a control property.<br>"
				+ " The model representation is a string like \"2015-01-06T07:25:21Z\".</p>",
			Timestamp: null,
			Timezone: Localization.getTimezone()
		}),

		formatTimestamp: function (vValue) {
			return vValue ? "\"" + vValue + "\"" : "<null>";
		},

		formatTimestampAsURIParameter: function (vValue) {
			return vValue ? ODataUtils.formatLiteral(vValue, "Edm.DateTimeOffset") : "<null>";
		},

		formatTimezone: function (sTimezoneID) {
			var oType = new DateTimeWithTimezone({showDate: false, showTime: false});

			return sTimezoneID
				? oType.formatValue([null, sTimezoneID], "string") + " (" + sTimezoneID + ")"
				: sTimezoneID;
		},

		onInit: function () {
			this.getView().setModel(this.oJSONModel, "json");
			this.getView().bindObject("/EdmTypesCollection('1')");
		},

		onDialogClose: function () {
			this.byId("dialog").close();
		},

		onDialogOpen: function () {
			var oDialog = this.byId("dialog"),
				sTimestamp = this.getView().getBindingContext().getProperty("Timestamp");

			// Copy the the timestamp string from the OData model to the JSON model
			this.oJSONModel.setProperty("/Timestamp", sTimestamp);

			oDialog.bindObject({path: "/", model: "json"});
			oDialog.open();
		},

		onDialogTakeValues: function () {
			var oView = this.getView(),
				oContext = oView.getBindingContext(),
				sTimestamp = oView.getModel("json").getProperty("/Timestamp");

			// Copy the timestamp string form the JSON model back to the OData model
			oContext.setProperty("Timestamp", sTimestamp);

			this.byId("dialog").close();
		}
	});
});
