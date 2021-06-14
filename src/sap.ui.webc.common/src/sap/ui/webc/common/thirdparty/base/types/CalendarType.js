sap.ui.define(['./DataType'], function (DataType) { 'use strict';

	const CalendarTypes = {
		Gregorian: "Gregorian",
		Islamic: "Islamic",
		Japanese: "Japanese",
		Buddhist: "Buddhist",
		Persian: "Persian",
	};
	class CalendarType extends DataType {
		static isValid(value) {
			return !!CalendarTypes[value];
		}
	}
	CalendarType.generateTypeAccessors(CalendarTypes);

	return CalendarType;

});
