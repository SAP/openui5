/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/i18n/Localization",
	"sap/ui/core/date/UI5Date",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/odata/ODataUtils",
	"sap/ui/model/odata/type/DateTimeWithTimezone"
], function (Localization, UI5Date, Controller, JSONModel, ODataUtils, DateTimeWithTimezone) {
	"use strict";

	return Controller.extend("sap.ui.core.sample.odata.types.v2.DateTimeOffset.DateTimeOffset", {

		oJSONModel: new JSONModel({
			Description: "<p><strong>Note:</strong> The OData V2 type"
				+ " <code>Edm.DateTimeOffset</code> represents a timestamp, which means a"
				+ " point in time that can be displayed or edited in specific time zones. For"
				+ " example, if a meeting starts at a specific date and a specific time in a"
				+ " specific time zone, its timestamp may be displayed as 27.11.2022, 14:00:00"
				+ " Honolulu or as 28.11.2022, 11:00:00 Australia/Canberra, depending on the user's"
				+ " time zone.<br>"
				+ " Use the SAPUI5 data type <code>sap.ui.model.odata.type.DateTimeOffset</code>"
				+ " when binding an <code>Edm.DateTimeOffset</code> value against a control"
				+ " property.<br>"
				+ " The model representation is a JavaScript <code>Date</code>, and the timestamps"
				+ " are always transported between client and server in UTC (Coordinated Universal"
				+ " Time).</p>",
			Timestamp: null,
			Timezone: Localization.getTimezone()
		}),

		formatDate: function (vValue) {
			return vValue ? vValue.toUTCString() : "<null>";
		},

		formatDateAsURIParameter: function (vValue) {
			return vValue ? ODataUtils.formatValue(vValue, "Edm.DateTimeOffset") : "<null>";
		},

		formatTimezone: function (sTimezoneID) {
			var oType = new DateTimeWithTimezone({showDate: false, showTime: false});

			return sTimezoneID
				? oType.formatValue([null, sTimezoneID], "string") + " (" + sTimezoneID + ")"
				: sTimezoneID;
		},

		onInit: function () {
			this.getView().setModel(this.oJSONModel, "json");
			this.getView().bindObject("/EdmTypesCollection(ID='1')");
		},

		onDialogClose: function () {
			this.byId("dialog").close();
		},

		onDialogOpen: function () {
			var oDialog = this.byId("dialog"),
				oTimestamp = this.getView().getBindingContext().getProperty("Timestamp");

			// Copy the Date object for the timestamp from the OData model to the JSON model
			this.oJSONModel.setProperty("/Timestamp", oTimestamp ? UI5Date.getInstance(oTimestamp) : null);

			oDialog.bindObject({path: "/", model: "json"});
			oDialog.open();
		},

		onDialogTakeValues: function () {
			var oView = this.getView(),
				oContext = oView.getBindingContext(),
				oODataModel = oContext.getModel(),
				oTimestamp = oView.getModel("json").getProperty("/Timestamp");

			// Copy the Date object for the timestamp form the JSON model back to the OData model
			oODataModel.setProperty("Timestamp", oTimestamp ? UI5Date.getInstance(oTimestamp) : null, oContext);

			this.byId("dialog").close();
		}
	});
});
