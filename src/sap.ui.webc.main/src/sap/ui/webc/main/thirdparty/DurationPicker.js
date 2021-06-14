sap.ui.define(['sap/ui/webc/common/thirdparty/base/types/Integer', 'sap/ui/webc/common/thirdparty/icons/fob-watch', './TimePickerBase', './generated/i18n/i18n-defaults'], function (Integer, fobWatch, TimePickerBase, i18nDefaults) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var Integer__default = /*#__PURE__*/_interopDefaultLegacy(Integer);

	const metadata = {
		tag: "ui5-duration-picker",
		properties:  {
			value: {
				type: String,
				defaultValue: "00:00:00",
			},
			minutesStep: {
				type: Integer__default,
				defaultValue: 1,
			},
			secondsStep: {
				type: Integer__default,
				defaultValue: 1,
			},
			maxValue: {
				type: String,
				defaultValue: "23:59:59",
			},
			hideSeconds: {
				type: Boolean,
			},
			hideMinutes: {
				type: Boolean,
			},
			hideHours: {
				type: Boolean,
			},
		},
	};
	const getNearestValue = (x, step, max) => {
		const down = Math.floor(x / step) * step;
		const up = Math.ceil(x / step) * step;
		if (up > max || x - down < up - x) {
			return down;
		}
		return up;
	};
	const pad = number => {
		number = parseInt(number);
		return number < 9 ? `0${number}` : `${number}`;
	};
	class DurationPicker extends TimePickerBase {
		static get metadata() {
			return metadata;
		}
		onBeforeRendering() {
			const value = this.value;
			if (this.isValid(value)) {
				this.value = this.normalizeValue(value);
			}
		}
		async _handleInputLiveChange(event) {
			const value = event.target.value;
			const valid = this.isValid(value);
			this._updateValueState();
			this.fireEvent("input", { value, valid });
		}
		get _formatPattern() {
			return "HH:mm:ss";
		}
		get _effectiveValue() {
			return this.isValid(this.value) ? this._toFullFormat(this.value) : "00:00:00";
		}
		get _timeSelectionValue() {
			return this._effectiveValue;
		}
		get openIconName() {
			return "fob-watch";
		}
		_toFullFormat(value) {
			let hours = "00",
				minutes = "00",
				seconds = "00";
			const parts = value.split(":");
			if (parts.length && !this.hideHours) {
				hours = parts.shift();
			}
			if (parts.length && !this.hideMinutes) {
				minutes = parts.shift();
			}
			if (parts.length && !this.hideSeconds) {
				seconds = parts.shift();
			}
			return `${hours}:${minutes}:${seconds}`;
		}
		_toPartialFormat(value) {
			const parts = value.split(":");
			const newParts = [];
			if (!this.hideHours) {
				newParts.push(parts[0]);
			}
			if (!this.hideMinutes) {
				newParts.push(parts[1]);
			}
			if (!this.hideSeconds) {
				newParts.push(parts[2]);
			}
			return newParts.join(":");
		}
		_enforceLimitsAndStep(fullFormatValue) {
			let [hours, minutes, seconds] = fullFormatValue.split(":");
			hours = Math.min(hours, this.maxHours);
			minutes = Math.min(minutes, this.maxMinutes);
			seconds = Math.min(seconds, this.maxSeconds);
			minutes = getNearestValue(minutes, this.minutesStep, this.maxMinutes);
			seconds = getNearestValue(seconds, this.secondsStep, this.maxSeconds);
			return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
		}
		normalizeValue(value) {
			let fullFormatValue = this._toFullFormat(value);
			fullFormatValue = this._enforceLimitsAndStep(fullFormatValue);
			return this._toPartialFormat(fullFormatValue);
		}
		get maxHours() {
			return parseInt(this.maxValue.split(":")[0]);
		}
		get maxMinutes() {
			return parseInt(this.maxValue.split(":")[1]);
		}
		get maxSeconds() {
			return parseInt(this.maxValue.split(":")[2]);
		}
		get dateAriaDescription() {
			return this.i18nBundle.getText(i18nDefaults.DURATION_INPUT_DESCRIPTION);
		}
		get accInfo() {
			return {
				"ariaRoledescription": this.dateAriaDescription,
				"ariaHasPopup": "dialog",
				"ariaAutoComplete": "none",
				"role": "combobox",
				"ariaControls": `${this._id}-responsive-popover`,
				"ariaExpanded": this.isOpen(),
			};
		}
	}
	DurationPicker.define();

	return DurationPicker;

});
