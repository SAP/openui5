/*!
 * ${copyright}
 */

sap.ui.define([
	"./InputBase",
	"./Input",
	"./NumericInputRenderer",
	"./library",
	"sap/ui/core/format/NumberFormat",
	"sap/ui/Device",
	"sap/ui/events/KeyCodes",
	"sap/ui/dom/jquery/cursorPos"],
function(
	InputBase,
	Input,
	NumericInputRenderer,
	library,
	NumberFormat,
	Device,
	KeyCodes) {
	"use strict";

	var InputType = library.InputType;

	/**
	 * Constructor for a new <code>sap.m.NumericInput</code>.
	 * Only used inside a StepInput control.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * The <code>sap.m.NumericInput</code> control provides functionality for a editing numbers.
	 *
	 * @extends sap.m.Input
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.97.0
	 * @alias sap.m.NumericInput
	 */
	var NumericInput = Input.extend("sap.m.NumericInput", {
		metadata: {
			library: "sap.m"
		},
		renderer: NumericInputRenderer
	});

	NumericInput.prototype.onBeforeRendering = function() {
		InputBase.prototype.onBeforeRendering.call(this);

		// The Input is handling its width in its onBeforeRendering method - if noting is set, the width is 100%.
		// As the NumericInput is using the InputBase's onBeforeRendering method, the width must be handled here too.
		// The real width of the StepInput is handled from its width property, so the NumericInput's width should be 100%.
		this.setWidth("100%");

		this._deregisterEvents();
	};

	NumericInput.prototype.setValue = function(sValue) {
		Input.prototype.setValue.apply(this, arguments);

		if (this.getDomRef()) {
			this.getDomRef("inner").setAttribute("aria-valuenow", sValue);
		}

		return this;
	};

	NumericInput.prototype.setType = function(sType) {
		return Input.prototype.setType.call(this, InputType.Number);
	};

	NumericInput.prototype.onkeydown = function(oEvent) {
		var sTypedValue,
			iCursorPos,
			fParsedValue;

		Input.prototype.onkeydown.apply(this, arguments);

		if (!Device.system.desktop
			|| oEvent.ctrlKey
			|| oEvent.metaKey
			|| (oEvent.originalEvent.key && oEvent.originalEvent.key.length !== 1)) {
			return;
		}

		iCursorPos = this._$input.cursorPos();

		// a special key that is meant to be a decimal separator, always
		// so replace in the input if needed
		if (oEvent.which === KeyCodes.NUMPAD_COMMA) {
			oEvent.preventDefault();

			sTypedValue = this.getValue().substring(0, iCursorPos) + this._getNumberFormat().oFormatOptions.decimalSeparator + this.getValue().substring(iCursorPos);
			fParsedValue = this._getNumberFormat().parse(sTypedValue);
			if (fParsedValue || fParsedValue === 0) {
				this.setDOMValue(sTypedValue);
			}

			return;
		}

		sTypedValue = this.getValue().substring(0, iCursorPos) + oEvent.originalEvent.key + this.getValue().substring(iCursorPos);
		fParsedValue = this._getNumberFormat().parse(sTypedValue);
		if (!isKeyAllowed(oEvent.which) || (!fParsedValue && fParsedValue !== 0)) {
			oEvent.preventDefault();
		}
	};

	var aNotAllowedKeyCodeRanges = [
		[KeyCodes.A, KeyCodes.Z],
		[KeyCodes.OPEN_BRACKET, KeyCodes.OPEN_BRACKET],
		[KeyCodes.PIPE, KeyCodes.SEMICOLON],
		[KeyCodes.GREAT_ACCENT, KeyCodes.BACKSLASH]
	];

	function isKeyAllowed(iKeyCode) {
		return Object.values(KeyCodes).includes(iKeyCode) && !aNotAllowedKeyCodeRanges.some(function(aRange) {
			return iKeyCode >= aRange[0] && iKeyCode <= aRange[1];
		});
	}

	NumericInput.prototype._getNumberFormat = function() {
		if (!this._oNumberFormat) {
			this._oNumberFormat = NumberFormat.getFloatInstance();
		}

		return this._oNumberFormat;
	};

	return NumericInput;
});