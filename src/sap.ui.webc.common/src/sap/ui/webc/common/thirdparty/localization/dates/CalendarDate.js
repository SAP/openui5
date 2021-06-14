sap.ui.define(['sap/ui/core/date/UniversalDate'], function (UniversalDate) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var UniversalDate__default = /*#__PURE__*/_interopDefaultLegacy(UniversalDate);

	class CalendarDate {
		constructor() {
			let aArgs = arguments,
				oJSDate,
				oNow,
				sCalendarType;
			switch (aArgs.length) {
			case 0:
				oNow = new Date();
				return this.constructor(oNow.getFullYear(), oNow.getMonth(), oNow.getDate());
			case 1:
			case 2:
				if (!(aArgs[0] instanceof CalendarDate)) {
					throw new Error("Invalid arguments: the first argument must be of type sap.ui.unified.calendar.CalendarDate.");
				}
				sCalendarType = aArgs[1] ? aArgs[1] : aArgs[0]._oUDate.sCalendarType;
				oJSDate = new Date(aArgs[0].valueOf());
				oJSDate.setFullYear(oJSDate.getUTCFullYear(), oJSDate.getUTCMonth(), oJSDate.getUTCDate());
				oJSDate.setHours(oJSDate.getUTCHours(), oJSDate.getUTCMinutes(), oJSDate.getUTCSeconds(), oJSDate.getUTCMilliseconds());
				this._oUDate = createUniversalUTCDate(oJSDate, sCalendarType);
				break;
			case 3:
			case 4:
				checkNumericLike(aArgs[0], `Invalid year: ${aArgs[0]}`);
				checkNumericLike(aArgs[1], `Invalid month: ${aArgs[1]}`);
				checkNumericLike(aArgs[2], `Invalid date: ${aArgs[2]}`);
				oJSDate = new Date(0, 0, 1);
				oJSDate.setFullYear(aArgs[0], aArgs[1], aArgs[2]);
				if (aArgs[3]) {
					sCalendarType = aArgs[3];
				}
				this._oUDate = createUniversalUTCDate(oJSDate, sCalendarType);
				break;
			default:
				throw new Error(`${"Invalid arguments. Accepted arguments are: 1) oCalendarDate, (optional)calendarType"
				+ "or 2) year, month, date, (optional) calendarType"}${aArgs}`);
			}
		}
		getYear() {
			return this._oUDate.getUTCFullYear();
		}
		setYear(year) {
			checkNumericLike(year, `Invalid year: ${year}`);
			this._oUDate.setUTCFullYear(year);
			return this;
		}
		getMonth() {
			return this._oUDate.getUTCMonth();
		}
		setMonth(month, date) {
			checkNumericLike(month, `Invalid month: ${month}`);
			if (date || date === 0) {
				checkNumericLike(date, `Invalid date: ${date}`);
				this._oUDate.setUTCMonth(month, date);
			} else {
				this._oUDate.setUTCMonth(month);
			}
			return this;
		}
		getDate() {
			return this._oUDate.getUTCDate();
		}
		setDate(date) {
			checkNumericLike(date, `Invalid date: ${date}`);
			this._oUDate.setUTCDate(date);
			return this;
		}
		getDay() {
			return this._oUDate.getUTCDay();
		}
		getCalendarType() {
			return this._oUDate.sCalendarType;
		}
		isBefore(oCalendarDate) {
			checkCalendarDate(oCalendarDate);
			return this.valueOf() < oCalendarDate.valueOf();
		}
		isAfter(oCalendarDate) {
			checkCalendarDate(oCalendarDate);
			return this.valueOf() > oCalendarDate.valueOf();
		}
		isSameOrBefore(oCalendarDate) {
			checkCalendarDate(oCalendarDate);
			return this.valueOf() <= oCalendarDate.valueOf();
		}
		isSameOrAfter(oCalendarDate) {
			checkCalendarDate(oCalendarDate);
			return this.valueOf() >= oCalendarDate.valueOf();
		}
		isSame(oCalendarDate) {
			checkCalendarDate(oCalendarDate);
			return this.valueOf() === oCalendarDate.valueOf();
		}
		toLocalJSDate() {
			const oLocalDate = new Date(this._oUDate.getTime());
			oLocalDate.setFullYear(oLocalDate.getUTCFullYear(), oLocalDate.getUTCMonth(), oLocalDate.getUTCDate());
			oLocalDate.setHours(0, 0, 0, 0);
			return oLocalDate;
		}
		toUTCJSDate() {
			const oUTCDate = new Date(this._oUDate.getTime());
			oUTCDate.setUTCHours(0, 0, 0, 0);
			return oUTCDate;
		}
		toString() {
			return `${this._oUDate.sCalendarType}: ${this.getYear()}/${this.getMonth() + 1}/${this.getDate()}`;
		}
		valueOf() {
			return this._oUDate.getTime();
		}
		static fromLocalJSDate(oJSDate, sCalendarType) {
			function isValidDate(date) {
				return date && Object.prototype.toString.call(date) === "[object Date]" && !isNaN(date);
			}
			if (!isValidDate(oJSDate)) {
				throw new Error(`Date parameter must be a JavaScript Date object: [${oJSDate}].`);
			}
			return new CalendarDate(oJSDate.getFullYear(), oJSDate.getMonth(), oJSDate.getDate(), sCalendarType);
		}
		static fromTimestamp(iTimestamp, sCalendarType) {
			const oCalDate = new CalendarDate(0, 0, 1);
			oCalDate._oUDate = UniversalDate__default.getInstance(new Date(iTimestamp), sCalendarType);
			return oCalDate;
		}
	}
	function createUniversalUTCDate(oDate, sCalendarType) {
		if (sCalendarType) {
			return UniversalDate__default.getInstance(createUTCDate(oDate), sCalendarType);
		}
		return new UniversalDate__default(createUTCDate(oDate).getTime());
	}
	function createUTCDate(oDate) {
		const oUTCDate = new Date(Date.UTC(0, 0, 1));
		oUTCDate.setUTCFullYear(oDate.getFullYear(), oDate.getMonth(), oDate.getDate());
		return oUTCDate;
	}
	function checkCalendarDate(oCalendarDate) {
		if (!(oCalendarDate instanceof CalendarDate)) {
			throw new Error(`Invalid calendar date: [${oCalendarDate}]. Expected: sap.ui.unified.calendar.CalendarDate`);
		}
	}
	function checkNumericLike(value, message) {
		if (value === undefined || value === Infinity || isNaN(value)) {
			throw message;
		}
	}

	return CalendarDate;

});
