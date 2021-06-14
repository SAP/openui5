sap.ui.define(['sap/ui/core/date/UniversalDate'], function (UniversalDate) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var UniversalDate__default = /*#__PURE__*/_interopDefaultLegacy(UniversalDate);

	const calculateWeekNumber = (confFirstDayOfWeek, oDate, iYear, oLocale, oLocaleData) => {
		let iWeekNum = 0;
		let iWeekDay = 0;
		const iFirstDayOfWeek = Number.isInteger(confFirstDayOfWeek) ? confFirstDayOfWeek : oLocaleData.getFirstDayOfWeek();
		if (oLocale && (oLocale.getLanguage() === "en" && oLocale.getRegion() === "US")) {
			const oJanFirst = new UniversalDate__default(oDate.getTime());
			oJanFirst.setUTCFullYear(iYear, 0, 1);
			iWeekDay = oJanFirst.getUTCDay();
			const oCheckDate = new UniversalDate__default(oDate.getTime());
			oCheckDate.setUTCDate(oCheckDate.getUTCDate() - oCheckDate.getUTCDay() + iWeekDay);
			iWeekNum = Math.round((oCheckDate.getTime() - oJanFirst.getTime()) / 86400000 / 7) + 1;
		} else {
			const oThursday = new UniversalDate__default(oDate.getTime());
			oThursday.setUTCDate(oThursday.getUTCDate() - iFirstDayOfWeek);
			iWeekDay = oThursday.getUTCDay();
			oThursday.setUTCDate(oThursday.getUTCDate() - iWeekDay + 4);
			const oFirstDayOfYear = new UniversalDate__default(oThursday.getTime());
			oFirstDayOfYear.setUTCMonth(0, 1);
			iWeekDay = oFirstDayOfYear.getUTCDay();
			let iAddDays = 0;
			if (iWeekDay > 4) {
				iAddDays = 7;
			}
			const oFirstThursday = new UniversalDate__default(oFirstDayOfYear.getTime());
			oFirstThursday.setUTCDate(1 - iWeekDay + 4 + iAddDays);
			iWeekNum = Math.round((oThursday.getTime() - oFirstThursday.getTime()) / 86400000 / 7) + 1;
		}
		return iWeekNum;
	};

	return calculateWeekNumber;

});
