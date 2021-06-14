sap.ui.define(['sap/ui/webc/common/thirdparty/localization/DateFormat', 'sap/ui/webc/common/thirdparty/base/Keys', 'sap/ui/webc/common/thirdparty/base/types/Integer', 'sap/ui/webc/common/thirdparty/base/locale/getLocale', 'sap/ui/webc/common/thirdparty/localization/dates/CalendarDate', 'sap/ui/webc/common/thirdparty/localization/dates/ExtremeDates', './CalendarPart', './generated/templates/YearPickerTemplate.lit', './generated/themes/YearPicker.css'], function (DateFormat, Keys, Integer, getLocale, CalendarDate, ExtremeDates, CalendarPart, YearPickerTemplate_lit, YearPicker_css) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var DateFormat__default = /*#__PURE__*/_interopDefaultLegacy(DateFormat);
	var Integer__default = /*#__PURE__*/_interopDefaultLegacy(Integer);
	var getLocale__default = /*#__PURE__*/_interopDefaultLegacy(getLocale);
	var CalendarDate__default = /*#__PURE__*/_interopDefaultLegacy(CalendarDate);

	const metadata = {
		tag: "ui5-yearpicker",
		properties:  {
			selectedDates: {
				type: Integer__default,
				multiple: true,
				compareValues: true,
			},
			_years: {
				type: Object,
				multiple: true,
			},
			_hidden: {
				type: Boolean,
				noAttribute: true,
			},
		},
		events:  {
			change: {},
			navigate: {},
		},
	};
	const PAGE_SIZE = 20;
	const ROW_SIZE = 4;
	class YearPicker extends CalendarPart {
		static get metadata() {
			return metadata;
		}
		static get styles() {
			return YearPicker_css;
		}
		static get template() {
			return YearPickerTemplate_lit;
		}
		onBeforeRendering() {
			this._buildYears();
		}
		_buildYears() {
			if (this._hidden) {
				return;
			}
			const oYearFormat = DateFormat__default.getDateInstance({ format: "y", calendarType: this._primaryCalendarType }, getLocale__default());
			this._calculateFirstYear();
			const calendarDate = this._calendarDate;
			const minDate = this._minDate;
			const maxDate = this._maxDate;
			const tempDate = new CalendarDate__default(calendarDate, this._primaryCalendarType);
			tempDate.setYear(this._firstYear);
			const intervals = [];
			let timestamp;
			for (let i = 0; i < PAGE_SIZE; i++) {
				timestamp = tempDate.valueOf() / 1000;
				const isSelected = this.selectedDates.some(itemTimestamp => {
					const date = CalendarDate__default.fromTimestamp(itemTimestamp * 1000, this._primaryCalendarType);
					return date.getYear() === tempDate.getYear();
				});
				const isFocused = tempDate.getYear() === calendarDate.getYear();
				const isDisabled = tempDate.getYear() < minDate.getYear() || tempDate.getYear() > maxDate.getYear();
				const year = {
					timestamp: timestamp.toString(),
					_tabIndex: isFocused ? "0" : "-1",
					focusRef: isFocused,
					selected: isSelected,
					ariaSelected: isSelected ? "true" : "false",
					year: oYearFormat.format(tempDate.toLocalJSDate()),
					disabled: isDisabled,
					classes: "ui5-yp-item",
				};
				if (isSelected) {
					year.classes += " ui5-yp-item--selected";
				}
				if (isDisabled) {
					year.classes += " ui5-yp-item--disabled";
				}
				const intervalIndex = parseInt(i / ROW_SIZE);
				if (intervals[intervalIndex]) {
					intervals[intervalIndex].push(year);
				} else {
					intervals[intervalIndex] = [year];
				}
				tempDate.setYear(tempDate.getYear() + 1);
			}
			this._years = intervals;
		}
		_calculateFirstYear() {
			const absoluteMaxYear = ExtremeDates.getMaxCalendarDate(this._primaryCalendarType).getYear();
			const currentYear = this._calendarDate.getYear();
			if (!this._firstYear) {
				this._firstYear = currentYear - PAGE_SIZE / 2;
			}
			if (currentYear < this._firstYear) {
				this._firstYear -= PAGE_SIZE;
			} else if (currentYear >= this._firstYear + PAGE_SIZE) {
				this._firstYear += PAGE_SIZE;
			}
			if (Math.abs(this._firstYear - currentYear) >= PAGE_SIZE) {
				this._firstYear = currentYear - PAGE_SIZE / 2;
			}
			this._firstYear = Math.max(this._firstYear, this._minDate.getYear());
			this._firstYear = Math.min(this._firstYear, this._maxDate.getYear());
			if (this._firstYear > absoluteMaxYear - PAGE_SIZE + 1) {
				this._firstYear = absoluteMaxYear - PAGE_SIZE + 1;
			}
		}
		onAfterRendering() {
			if (!this._hidden) {
				this.focus();
			}
		}
		_onkeydown(event) {
			let preventDefault = true;
			if (Keys.isEnter(event)) {
				this._selectYear(event);
			} else if (Keys.isSpace(event)) {
				event.preventDefault();
			} else if (Keys.isLeft(event)) {
				this._modifyTimestampBy(-1);
			} else if (Keys.isRight(event)) {
				this._modifyTimestampBy(1);
			} else if (Keys.isUp(event)) {
				this._modifyTimestampBy(-ROW_SIZE);
			} else if (Keys.isDown(event)) {
				this._modifyTimestampBy(ROW_SIZE);
			} else if (Keys.isPageUp(event)) {
				this._modifyTimestampBy(-PAGE_SIZE);
			} else if (Keys.isPageDown(event)) {
				this._modifyTimestampBy(PAGE_SIZE);
			} else if (Keys.isHome(event) || Keys.isEnd(event)) {
				this._onHomeOrEnd(Keys.isHome(event));
			} else if (Keys.isHomeCtrl(event)) {
				this._setTimestamp(parseInt(this._years[0][0].timestamp));
			} else if (Keys.isEndCtrl(event)) {
				this._setTimestamp(parseInt(this._years[PAGE_SIZE / ROW_SIZE - 1][ROW_SIZE - 1].timestamp));
			} else {
				preventDefault = false;
			}
			if (preventDefault) {
				event.preventDefault();
			}
		}
		_onHomeOrEnd(homePressed) {
			this._years.forEach(row => {
				const indexInRow = row.findIndex(item => CalendarDate__default.fromTimestamp(parseInt(item.timestamp) * 1000).getYear() === this._calendarDate.getYear());
				if (indexInRow !== -1) {
					const index = homePressed ? 0 : ROW_SIZE - 1;
					this._setTimestamp(parseInt(row[index].timestamp));
				}
			});
		}
		_setTimestamp(value) {
			this._safelySetTimestamp(value);
			this.fireEvent("navigate", { timestamp: this.timestamp });
		}
		_modifyTimestampBy(amount) {
			this._safelyModifyTimestampBy(amount, "year");
			this.fireEvent("navigate", { timestamp: this.timestamp });
		}
		_onkeyup(event) {
			if (Keys.isSpace(event)) {
				this._selectYear(event);
			}
		}
		_selectYear(event) {
			event.preventDefault();
			if (event.target.className.indexOf("ui5-yp-item") > -1) {
				const timestamp = this._getTimestampFromDom(event.target);
				this._safelySetTimestamp(timestamp);
				this.fireEvent("change", { timestamp: this.timestamp });
			}
		}
		_hasPreviousPage() {
			return this._firstYear > this._minDate.getYear();
		}
		_hasNextPage() {
			return this._firstYear + PAGE_SIZE - 1 < this._maxDate.getYear();
		}
		_showPreviousPage() {
			this._modifyTimestampBy(-PAGE_SIZE);
		}
		_showNextPage() {
			this._modifyTimestampBy(PAGE_SIZE);
		}
	}
	YearPicker.define();

	return YearPicker;

});
