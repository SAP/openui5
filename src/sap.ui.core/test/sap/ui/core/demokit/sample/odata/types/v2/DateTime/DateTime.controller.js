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

	return Controller.extend("sap.ui.core.sample.odata.types.v2.DateTime.DateTime", {

		oJSONModel: new JSONModel({
			Date: null,
			Description: "<p><strong>Note:</strong> The OData V2 type <code>Edm.DateTime</code>"
				+ " together wiht the SAP OData V2 annotation"
				+ " <code>sap:display-format=\"Date\"</code> represents a calendar date, which"
				+ " means a specific day within a year that is independent of any time zone. For"
				+ " example, Sylvester 2022 is on 2022/12/31, regardless of the time zone the user"
				+ " is in. The time zone is irrelevant for dates.<br>"
				+ " Use the SAPUI5 data type <code>sap.ui.model.odata.type.DateTime</code> with the"
				+ " constraint <code>{displayFormat: \"Date\"}</code> when binding an"
				+ " <code>Edm.DateTime</code> value against a control property. The model"
				+ " representation is a JavaScript <code>Date</code> in UTC.<br>"
				+ " Make sure that the <code>Edm.DateTime</code> property in the"
				+ " <code>$metadata.xml</code> document is annotated with the OData V2 annotation"
				+ " <code>sap:display-format=\"Date\"</code>, for example:<br>"
				+ " <code>&lt;Property Name=\"Date\" Type=\"Edm.DateTime\""
				+ " <strong>sap:display-format=\"Date\"</strong> /&gt;</code></p>",
			EndDate: null,
			Timezone: Localization.getTimezone()
		}),

		formatDate: function (vValue) {
			return vValue ? vValue.toUTCString() : "<null>";
		},

		formatDateAsURIParameter: function (vValue) {
			return vValue ? ODataUtils.formatValue(vValue, "Edm.DateTime") : "<null>";
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
			var oBindingContext = this.getView().getBindingContext(),
				oDate = oBindingContext.getProperty("Date"),
				oDialog = this.byId("dialog"),
				oEndDate = oBindingContext.getProperty("EndDate");

			// Copy the Date object from the OData model to the JSON model
			this.oJSONModel.setProperty("/Date", oDate ? UI5Date.getInstance(oDate) : null);
			this.oJSONModel.setProperty("/EndDate", oEndDate ? UI5Date.getInstance(oEndDate) : null);

			oDialog.bindObject({path: "/", model: "json"});
			oDialog.open();
		},

		onDialogTakeValues: function () {
			var oView = this.getView(),
				oContext = oView.getBindingContext(),
				oJSONModel = oView.getModel("json"),
				oDate = oJSONModel.getProperty("/Date"),
				oEndDate = oJSONModel.getProperty("/EndDate"),
				oODataModel = oContext.getModel();

			// Copy the Date object form the JSON model back to the OData model
			oODataModel.setProperty("Date", oDate ? UI5Date.getInstance(oDate) : null, oContext);
			oODataModel.setProperty("EndDate", oEndDate ? UI5Date.getInstance(oEndDate) : null, oContext);

			this.byId("dialog").close();
		}
	});
});
