sap.ui.define(['sap/ui/webc/common/thirdparty/base/Render', 'sap/ui/webc/common/thirdparty/localization/dates/CalendarDate', 'sap/ui/webc/common/thirdparty/localization/dates/modifyDateBy', 'sap/ui/webc/common/thirdparty/localization/dates/getTodayUTCTimestamp', './generated/i18n/i18n-defaults', './generated/themes/DateRangePicker.css', './DatePicker'], function (Render, CalendarDate, modifyDateBy, getTodayUTCTimestamp, i18nDefaults, DateRangePicker_css, DatePicker) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var CalendarDate__default = /*#__PURE__*/_interopDefaultLegacy(CalendarDate);
	var modifyDateBy__default = /*#__PURE__*/_interopDefaultLegacy(modifyDateBy);
	var getTodayUTCTimestamp__default = /*#__PURE__*/_interopDefaultLegacy(getTodayUTCTimestamp);

	const metadata = {
		tag: "ui5-daterange-picker",
		properties:  {
			delimiter: {
				type: String,
				defaultValue: "-",
			},
			_tempValue: {
				type: String,
			},
		},
	};
	class DateRangePicker extends DatePicker {
		static get metadata() {
			return metadata;
		}
		static get styles() {
			return [DatePicker.styles, DateRangePicker_css];
		}
		get _startDateTimestamp() {
			return this._extractFirstTimestamp(this.value);
		}
		get _endDateTimestamp() {
			return this._extractLastTimestamp(this.value);
		}
		get _tempTimestamp() {
			return this._tempValue && this.getFormat().parse(this._tempValue, true).getTime() / 1000;
		}
		get _calendarSelectionMode() {
			return "Range";
		}
		get _calendarTimestamp() {
			return this._tempTimestamp || this._startDateTimestamp || getTodayUTCTimestamp__default(this._primaryCalendarType);
		}
		get _calendarSelectedDates() {
			if (this._tempValue) {
				return [this._tempValue];
			}
			if (this.value && this._checkValueValidity(this.value)) {
				return this._splitValueByDelimiter(this.value);
			}
			return [];
		}
		get startDateValue() {
			return CalendarDate__default.fromTimestamp(this._startDateTimestamp * 1000).toLocalJSDate();
		}
		get endDateValue() {
			return CalendarDate__default.fromTimestamp(this._endDateTimestamp * 1000).toLocalJSDate();
		}
		get _placeholder() {
			return this.placeholder !== undefined ? this.placeholder : `${this._displayFormat} ${this._effectiveDelimiter} ${this._displayFormat}`;
		}
		get dateAriaDescription() {
			return this.i18nBundle.getText(i18nDefaults.DATERANGE_DESCRIPTION);
		}
		async _onInputSubmit(event) {
			const input = this._getInput();
			const caretPos = input.getCaretPosition();
			await Render.renderFinished();
			input.setCaretPosition(caretPos);
		}
		 onResponsivePopoverAfterClose() {
			this._tempValue = "";
			super.onResponsivePopoverAfterClose();
		}
		isValid(value) {
			const parts = this._splitValueByDelimiter(value);
			return parts.length <= 2 && parts.every(dateString => super.isValid(dateString));
		}
		isInValidRange(value) {
			return this._splitValueByDelimiter(value).every(dateString => super.isInValidRange(dateString));
		}
		normalizeValue(value) {
			const firstDateTimestamp = this._extractFirstTimestamp(value);
			const lastDateTimestamp = this._extractLastTimestamp(value);
			if (firstDateTimestamp && lastDateTimestamp && firstDateTimestamp > lastDateTimestamp) {
				return this._buildValue(lastDateTimestamp, firstDateTimestamp);
			}
			return this._buildValue(firstDateTimestamp, lastDateTimestamp);
		}
		onSelectedDatesChange(event) {
			event.preventDefault();
			const values = event.detail.values;
			if (values.length === 0) {
				return;
			}
			if (values.length === 1) {
				this._tempValue = values[0];
				return;
			}
			const newValue = this._buildValue(...event.detail.dates);
			this._updateValueAndFireEvents(newValue, true, ["change", "value-changed"]);
			this.closePicker();
		}
		async _modifyDateValue(amount, unit) {
			if (!this._endDateTimestamp) {
				return super._modifyDateValue(amount, unit);
			}
			const input = this._getInput();
			let caretPos = input.getCaretPosition();
			let newValue;
			if (caretPos <= this.value.indexOf(this._effectiveDelimiter)) {
				const startDateModified = modifyDateBy__default(CalendarDate__default.fromTimestamp(this._startDateTimestamp * 1000), amount, unit, this._minDate, this._maxDate);
				const newStartDateTimestamp = startDateModified.valueOf() / 1000;
				if (newStartDateTimestamp > this._endDateTimestamp) {
					caretPos += Math.ceil(this.value.length / 2);
				}
				newValue = this._buildValue(newStartDateTimestamp, this._endDateTimestamp);
			} else {
				const endDateModified = modifyDateBy__default(CalendarDate__default.fromTimestamp(this._endDateTimestamp * 1000), amount, unit, this._minDate, this._maxDate);
				const newEndDateTimestamp = endDateModified.valueOf() / 1000;
				newValue = this._buildValue(this._startDateTimestamp, newEndDateTimestamp);
				if (newEndDateTimestamp < this._startDateTimestamp) {
					caretPos -= Math.ceil(this.value.length / 2);
				}
			}
			this._updateValueAndFireEvents(newValue, true, ["change", "value-changed"]);
			await Render.renderFinished();
			input.setCaretPosition(caretPos);
		}
		get _effectiveDelimiter() {
			return this.delimiter || this.constructor.getMetadata().getProperties().delimiter.defaultValue;
		}
		_splitValueByDelimiter(value) {
			const valuesArray = [];
			const partsArray = value.split(this._effectiveDelimiter);
			valuesArray[0] = partsArray.slice(0, partsArray.length / 2).join(this._effectiveDelimiter);
			valuesArray[1] = partsArray.slice(partsArray.length / 2).join(this._effectiveDelimiter);
			return valuesArray;
		}
		_extractFirstTimestamp(value) {
			if (!value || !this._checkValueValidity(value)) {
				return undefined;
			}
			const dateStrings = this._splitValueByDelimiter(value);
			return this.getFormat().parse(dateStrings[0], true).getTime() / 1000;
		}
		_extractLastTimestamp(value) {
			if (!value || !this._checkValueValidity(value)) {
				return undefined;
			}
			const dateStrings = this._splitValueByDelimiter(value);
			if (dateStrings[1]) {
				return this.getFormat().parse(dateStrings[1], true).getTime() / 1000;
			}
			return undefined;
		}
		_buildValue(firstDateTimestamp, lastDateTimestamp) {
			if (firstDateTimestamp) {
				const firstDateString = this._getStringFromTimestamp(firstDateTimestamp * 1000);
				if (!lastDateTimestamp) {
					return firstDateString;
				}
				const lastDateString = this._getStringFromTimestamp(lastDateTimestamp * 1000);
				return `${firstDateString} ${this._effectiveDelimiter} ${lastDateString}`;
			}
			return "";
		}
	}
	DateRangePicker.define();

	return DateRangePicker;

});
