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

	return Controller.extend("sap.ui.core.sample.odata.types.v4.Date.Date", {

		oJSONModel: new JSONModel({
			Date: null,
			Description: "<p><strong>Note:</strong> The OData V4 type <code>Edm.Date</code>"
				+ " represents a calendar date, which means a specific day within a year that is"
				+ " independent of any time zone. For example, Sylvester 2022 is on 2022/12/31,"
				+ " regardless of the time zone the user is in. The time zone is irrelevant for"
				+ " dates.<br>"
				+ " The OData V4 model automatically determines the data types based on the"
				+ " metadata. Use the SAPUI5 data type <code>sap.ui.model.odata.type.Date</code>"
				+ " when manually setting a type to bind an <code>Edm.Date</code> value against a"
				+ " control property.<br>"
				+ " The model representation is a string like \"2022-12-31\".</p>",
			EndDate: null,
			Timezone: Localization.getTimezone()
		}),

		formatDate: function (vValue) {
			return vValue ? "\"" + vValue + "\"" : "<null>";
		},

		formatDateAsURIParameter: function (vValue) {
			return vValue ? ODataUtils.formatLiteral(vValue, "Edm.Date") : "<null>";
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
			var oBindingContext = this.getView().getBindingContext(),
				sDate = oBindingContext.getProperty("Date") || null,
				oDialog = this.byId("dialog"),
				sEndDate = oBindingContext.getProperty("EndDate") || null;

			// Copy the date string from the OData model to the JSON model
			this.oJSONModel.setProperty("/Date", sDate);
			this.oJSONModel.setProperty("/EndDate", sEndDate);

			oDialog.bindObject({path: "/", model: "json"});
			oDialog.open();
		},

		onDialogTakeValues: function () {
			var oView = this.getView(),
				oContext = oView.getBindingContext(),
				oJSONModel = oView.getModel("json"),
				sDate = oJSONModel.getProperty("/Date") || null,
				sEndDate = oJSONModel.getProperty("/EndDate") || null;

			// Copy the date string form the JSON model back to the OData model
			oContext.setProperty("Date", sDate);
			oContext.setProperty("EndDate", sEndDate);

			this.byId("dialog").close();
		}
	});
});
