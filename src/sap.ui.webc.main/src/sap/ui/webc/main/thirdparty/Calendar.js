sap.ui.define(['sap/ui/webc/common/thirdparty/localization/dates/CalendarDate', 'sap/ui/webc/common/thirdparty/base/Render', 'sap/ui/webc/common/thirdparty/base/Keys', './CalendarDate', './CalendarPart', './CalendarHeader', './DayPicker', './MonthPicker', './YearPicker', './types/CalendarSelectionMode', 'sap/ui/webc/common/thirdparty/localization/features/calendar/Gregorian', './generated/templates/CalendarTemplate.lit', './generated/themes/Calendar.css'], function (CalendarDate, Render, Keys, CalendarDate$1, CalendarPart, CalendarHeader, DayPicker, MonthPicker, YearPicker, CalendarSelectionMode, Gregorian, CalendarTemplate_lit, Calendar_css) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var CalendarDate__default = /*#__PURE__*/_interopDefaultLegacy(CalendarDate);

	const metadata = {
		tag: "ui5-calendar",
		properties:  {
			selectionMode: {
				type: CalendarSelectionMode,
				defaultValue: CalendarSelectionMode.Single,
			},
			hideWeekNumbers: {
				type: Boolean,
			},
			_currentPicker: {
				type: String,
				defaultValue: "day",
			},
			_previousButtonDisabled: {
				type: Boolean,
			},
			_nextButtonDisabled: {
				type: Boolean,
			},
		},
		managedSlots: true,
		slots:  {
			"default": {
				propertyName: "dates",
				type: HTMLElement,
				invalidateOnChildChange: true,
			},
		},
		events:  {
			"selected-dates-change": {
				detail: {
					dates: { type: Array },
					values: { type: Array },
				},
			},
			"show-month-press": {},
			"show-year-press": {},
		},
	};
	class Calendar extends CalendarPart {
		static get metadata() {
			return metadata;
		}
		static get template() {
			return CalendarTemplate_lit;
		}
		static get styles() {
			return Calendar_css;
		}
		get _selectedDatesTimestamps() {
			return this.dates.map(date => {
				const value = date.value;
				return value && !!this.getFormat().parse(value) ? this._getTimeStampFromString(value) / 1000 : undefined;
			}).filter(date => !!date);
		}
		_setSelectedDates(selectedDates) {
			const selectedValues = selectedDates.map(timestamp => this.getFormat().format(new Date(timestamp * 1000), true));
			const valuesInDOM = [...this.dates].map(dateElement => dateElement.value);
			this.dates.filter(dateElement => !selectedValues.includes(dateElement.value)).forEach(dateElement => {
				this.removeChild(dateElement);
			});
			selectedValues.filter(value => !valuesInDOM.includes(value)).forEach(value => {
				const dateElement = document.createElement("ui5-date");
				dateElement.value = value;
				this.appendChild(dateElement);
			});
		}
		async onAfterRendering() {
			await Render.renderFinished();
			this._previousButtonDisabled = !this._currentPickerDOM._hasPreviousPage();
			this._nextButtonDisabled = !this._currentPickerDOM._hasNextPage();
		}
		onHeaderShowMonthPress(event) {
			this._currentPickerDOM._autoFocus = false;
			this._currentPicker = "month";
			this.fireEvent("show-month-press", event);
		}
		onHeaderShowYearPress(event) {
			this._currentPickerDOM._autoFocus = false;
			this._currentPicker = "year";
			this.fireEvent("show-year-press", event);
		}
		get _currentPickerDOM() {
			return this.shadowRoot.querySelector(`[ui5-${this._currentPicker}picker]`);
		}
		onHeaderPreviousPress() {
			this._currentPickerDOM._showPreviousPage();
		}
		onHeaderNextPress() {
			this._currentPickerDOM._showNextPage();
		}
		get _isHeaderMonthButtonHidden() {
			return this._currentPicker === "month";
		}
		get _isDayPickerHidden() {
			return this._currentPicker !== "day";
		}
		get _isMonthPickerHidden() {
			return this._currentPicker !== "month";
		}
		get _isYearPickerHidden() {
			return this._currentPicker !== "year";
		}
		onSelectedDatesChange(event) {
			const timestamp = event.detail.timestamp;
			const selectedDates = event.detail.dates;
			const datesValues = selectedDates.map(ts => {
				const calendarDate = CalendarDate__default.fromTimestamp(ts * 1000, this._primaryCalendarType);
				return this.getFormat().format(calendarDate.toUTCJSDate(), true);
			});
			this.timestamp = timestamp;
			const defaultPrevented = !this.fireEvent("selected-dates-change", { timestamp, dates: [...selectedDates], values: datesValues }, true);
			if (!defaultPrevented) {
				this._setSelectedDates(selectedDates);
			}
		}
		onSelectedMonthChange(event) {
			this.timestamp = event.detail.timestamp;
			this._currentPicker = "day";
			this._currentPickerDOM._autoFocus = true;
		}
		onSelectedYearChange(event) {
			this.timestamp = event.detail.timestamp;
			this._currentPicker = "day";
			this._currentPickerDOM._autoFocus = true;
		}
		onNavigate(event) {
			this.timestamp = event.detail.timestamp;
		}
		_onkeydown(event) {
			if (Keys.isF4(event) && this._currentPicker !== "month") {
				this._currentPicker = "month";
			}
			if (Keys.isF4Shift(event) && this._currentPicker !== "year") {
				this._currentPicker = "year";
			}
		}
		get selectedDates() {
			return this._selectedDatesTimestamps;
		}
		set selectedDates(selectedDates) {
			this._setSelectedDates(selectedDates);
		}
		static get dependencies() {
			return [
				CalendarDate$1,
				CalendarHeader,
				DayPicker,
				MonthPicker,
				YearPicker,
			];
		}
	}
	Calendar.define();

	return Calendar;

});
