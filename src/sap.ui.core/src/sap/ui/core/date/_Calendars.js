/*
 * ${copyright}
 */

sap.ui.define([], function () {
	"use strict";

	/*global Map */
	var mRegistry = new Map();

	/**
	 * @private
	 * @ui5-restricted
	 */
	var _Calendars = {
		get: function (sCalendarType) {
			if (!mRegistry.has(sCalendarType)) {
				sap.ui.requireSync("sap/ui/core/date/" + sCalendarType); // TODO: establish full async alternative
			}

			return mRegistry.get(sCalendarType);
		},
		set: function (sCalendarType, CalendarClass) {
			mRegistry.set(sCalendarType, CalendarClass);
		}
	};

	return _Calendars;
});
