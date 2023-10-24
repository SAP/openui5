/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/i18n/Localization",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/odata/ODataUtils",
	"sap/ui/model/odata/type/DateTimeWithTimezone"
], function (Localization, Controller, JSONModel, ODataUtils, DateTimeWithTimezone) {
	"use strict";

	return Controller.extend("sap.ui.core.sample.odata.types.v2.Time.Time", {

		oJSONModel: new JSONModel({
			Description: "<p><strong>Note:</strong> The OData V2 type <code>Edm.Time</code>"
				+ " represents a time of day, which means a specific hour/minute/second within a"
				+ " day that is independent of any time zone. For example, if all shops of a brand"
				+ " open at 9:00 AM, they will open at 9:00 AM in the customer's time zone. The"
				+ " time zone is irrelevant for times.<br>"
				+ " Use the SAPUI5 data type <code>sap.ui.model.odata.type.Time</code> when binding"
				+ " an <code>Edm.Time</code> value against a control property.<br>"
				+ " The model representation is an object with the properties <code>ms</code> (time"
				+ " in milliseconds), and <code>__edmType</code> (with the value"
				+ " <code>\"Edm.Time\"</code>), for example <code>{ms: 41635000, __edmType:"
				+ " \"Edm.Time\"}</code> for <code>11:33:55 AM</code>.</p>",
			Time: null,
			Timezone: Localization.getTimezone()
		}),

		formatTime: function (vValue) {
			return vValue ? JSON.stringify(vValue) : "<null>";
		},

		formatTimeAsURIParameter: function (vValue) {
			return vValue ? ODataUtils.formatValue(vValue, "Edm.Time") : "<null>";
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
			var oTime = this.getView().getBindingContext().getProperty("Time"),
				oDialog = this.byId("dialog");

			// Copy the time object from the OData model to the JSON model
			this.oJSONModel.setProperty("/Time", oTime ? Object.assign({}, oTime) : null);

			oDialog.bindObject({path: "/", model: "json"});
			oDialog.open();
		},

		onDialogTakeValues: function () {
			var oView = this.getView(),
				oContext = oView.getBindingContext(),
				oTime = oView.getModel("json").getProperty("/Time"),
				oODataModel = oContext.getModel();

			// Copy the time object form the JSON model back to the OData model
			oODataModel.setProperty("Time", oTime ? Object.assign({}, oTime) : null, oContext);

			this.byId("dialog").close();
		}
	});
});
