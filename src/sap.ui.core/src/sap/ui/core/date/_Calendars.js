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
			/** @deprecated As of version 1.120.0 */
			if (!mRegistry.has(sCalendarType)) {
				sap.ui.requireSync("sap/ui/core/date/" + sCalendarType); // TODO: establish full async alternative
			}
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
