/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/odata/type/DateTimeWithTimezone",
	"sap/ui/model/odata/v4/ODataUtils"
], function (Controller, DateTimeWithTimezone, ODataUtils) {
	"use strict";

	return Controller.extend("sap.ui.core.sample.odata.types.v4.DateTimeOffset.DateTimeOffset", {
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
		}
	});
});
