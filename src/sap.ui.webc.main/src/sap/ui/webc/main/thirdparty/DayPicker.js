sap.ui.define(['sap/ui/webc/common/thirdparty/base/locale/getLocale', 'sap/ui/webc/common/thirdparty/base/config/FormatSettings', 'sap/ui/webc/common/thirdparty/localization/getCachedLocaleDataInstance', 'sap/ui/webc/common/thirdparty/base/Keys', 'sap/ui/webc/common/thirdparty/base/types/Integer', 'sap/ui/webc/common/thirdparty/localization/dates/CalendarDate', 'sap/ui/webc/common/thirdparty/localization/dates/calculateWeekNumber', 'sap/ui/webc/common/thirdparty/base/types/CalendarType', './types/CalendarSelectionMode', './CalendarPart', './generated/templates/DayPickerTemplate.lit', './generated/i18n/i18n-defaults', './generated/themes/DayPicker.css'], function (getLocale, FormatSettings, getCachedLocaleDataInstance, Keys, Integer, CalendarDate, calculateWeekNumber, CalendarType, CalendarSelectionMode, CalendarPart, DayPickerTemplate_lit, i18nDefaults, DayPicker_css) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var getLocale__default = /*#__PURE__*/_interopDefaultLegacy(getLocale);
	var getCachedLocaleDataInstance__default = /*#__PURE__*/_interopDefaultLegacy(getCachedLocaleDataInstance);
	var Integer__default = /*#__PURE__*/_interopDefaultLegacy(Integer);
	var CalendarDate__default = /*#__PURE__*/_interopDefaultLegacy(CalendarDate);
	var calculateWeekNumber__default = /*#__PURE__*/_interopDefaultLegacy(calculateWeekNumber);
	var CalendarType__default = /*#__PURE__*/_interopDefaultLegacy(CalendarType);

	const metadata = {
		tag: "ui5-daypicker",
		properties:  {
			selectedDates: {
				type: Integer__default,
				multiple: true,
				compareValues: true,
			},
			selectionMode: {
				type: CalendarSelectionMode,
				defaultValue: CalendarSelectionMode.Single,
			},
			hideWeekNumbers: {
				type: Boolean,
			},
			_weeks: {
				type: Object,
				multiple: true,
			},
			_dayNames: {
				type: Object,
				multiple: true,
			},
			_hidden: {
				type: Boolean,
				noAttribute: true,
			},
			_secondTimestamp: {
				type: String,
			},
		},
		events:  {
			change: {},
			navigate: {},
		},
	};
	const isBetween = (x, num1, num2) => x > Math.min(num1, num2) && x < Math.max(num1, num2);
	const DAYS_IN_WEEK = 7;
	class DayPicker extends CalendarPart {
		static get metadata() {
			return metadata;
		}
		static get template() {
			return DayPickerTemplate_lit;
		}
		static get styles() {
			return DayPicker_css;
		}
		onBeforeRendering() {
			const localeData = getCachedLocaleDataInstance__default(getLocale__default());
			this._buildWeeks(localeData);
			this._buildDayNames(localeData);
		}
		_buildWeeks(localeData) {
			if (this._hidden) {
				return;
			}
			this._weeks = [];
			const firstDayOfWeek = this._getFirstDayOfWeek();
			const monthsNames = localeData.getMonths("wide", this._primaryCalendarType);
			const secondaryMonthsNames = this.hasSecondaryCalendarType && localeData.getMonths("wide", this.secondaryCalendarType);
			const nonWorkingDayLabel = this.i18nBundle.getText(i18nDefaults.DAY_PICKER_NON_WORKING_DAY);
			const todayLabel = this.i18nBundle.getText(i18nDefaults.DAY_PICKER_TODAY);
			const tempDate = this._getFirstDay();
			const todayDate = CalendarDate__default.fromLocalJSDate(new Date(), this._primaryCalendarType);
			const calendarDate = this._calendarDate;
			const minDate = this._minDate;
			const maxDate = this._maxDate;
			const tempSecondDate = this.hasSecondaryCalendarType && this._getSecondaryDay(tempDate);
			let week = [];
			for (let i = 0; i < DAYS_IN_WEEK * 6; i++) {
				const timestamp = tempDate.valueOf() / 1000;
				let dayOfTheWeek = tempDate.getDay() - firstDayOfWeek;
				if (dayOfTheWeek < 0) {
					dayOfTheWeek += DAYS_IN_WEEK;
				}
				const isFocused = tempDate.getMonth() === calendarDate.getMonth() && tempDate.getDate() === calendarDate.getDate();
				const isSelected = this._isDaySelected(timestamp);
				const isSelectedBetween = this._isDayInsideSelectionRange(timestamp);
				const isOtherMonth = tempDate.getMonth() !== calendarDate.getMonth();
				const isWeekend = this._isWeekend(tempDate);
				const isDisabled = tempDate.valueOf() < minDate.valueOf() || tempDate.valueOf() > maxDate.valueOf();
				const isToday = tempDate.isSame(todayDate);
				const isFirstDayOfWeek = tempDate.getDay() === firstDayOfWeek;
				const nonWorkingAriaLabel = isWeekend ? `${nonWorkingDayLabel} ` : "";
				const todayAriaLabel = isToday ? `${todayLabel} ` : "";
				const ariaLabel = this.hasSecondaryCalendarType
					? `${todayAriaLabel}${nonWorkingAriaLabel}${monthsNames[tempDate.getMonth()]} ${tempDate.getDate()}, ${tempDate.getYear()} ${secondaryMonthsNames[tempSecondDate.getMonth()]} ${tempSecondDate.getDate()}, ${tempSecondDate.getYear()}`
					: `${todayAriaLabel}${nonWorkingAriaLabel}${monthsNames[tempDate.getMonth()]} ${tempDate.getDate()}, ${tempDate.getYear()}`;
				const day = {
					timestamp: timestamp.toString(),
					focusRef: isFocused,
					_tabIndex: isFocused ? "0" : "-1",
					selected: isSelected,
					day: tempDate.getDate(),
					secondDay: this.hasSecondaryCalendarType && tempSecondDate.getDate(),
					_isSecondaryCalendarType: this.hasSecondaryCalendarType,
					classes: `ui5-dp-item ui5-dp-wday${dayOfTheWeek}`,
					ariaLabel,
					ariaSelected: isSelected ? "true" : "false",
					ariaDisabled: isOtherMonth ? "true" : undefined,
					disabled: isDisabled,
				};
				if (isFirstDayOfWeek) {
					day.classes += " ui5-dp-firstday";
				}
				if (isSelected) {
					day.classes += " ui5-dp-item--selected";
				}
				if (isSelectedBetween) {
					day.classes += " ui5-dp-item--selected-between";
				}
				if (isToday) {
					day.classes += " ui5-dp-item--now";
				}
				if (isOtherMonth) {
					day.classes += " ui5-dp-item--othermonth";
				}
				if (isWeekend) {
					day.classes += " ui5-dp-item--weeekend";
				}
				if (isDisabled) {
					day.classes += " ui5-dp-item--disabled";
				}
				week.push(day);
				if (dayOfTheWeek === DAYS_IN_WEEK - 1) {
					week.unshift({
						weekNum: calculateWeekNumber__default(FormatSettings.getFirstDayOfWeek(), tempDate.toUTCJSDate(), tempDate.getYear(), getLocale__default(), localeData),
						isHidden: this.shouldHideWeekNumbers,
					});
				}
				if (week.length === DAYS_IN_WEEK + 1) {
					this._weeks.push(week);
					week = [];
				}
				tempDate.setDate(tempDate.getDate() + 1);
				if (this.hasSecondaryCalendarType) {
					tempSecondDate.setDate(tempSecondDate.getDate() + 1);
				}
			}
		}
		_buildDayNames(localeData) {
			if (this._hidden) {
				return;
			}
			let dayOfTheWeek;
			const aDayNamesWide = localeData.getDays("wide", this._primaryCalendarType);
			const aDayNamesAbbreviated = localeData.getDays("abbreviated", this._primaryCalendarType);
			let dayName;
			this._dayNames = [];
			this._dayNames.push({
				classes: "ui5-dp-dayname",
				name: this.i18nBundle.getText(i18nDefaults.DAY_PICKER_WEEK_NUMBER_TEXT),
			});
			for (let i = 0; i < DAYS_IN_WEEK; i++) {
				dayOfTheWeek = i + this._getFirstDayOfWeek();
				if (dayOfTheWeek > DAYS_IN_WEEK - 1) {
					dayOfTheWeek -= DAYS_IN_WEEK;
				}
				dayName = {
					name: aDayNamesWide[dayOfTheWeek],
					ultraShortName: aDayNamesAbbreviated[dayOfTheWeek],
					classes: "ui5-dp-dayname",
				};
				this._dayNames.push(dayName);
			}
			this._dayNames[1].classes += " ui5-dp-firstday";
			if (this.shouldHideWeekNumbers) {
				this._dayNames.shift();
			}
		}
		onAfterRendering() {
			if (this._autoFocus && !this._hidden) {
				this.focus();
			}
		}
		_onfocusin() {
			this._autoFocus = true;
		}
		_onfocusout() {
			this._autoFocus = false;
		}
		_isDaySelected(timestamp) {
			if (this.selectionMode === CalendarSelectionMode.Single) {
				return timestamp === this.selectedDates[0];
			}
			return this.selectedDates.includes(timestamp);
		}
		_isDayInsideSelectionRange(timestamp) {
			if (this.selectionMode !== CalendarSelectionMode.Range || !this.selectedDates.length) {
				return false;
			}
			if (this.selectedDates.length === 1 && this._secondTimestamp) {
				return isBetween(timestamp, this.selectedDates[0], this._secondTimestamp);
			}
			return isBetween(timestamp, this.selectedDates[0], this.selectedDates[1]);
		}
		_selectDate(event, isShift) {
			const target = event.target;
			if (!this._isDayPressed(target)) {
				return;
			}
			const timestamp = this._getTimestampFromDom(target);
			this._safelySetTimestamp(timestamp);
			this._updateSecondTimestamp();
			if (this.selectionMode === CalendarSelectionMode.Single) {
				this.selectedDates = [timestamp];
			} else if (this.selectionMode === CalendarSelectionMode.Multiple) {
				if (this.selectedDates.length > 0 && isShift) {
					this._multipleSelection(timestamp);
				} else {
					this._toggleTimestampInSelection(timestamp);
				}
			} else {
				this.selectedDates = (this.selectedDates.length === 1) ? [...this.selectedDates, timestamp]	: [timestamp];
			}
			this.fireEvent("change", {
				timestamp: this.timestamp,
				dates: this.selectedDates,
			});
		}
		_selectWeek(event) {
			this._weeks.forEach(week => {
				const dayInThisWeek = week.findIndex(item => {
					const date = CalendarDate__default.fromTimestamp(parseInt(item.timestamp) * 1000);
					return date.getMonth() === this._calendarDate.getMonth() && date.getDate() === this._calendarDate.getDate();
				}) !== -1;
				if (dayInThisWeek) {
					const notAllDaysOfThisWeekSelected = week.some(item => item.timestamp && !this.selectedDates.includes(parseInt(item.timestamp)));
					if (notAllDaysOfThisWeekSelected) {
						week.filter(item => item.timestamp).forEach(item => {
							this._addTimestampToSelection(parseInt(item.timestamp));
						});
					} else {
						week.filter(item => item.timestamp).forEach(item => {
							this._removeTimestampFromSelection(parseInt(item.timestamp));
						});
					}
				}
			});
			this.fireEvent("change", {
				timestamp: this.timestamp,
				dates: this.selectedDates,
			});
		}
		_toggleTimestampInSelection(timestamp) {
			if (this.selectedDates.includes(timestamp)) {
				this._removeTimestampFromSelection(timestamp);
			} else {
				this._addTimestampToSelection(timestamp);
			}
		}
		_addTimestampToSelection(timestamp) {
			if (!this.selectedDates.includes(timestamp)) {
				this.selectedDates = [...this.selectedDates, timestamp];
			}
		}
		_removeTimestampFromSelection(timestamp) {
			this.selectedDates = this.selectedDates.filter(value => value !== timestamp);
		}
		_multipleSelection(timestamp) {
			const min = Math.min(...this.selectedDates);
			const max = Math.max(...this.selectedDates);
			let start;
			let end;
			let toggle = false;
			if (timestamp < min) {
				start = timestamp;
				end = min;
			} else if (timestamp >= min && timestamp <= max) {
				const distanceToMin = Math.abs(timestamp - min);
				const distanceToMax = Math.abs(timestamp - max);
				if (distanceToMin < distanceToMax) {
					start = timestamp;
					end = max;
				} else {
					start = min;
					end = timestamp;
				}
				toggle = true;
			} else {
				start = max;
				end = timestamp;
			}
			const startDate = CalendarDate__default.fromTimestamp(start * 1000);
			const endDate = CalendarDate__default.fromTimestamp(end * 1000);
			while (startDate.valueOf() <= endDate.valueOf()) {
				this[toggle ? "_toggleTimestampInSelection" : "_addTimestampToSelection"](startDate.valueOf() / 1000);
				startDate.setDate(startDate.getDate() + 1);
			}
		}
		_onmouseover(event) {
			const hoveredItem = event.target.closest(".ui5-dp-item");
			if (hoveredItem && this.selectionMode === CalendarSelectionMode.Range && this.selectedDates.length === 1) {
				this._secondTimestamp = this._getTimestampFromDom(hoveredItem);
			}
		}
		_onkeydown(event) {
			let preventDefault = true;
			if (Keys.isEnter(event) || Keys.isEnterShift(event)) {
				this._selectDate(event, Keys.isEnterShift(event));
			} else if (Keys.isSpace(event) || Keys.isSpaceShift(event)) {
				event.preventDefault();
			} else if (Keys.isLeft(event)) {
				this._modifyTimestampBy(-1, "day");
			} else if (Keys.isRight(event)) {
				this._modifyTimestampBy(1, "day");
			} else if (Keys.isUp(event)) {
				this._modifyTimestampBy(-7, "day");
			} else if (Keys.isDown(event)) {
				this._modifyTimestampBy(7, "day");
			} else if (Keys.isPageUp(event)) {
				this._modifyTimestampBy(-1, "month");
			} else if (Keys.isPageDown(event)) {
				this._modifyTimestampBy(1, "month");
			} else if (Keys.isPageUpShift(event) || Keys.isPageUpAlt(event)) {
				this._modifyTimestampBy(-1, "year");
			} else if (Keys.isPageDownShift(event) || Keys.isPageDownAlt(event)) {
				this._modifyTimestampBy(1, "year");
			} else if (Keys.isPageUpShiftCtrl(event)) {
				this._modifyTimestampBy(-10, "year");
			} else if (Keys.isPageDownShiftCtrl(event)) {
				this._modifyTimestampBy(10, "year");
			} else if (Keys.isHome(event) || Keys.isEnd(event)) {
				this._onHomeOrEnd(Keys.isHome(event));
			} else if (Keys.isHomeCtrl(event)) {
				const tempDate = new CalendarDate__default(this._calendarDate, this._primaryCalendarType);
				tempDate.setDate(1);
				this._setTimestamp(tempDate.valueOf() / 1000);
			} else if (Keys.isEndCtrl(event)) {
				const tempDate = new CalendarDate__default(this._calendarDate, this._primaryCalendarType);
				tempDate.setMonth(tempDate.getMonth() + 1);
				tempDate.setDate(0);
				this._setTimestamp(tempDate.valueOf() / 1000);
			} else {
				preventDefault = false;
			}
			if (preventDefault) {
				event.preventDefault();
			}
		}
		_onkeyup(event) {
			if (Keys.isSpace(event) || (Keys.isSpaceShift(event) && this.selectionMode !== CalendarSelectionMode.Multiple)) {
				this._selectDate(event, false);
			} else if (Keys.isSpaceShift(event)) {
				this._selectWeek(event);
			}
		}
		_onclick(event) {
			this._selectDate(event, event.shiftKey);
		}
		_onHomeOrEnd(homePressed) {
			this._weeks.forEach(week => {
				const dayInThisWeek = week.findIndex(item => {
					const date = CalendarDate__default.fromTimestamp(parseInt(item.timestamp) * 1000);
					return date.getMonth() === this._calendarDate.getMonth() && date.getDate() === this._calendarDate.getDate();
				}) !== -1;
				if (dayInThisWeek) {
					const index = homePressed ? 1 : 7;
					this._setTimestamp(parseInt(week[index].timestamp));
				}
			});
		}
		_hasPreviousPage() {
			return !(this._calendarDate.getMonth() === this._minDate.getMonth() && this._calendarDate.getYear() === this._minDate.getYear());
		}
		_hasNextPage() {
			return !(this._calendarDate.getMonth() === this._maxDate.getMonth() && this._calendarDate.getYear() === this._maxDate.getYear());
		}
		_showPreviousPage() {
			this._modifyTimestampBy(-1, "month");
		}
		_showNextPage() {
			this._modifyTimestampBy(1, "month");
		}
		_modifyTimestampBy(amount, unit) {
			this._safelyModifyTimestampBy(amount, unit);
			this._updateSecondTimestamp();
			this.fireEvent("navigate", { timestamp: this.timestamp });
		}
		_setTimestamp(value) {
			this._safelySetTimestamp(value);
			this._updateSecondTimestamp();
			this.fireEvent("navigate", { timestamp: this.timestamp });
		}
		_updateSecondTimestamp() {
			if (this.selectionMode === CalendarSelectionMode.Range && this.selectedDates.length === 1) {
				this._secondTimestamp = this.timestamp;
			}
		}
		get shouldHideWeekNumbers() {
			if (this._primaryCalendarType !== CalendarType__default.Gregorian) {
				return true;
			}
			return this.hideWeekNumbers;
		}
		get hasSecondaryCalendarType() {
			return !!this.secondaryCalendarType;
		}
		_isWeekend(oDate) {
			const localeData = getCachedLocaleDataInstance__default(getLocale__default());
			const iWeekDay = oDate.getDay(),
				iWeekendStart = localeData.getWeekendStart(),
				iWeekendEnd = localeData.getWeekendEnd();
			return (iWeekDay >= iWeekendStart && iWeekDay <= iWeekendEnd)
				|| (iWeekendEnd < iWeekendStart && (iWeekDay >= iWeekendStart || iWeekDay <= iWeekendEnd));
		}
		_isDayPressed(target) {
			const targetParent = target.parentNode;
			return (target.className.indexOf("ui5-dp-item") > -1) || (targetParent && targetParent.classList && targetParent.classList.contains("ui5-dp-item"));
		}
		_getSecondaryDay(tempDate) {
			return new CalendarDate__default(tempDate, this.secondaryCalendarType);
		}
		_getFirstDay() {
			let daysFromPreviousMonth;
			const firstDayOfWeek = this._getFirstDayOfWeek();
			const firstDay = new CalendarDate__default(this._calendarDate, this._primaryCalendarType);
			firstDay.setDate(1);
			daysFromPreviousMonth = firstDay.getDay() - firstDayOfWeek;
			if (daysFromPreviousMonth < 0) {
				daysFromPreviousMonth = 7 + daysFromPreviousMonth;
			}
			if (daysFromPreviousMonth > 0) {
				firstDay.setDate(1 - daysFromPreviousMonth);
			}
			return firstDay;
		}
		_getFirstDayOfWeek() {
			const localeData = getCachedLocaleDataInstance__default(getLocale__default());
			const confFirstDayOfWeek = FormatSettings.getFirstDayOfWeek();
			return Number.isInteger(confFirstDayOfWeek) ? confFirstDayOfWeek : localeData.getFirstDayOfWeek();
		}
		get styles() {
			return {
				wrapper: {
					display: this._hidden ? "none" : "flex",
					"justify-content": "center",
				},
				main: {
					width: "100%",
				},
			};
		}
	}
	DayPicker.define();

	return DayPicker;

});
