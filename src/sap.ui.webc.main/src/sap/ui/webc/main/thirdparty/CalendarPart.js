sap.ui.define(['sap/ui/webc/common/thirdparty/base/types/Integer', 'sap/ui/webc/common/thirdparty/localization/dates/CalendarDate', 'sap/ui/webc/common/thirdparty/localization/dates/modifyDateBy', 'sap/ui/webc/common/thirdparty/localization/dates/getTodayUTCTimestamp', './DateComponentBase'], function (Integer, CalendarDate, modifyDateBy, getTodayUTCTimestamp, DateComponentBase) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var Integer__default = /*#__PURE__*/_interopDefaultLegacy(Integer);
	var CalendarDate__default = /*#__PURE__*/_interopDefaultLegacy(CalendarDate);
	var modifyDateBy__default = /*#__PURE__*/_interopDefaultLegacy(modifyDateBy);
	var getTodayUTCTimestamp__default = /*#__PURE__*/_interopDefaultLegacy(getTodayUTCTimestamp);

	const metadata = {
		properties:  {
			timestamp: {
				type: Integer__default,
			},
		},
	};
	class CalendarPart extends DateComponentBase {
		static get metadata() {
			return metadata;
		}
		get _minTimestamp() {
			return this._minDate.valueOf() / 1000;
		}
		get _maxTimestamp() {
			return this._maxDate.valueOf() / 1000;
		}
		get _timestamp() {
			let timestamp = this.timestamp !== undefined ? this.timestamp : getTodayUTCTimestamp__default(this._primaryCalendarType);
			if (timestamp < this._minTimestamp || timestamp > this._maxTimestamp) {
				timestamp = this._minTimestamp;
			}
			return timestamp;
		}
		get _localDate() {
			return new Date(this._timestamp * 1000);
		}
		get _calendarDate() {
			return CalendarDate__default.fromTimestamp(this._localDate.getTime(), this._primaryCalendarType);
		}
		_safelySetTimestamp(timestamp) {
			const min = this._minDate.valueOf() / 1000;
			const max = this._maxDate.valueOf() / 1000;
			if (timestamp < min) {
				timestamp = min;
			}
			if (timestamp > max) {
				timestamp = max;
			}
			this.timestamp = timestamp;
		}
		_safelyModifyTimestampBy(amount, unit) {
			const newDate = modifyDateBy__default(this._calendarDate, amount, unit);
			this._safelySetTimestamp(newDate.valueOf() / 1000);
		}
		_getTimestampFromDom(domNode) {
			const oMonthDomRef = domNode.getAttribute("data-sap-timestamp");
			return parseInt(oMonthDomRef);
		}
	}

	return CalendarPart;

});
