/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/odata/ODataUtils",
	"sap/ui/model/odata/type/DateTimeWithTimezone"
], function (Controller, ODataUtils, DateTimeWithTimezone) {
	"use strict";

	return Controller.extend("sap.ui.core.sample.odata.types.v2.Time.Time", {
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
		}
	});
});
