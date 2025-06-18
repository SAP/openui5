/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/odata/type/DateTimeWithTimezone",
	"sap/ui/model/odata/v4/ODataUtils"
], function (Controller, DateTimeWithTimezone, ODataUtils) {
	"use strict";

	return Controller.extend("sap.ui.core.sample.odata.types.v4.TimeOfDay.TimeOfDay", {
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
		}
	});
});
