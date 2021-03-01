sap.ui.define(['./CalendarDate'], function (CalendarDate) { 'use strict';

	const modifyDateBy = (date, amount, unit, minDate = null, maxDate = null) => {
		const newDate = new CalendarDate(date);
		if (unit === "day") {
			newDate.setDate(date.getDate() + amount);
		} else if (unit === "month") {
			newDate.setMonth(date.getMonth() + amount);
			const stillSameMonth = amount === -1 && newDate.getMonth() === date.getMonth();
			const monthSkipped = amount === 1 && newDate.getMonth() - date.getMonth() > 1;
			if (stillSameMonth || monthSkipped) {
				newDate.setDate(0);
			}
		} else {
			newDate.setYear(date.getYear() + amount);
			if (newDate.getMonth() !== date.getMonth()) {
				newDate.setDate(0);
			}
		}
		if (minDate && newDate.valueOf() < minDate.valueOf()) {
			return new CalendarDate(minDate);
		}
		if (maxDate && newDate.valueOf() > maxDate.valueOf()) {
			return new CalendarDate(maxDate);
		}
		return newDate;
	};

	return modifyDateBy;

});
