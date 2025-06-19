/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/odata/ODataUtils",
	"sap/ui/model/odata/type/DateTimeWithTimezone"
], function (Controller, ODataUtils, DateTimeWithTimezone) {
	"use strict";

	return Controller.extend("sap.ui.core.sample.odata.types.v2.DateTimeOffset.DateTimeOffset", {
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
		}
	});
});
