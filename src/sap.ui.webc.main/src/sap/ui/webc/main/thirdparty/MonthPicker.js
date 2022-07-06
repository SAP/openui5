sap.ui.define(['sap/ui/webc/common/thirdparty/localization/getCachedLocaleDataInstance', 'sap/ui/webc/common/thirdparty/localization/dates/CalendarDate', 'sap/ui/webc/common/thirdparty/base/Keys', 'sap/ui/webc/common/thirdparty/base/types/Integer', 'sap/ui/webc/common/thirdparty/base/locale/getLocale', './CalendarPart', './generated/templates/MonthPickerTemplate.lit', './generated/themes/MonthPicker.css'], function (getCachedLocaleDataInstance, CalendarDate, Keys, Integer, getLocale, CalendarPart, MonthPickerTemplate_lit, MonthPicker_css) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var getCachedLocaleDataInstance__default = /*#__PURE__*/_interopDefaultLegacy(getCachedLocaleDataInstance);
	var CalendarDate__default = /*#__PURE__*/_interopDefaultLegacy(CalendarDate);
	var Integer__default = /*#__PURE__*/_interopDefaultLegacy(Integer);
	var getLocale__default = /*#__PURE__*/_interopDefaultLegacy(getLocale);

	const metadata = {
		tag: "ui5-monthpicker",
		properties:  {
			selectedDates: {
				type: Integer__default,
				multiple: true,
				compareValues: true,
			},
			_months: {
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
	const PAGE_SIZE = 12;
	const ROW_SIZE = 3;
	class MonthPicker extends CalendarPart {
		static get metadata() {
			return metadata;
		}
		static get template() {
			return MonthPickerTemplate_lit;
		}
		static get styles() {
			return MonthPicker_css;
		}
		onBeforeRendering() {
			this._buildMonths();
		}
		_buildMonths() {
			if (this._hidden) {
				return;
			}
			const localeData = getCachedLocaleDataInstance__default(getLocale__default());
			const monthsNames = localeData.getMonthsStandAlone("wide", this._primaryCalendarType);
			const months = [];
			const calendarDate = this._calendarDate;
			const minDate = this._minDate;
			const maxDate = this._maxDate;
			const tempDate = new CalendarDate__default(calendarDate, this._primaryCalendarType);
			let timestamp;
			for (let i = 0; i < 12; i++) {
				tempDate.setMonth(i);
				timestamp = tempDate.valueOf() / 1000;
				const isSelected = this.selectedDates.some(itemTimestamp => {
					const date = CalendarDate__default.fromTimestamp(itemTimestamp * 1000, this._primaryCalendarType);
					return date.getYear() === tempDate.getYear() && date.getMonth() === tempDate.getMonth();
				});
				const isFocused = tempDate.getMonth() === calendarDate.getMonth();
				const isDisabled = this._isOutOfSelectableRange(tempDate, minDate, maxDate);
				const month = {
					timestamp: timestamp.toString(),
					focusRef: isFocused,
					_tabIndex: isFocused ? "0" : "-1",
					selected: isSelected,
					ariaSelected: isSelected ? "true" : "false",
					name: monthsNames[i],
					disabled: isDisabled,
					classes: "ui5-mp-item",
				};
				if (isSelected) {
					month.classes += " ui5-mp-item--selected";
				}
				if (isDisabled) {
					month.classes += " ui5-mp-item--disabled";
				}
				const quarterIndex = parseInt(i / ROW_SIZE);
				if (months[quarterIndex]) {
					months[quarterIndex].push(month);
				} else {
					months[quarterIndex] = [month];
				}
			}
			this._months = months;
		}
		onAfterRendering() {
			if (!this._hidden) {
				this.focus();
			}
		}
		_onkeydown(event) {
			let preventDefault = true;
			if (Keys.isEnter(event)) {
				this._selectMonth(event);
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
				this._setTimestamp(parseInt(this._months[0][0].timestamp));
			} else if (Keys.isEndCtrl(event)) {
				this._setTimestamp(parseInt(this._months[PAGE_SIZE / ROW_SIZE - 1][ROW_SIZE - 1].timestamp));
			} else {
				preventDefault = false;
			}
			if (preventDefault) {
				event.preventDefault();
			}
		}
		_onHomeOrEnd(homePressed) {
			this._months.forEach(row => {
				const indexInRow = row.findIndex(item => CalendarDate__default.fromTimestamp(parseInt(item.timestamp) * 1000).getMonth() === this._calendarDate.getMonth());
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
			this._safelyModifyTimestampBy(amount, "month");
			this.fireEvent("navigate", { timestamp: this.timestamp });
		}
		_onkeyup(event) {
			if (Keys.isSpace(event)) {
				this._selectMonth(event);
			}
		}
		_selectMonth(event) {
			event.preventDefault();
			if (event.target.className.indexOf("ui5-mp-item") > -1) {
				const timestamp = this._getTimestampFromDom(event.target);
				this._safelySetTimestamp(timestamp);
				this.fireEvent("change", { timestamp: this.timestamp });
			}
		}
		_hasPreviousPage() {
			return this._calendarDate.getYear() !== this._minDate.getYear();
		}
		_hasNextPage() {
			return this._calendarDate.getYear() !== this._maxDate.getYear();
		}
		_showPreviousPage() {
			this._modifyTimestampBy(-PAGE_SIZE);
		}
		_showNextPage() {
			this._modifyTimestampBy(PAGE_SIZE);
		}
		_isOutOfSelectableRange(date, minDate, maxDate) {
			const month = date.getMonth();
			const year = date.getYear();
			const minYear = minDate.getYear();
			const minMonth = minDate.getMonth();
			const maxYear = maxDate.getYear();
			const maxMonth = maxDate.getMonth();
			return year < minYear || (year === minYear && month < minMonth) || year > maxYear || (year === maxYear && month > maxMonth);
		}
	}
	MonthPicker.define();

	return MonthPicker;

});
