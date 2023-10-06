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
			if (mRegistry.has(sCalendarType)) {
				return mRegistry.get(sCalendarType);
			}
			throw new TypeError("Load required calendar 'sap/ui/core/date/" + sCalendarType + "' in advance");
		},
		set: function (sCalendarType, CalendarClass) {
			mRegistry.set(sCalendarType, CalendarClass);
		}
	};

	return _Calendars;
});
