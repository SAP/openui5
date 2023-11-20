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

	return Controller.extend("sap.ui.core.sample.odata.types.v4.TimeOfDay.TimeOfDay", {

		oJSONModel: new JSONModel({
			Description: "<p><strong>Note:</strong>The OData V4 type <code>Edm.TimeOfDay</code>"
				+ " represents a time of day, which means a specific hour/minute/second within a"
				+ " day that is independent of any time zone. For example, if all shops of a brand"
				+ " open at 9:00 AM, they will open at 9:00 AM in the customer's time zone. The"
				+ " time zone is irrelevant for times.<br>"
				+ " The OData V4 model automatically determines the data types based on the"
				+ " metadata. Use the SAPUI5 data type"
				+ " <code>sap.ui.model.odata.type.TimeOfDay</code> when manually setting a type to"
				+ " binding an <code>Edm.TimeOfDay</code> value against a control property.<br>"
				+ " The model representation is a string like \"13:25:46\".</p>",
			TimeOfDay: null,
			Timezone: Localization.getTimezone()
		}),

		formatTimeOfDay: function (vValue) {
			return vValue ? "\"" + vValue + "\"" : "<null>";
		},

		formatTimeOfDayAsURIParameter: function (vValue) {
			return vValue ? ODataUtils.formatLiteral(vValue, "Edm.TimeOfDay") : "<null>";
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
				sTime = this.getView().getBindingContext().getProperty("TimeOfDay");

			// Copy the time string from the OData model to the JSON model
			this.oJSONModel.setProperty("/TimeOfDay", sTime);

			oDialog.bindObject({path: "/", model: "json"});
			oDialog.open();
		},

		onDialogTakeValues: function () {
			var oView = this.getView(),
				sTime = oView.getModel("json").getProperty("/TimeOfDay");

			// Copy the time string form the JSON model back to the OData model
			oView.getBindingContext().setProperty("TimeOfDay", sTime);

			this.byId("dialog").close();
		}
	});
});
