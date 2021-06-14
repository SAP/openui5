sap.ui.define(['./CalendarDate'], function (CalendarDate) { 'use strict';

	const getTodayUTCTimestamp = primaryCalendarType => CalendarDate.fromLocalJSDate(new Date(), primaryCalendarType).valueOf() / 1000;

	return getTodayUTCTimestamp;

});
