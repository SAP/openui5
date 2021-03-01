sap.ui.define(['exports', '../types/CalendarType', '../InitialConfiguration'], function (exports, CalendarType, InitialConfiguration) { 'use strict';

	let calendarType;
	const getCalendarType = () => {
		if (calendarType === undefined) {
			calendarType = InitialConfiguration.getCalendarType();
		}
		if (CalendarType.isValid(calendarType)) {
			return calendarType;
		}
		return CalendarType.Gregorian;
	};

	exports.getCalendarType = getCalendarType;

	Object.defineProperty(exports, '__esModule', { value: true });

});
