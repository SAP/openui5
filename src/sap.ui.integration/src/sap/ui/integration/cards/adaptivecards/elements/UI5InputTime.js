/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/integration/thirdparty/adaptivecards",
	"sap/ui/core/format/DateFormat"
],
	function (
		AdaptiveCards,
		DateFormat
	) {
		"use strict";

		function UI5InputTime() {
			AdaptiveCards.TimeInput.apply(this, arguments);
		}

		// Value state map
		var ValueState = {
			None: "None",
			Error: "Error"
		};

		var sTimePattern = "HH:mm";

		UI5InputTime.prototype = Object.create(AdaptiveCards.TimeInput.prototype);

		UI5InputTime.prototype.internalRender = function () {
			var sWCElement = "ui5-timepicker";
			this._timeInputElement = document.createElement(sWCElement);
			this._timeInputElement.id = this.id;
			this._timeInputElement.value = this.defaultValue || "";
			this._timeInputElement.formatPattern = sTimePattern;

			// Initial check
			this._handleMinMaxProps();
			this._validateInput(this.value);

			this._timeInputElement.addEventListener("change", function (oEvent) {
				this._validateInput(oEvent.target.value);

				this.valueChanged();
			}.bind(this));

			return this._timeInputElement;
		};

		/**
		 * Validate if the input value is between min and max ranges.
		 * @param {string} sValue The input value to check.
		 * @private
		 */
		UI5InputTime.prototype._validateInputRange = function (sValue) {
			var aValue,
				iValueHour,
				iValueMinute;

			// return if there don't have min and max values
			if (!this._isMinValid && !this._isMaxValid) {
				this._setValueState(ValueState.None);
				return;
			}

			aValue = sValue.split(":");
			iValueHour = aValue[0];
			iValueMinute = aValue[1];

			if (this._isMinValid && iValueHour < this._iMinHour || (iValueHour === this._iMinHour && iValueMinute < this._iMinMinute)) {
				this._setValueState(ValueState.Error);
				return;
			}

			if (this._isMaxValid && iValueHour > this._iMaxHour || (iValueHour === this._iMaxHour && iValueMinute > this._iMaxMinute)) {
				this._setValueState(ValueState.Error);
				return;
			}

			// remove value state when all checks are passed
			this._setValueState(ValueState.None);
		};

		/**
		 * Validate if the input is valid value.
		 * @param {string} sValue The input value to check.
		 * @private
		 */
		UI5InputTime.prototype._validateInput = function (sValue) {
			if (sValue === "") {
				this._setValueState(ValueState.None);
				return;
			}

			this._isValidTime(sValue) ? this._validateInputRange(sValue) : this._setValueState(ValueState.Error);
		};

		/**
		 * Validate min and max values
		 * @private
		 */
		UI5InputTime.prototype._handleMinMaxProps = function () {
			this._isMinValid = this._min && this._isValidTime(this._min);
			this._isMaxValid = this._max && this._isValidTime(this._max);

			if (this._isMinValid) {
				this._aMinValue = this._min.split(":");
				this._iMinHour = Number(this._aMinValue[0]);
				this._iMinMinute = Number(this._aMinValue[1]);
			}

			if (this._isMaxValid) {
				this._aMaxValue = this._max.split(":");
				this._iMaxHour = Number(this._aMaxValue[0]);
				this._iMaxMinute = Number(this._aMaxValue[1]);
			}

			if (!this._isMinValid || !this._isMaxValid) {
				return;
			}

			if (this._iMinHour > this._iMaxHour || (this._iMinHour === this._iMaxHour && this._iMinMinute > this._iMaxMinute || this._iMinMinute === this._iMaxMinute)) {
				this._setValueState(ValueState.Error);
			} else {
				this._setValueState(ValueState.None);
			}
		};

		/**
		 * Sets value state type
		 * @param {string} sType Value state type
		 * @private
		 */
		UI5InputTime.prototype._setValueState = function (sType) {
			this._timeInputElement.valueState = sType;
		};

		/**
		 * Sets value state message
		 * @param {string} sMessage Value state message
		 * @private
		 */
		UI5InputTime.prototype._setValueStateMessage = function (sMessage) {
			// The web components doesn't support it yet
			// There is feature request, so it should be available soon
			this._timeInputElement.valueStateMessage = sMessage;
		};

		/**
		 * Checks if the given time value is valid
		 * @param {string} sValue Value to mecheckssage
		 * @private
		 */
		UI5InputTime.prototype._isValidTime = function (sValue) {
			var oTimeInstance = DateFormat.getTimeInstance({pattern: sTimePattern});

			return sValue && oTimeInstance.parse(sValue);
		};

		return UI5InputTime;
	});