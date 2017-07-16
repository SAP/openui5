/*!
 * ${copyright}
 */

// Provides control sap.m.MaskInput.
sap.ui.define(['jquery.sap.global', './InputBase', './MaskInputRule', 'sap/ui/core/Control'], function (jQuery, InputBase, MaskInputRule, Control) {
	"use strict";


	/**
	 * Constructor for a new MaskInput.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * The <code>sap.m.MaskInput</code> control allows users to easily enter data in a certain format and in a fixed-width input
	 * (for example: date, time, phone number, credit card number, currency, IP address, MAC address, and others).
	 *
	 * @author SAP SE
	 * @extends sap.m.InputBase
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.34.0
	 * @alias sap.m.MaskInput
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var MaskInput = InputBase.extend("sap.m.MaskInput", /** @lends sap.m.MaskInput.prototype */ {
		metadata: {
			library: "sap.m",
			properties: {

				/**
				 * Defines a placeholder symbol. Shown at the position where there is no user input yet.
				 */
				placeholderSymbol: {type: "string", group: "Misc", defaultValue: "_"},

				/**
				 * Mask defined by its characters type (respectively, by its length).
				 * You should consider the following important facts:
				 * 1. The mask characters normally correspond to an existing rule (one rule per unique char).
				 * Characters which don't, are considered immutable characters (for example, the mask '2099', where '9' corresponds to a rule
				 * for digits, has the characters '2' and '0' as immutable).
				 * 2. Adding a rule corresponding to the <code>placeholderSymbol</code> is not recommended and would lead to an unpredictable behavior.
				 * 3. You can use the special escape character '^' called "Caret" prepending a rule character to make it immutable.
				 * Use the double escape '^^' if you want to make use of the escape character as an immutable one.
				 */
				mask: {type: "string", group: "Misc", defaultValue: null}
			},
			aggregations: {

				/**
				 A list of validation rules (one rule per mask character).
				 */
				rules: {type: "sap.m.MaskInputRule", multiple: true, singularName: "rule"}
			}
		}
	});

	var ESCAPE_CHARACTER = '^';

	/**
	 * Initializes the control.
	 */
	MaskInput.prototype.init = function () {
		// After decoupling of ValueState from the InputBase, the InputBase creates the ValueStateMessage on init (see change #1755336)
		InputBase.prototype.init.call(this);
		// Stores the caret timeout id for further manipulation (e.g Canceling the timeout)
		this._iCaretTimeoutId = null;
		// Stores the first placeholder replaceable position where the user can enter a value (immutable characters are ignored)
		this._iUserInputStartPosition = null;
		// Stores the length of the mask
		this._iMaskLength = null;
		// The last input(dom) value of the MaskInput (includes input characters , placeholders and immutable characters)
		this._sOldInputValue = null;
		// Rules with regular expression tests corresponding to each character
		this._oRules = null;
		// char array for keeping the input value with the applied mask
		this._oTempValue = null;
		// Skips setup of mask variables on every iteration when initializing default rules
		this._bSkipSetupMaskVariables = null;

		this._setDefaultRules();
	};

	/**
	 * Called when the control is destroyed.
	 */
	MaskInput.prototype.exit = function () {
		this._iCaretTimeoutId = null;
		this._iUserInputStartPosition = null;
		this._iMaskLength = null;
		this._sOldInputValue = null;
		this._oRules = null;
		this._oTempValue = null;
		this._bSkipSetupMaskVariables = null;
	};

	/**
	 * Handles the internal event <code>onBeforeRendering</code>.
	 */
	MaskInput.prototype.onBeforeRendering = function () {
		/*Check if all properties and rules are valid (although current setters validates the input,
		 because not everything is verified - i.e. modifying an existing rule is not verified in the context of all rules*/
		var sValidationErrorMsg = this._validateDependencies();

		if (sValidationErrorMsg) {
			jQuery.sap.log.warning("Invalid mask input: " + sValidationErrorMsg);
		}
		InputBase.prototype.onBeforeRendering.apply(this, arguments);
	};

	/**
	 * Handles the internal event <code>onAfterRendering</code>.
	 */
	MaskInput.prototype.onAfterRendering = function () {
		InputBase.prototype.onAfterRendering.apply(this, arguments);
	};

	/**
	 * Handles <code>focusin</code> event.
	 * @param {object} oEvent The jQuery event
	 */
	MaskInput.prototype.onfocusin = function (oEvent) {
		this._sOldInputValue = this._getInputValue();
		InputBase.prototype.onfocusin.apply(this, arguments);

		// if input does not differ from original (i.e. empty mask) OR differs from original but has invalid characters
		if (!this._oTempValue.differsFromOriginal() || !this._isValidInput(this._sOldInputValue)) {
			this._applyMask();
		}

		this._positionCaret(true);
	};

	/**
	 * Handles <code>focusout</code> event.
	 * @param {object} oEvent The jQuery event
	 */
	MaskInput.prototype.onfocusout = function (oEvent) {
		//The focusout should not be passed down to the InputBase as it will always generate onChange event.
		//For the sake of MaskInput, change event is decided inside _inputCompletedHandler, the reset of the InputBase.onfocusout
		//follows
		this.bFocusoutDueRendering = this.bRenderingPhase;
		this.$().toggleClass("sapMFocus", false);
		// remove touch handler from document for mobile devices
		jQuery(document).off('.sapMIBtouchstart');

		// Since the DOM is replaced during the rendering, an <code>onfocusout</code> event is fired and possibly the
		// focus is set on the document, hence you can ignore this event during the rendering.
		if (this.bRenderingPhase) {
			return;
		}

		//close value state message popup when focus is outside the input
		this.closeValueStateMessage();
		this._inputCompletedHandler();
	};

	/**
	 * Handles <code>onInput</code> event.
	 * @param {object} oEvent The jQuery event
	 */
	MaskInput.prototype.oninput = function (oEvent) {
		InputBase.prototype.oninput.apply(this, arguments);
		this._applyMask();
		this._positionCaret(false);
	};

	/**
	 * Handles <code>keyPress</code> event.
	 * @param {object} oEvent The jQuery event
	 */
	MaskInput.prototype.onkeypress = function (oEvent) {
		this._keyPressHandler(oEvent);
	};

	/**
	 * Handles <code>keyDown</code> event.
	 * @param {object} oEvent The jQuery event
	 */
	MaskInput.prototype.onkeydown = function (oEvent) {
		var oKey = this._parseKeyBoardEvent(oEvent),
			mBrowser = sap.ui.Device.browser,
			bIE9AndBackspaceDeleteScenario;

		/* When user types character, the flow of triggered events is keydown -> keypress -> input. The MaskInput
		 handles user input in keydown (for special keys like Delete and Backspace) or in keypress - for any other user
		 input and suppresses the input events. This is not true for IE9, where the input event is fired, because of
		 the underlying InputBase takes control and fires it (see {@link sap.m.InputBase#onkeydown})
		 */
		bIE9AndBackspaceDeleteScenario = (oKey.bBackspace || oKey.bDelete) && mBrowser.msie && mBrowser.version < 10;

		if (!bIE9AndBackspaceDeleteScenario) {
			InputBase.prototype.onkeydown.apply(this, arguments);
		}
		this._keyDownHandler(oEvent, oKey);
	};

	/**
	 * Handles [Enter] key.
	 * <b>Note:</b> If subclasses override this method, keep in mind that [Enter] is not really handled here, but in {@link sap.m.MaskInput.prototype#onkeydown}.
	 * @param {jQuery.Event} oEvent The event object
	 */
	MaskInput.prototype.onsapenter = function(oEvent) {
		//Nothing to do, [Enter] is already handled in onkeydown part.
	};

	/**
	 * Handles the <code>sapfocusleave</code> event of the MaskInput.
	 <b>Note:</b> If subclasses override this method, keep in mind that the <code>sapfocusleave</code> event is handled by {@link sap.m.MaskInput.prototype#onfocusout}.
	 * @param {jQuery.Event} oEvent The event object
	 * @private
	 */
	MaskInput.prototype.onsapfocusleave = function(oEvent) {
	};

	/**
	 * Setter for property <code>value</code>.
	 *
	 * @param {string} sValue New value for property <code>value</code>.
	 * @return {sap.m.MaskInput} <code>this</code> to allow method chaining.
	 * @public
	 */
	MaskInput.prototype.setValue = function (sValue) {
		sValue = this.validateProperty('value', sValue);
		InputBase.prototype.setValue.call(this, sValue);
		this._sOldInputValue = sValue;
		// We need this check in case when MaskInput is initialized with specific value
		if (!this._oTempValue) {
			this._setupMaskVariables();
		}
		// We don't need to validate the initial MaskInput placeholder value because this will break setting it to empty value on focusout
		if (this._oTempValue._aInitial.join('') !== sValue) {// sValue is never null/undefined here
			this._applyRules(sValue);
		}

		return this;
	};

	MaskInput.prototype.addAggregation = function (sAggregationName, oObject, bSuppressInvalidate) {
		if (sAggregationName === "rules") {
			if (!this._validateRegexAgainstPlaceHolderSymbol(oObject)) {
				return this;
			}
			// ensure there is no more than a single rule with the same mask format symbol
			this._removeRuleWithSymbol(oObject.getMaskFormatSymbol());
			Control.prototype.addAggregation.apply(this, arguments);
			if (!this._bSkipSetupMaskVariables) {
				this._setupMaskVariables();
			}
			return this;
		}
		return Control.prototype.addAggregation.apply(this, arguments);
	};

	MaskInput.prototype.insertAggregation = function (sAggregationName, oObject, iIndex, bSuppressInvalidate) {
		if (sAggregationName === "rules") {
			if (!this._validateRegexAgainstPlaceHolderSymbol(oObject)) {
				return this;
			}

			// ensure there is no more than a single rule with the same mask format symbol
			this._removeRuleWithSymbol(oObject.getMaskFormatSymbol());
			Control.prototype.insertAggregation.apply(this, arguments);
			this._setupMaskVariables();

			return this;
		}
		return Control.prototype.insertAggregation.apply(this, arguments);
	};

	/**
	 * Validates that the rule does not include the currently set placeholder symbol as allowed mask character.
	 * @param {object} oRule List of regular expressions per mask symbol
	 * @returns {boolean} True if the rule is valid, false otherwise
	 * @private
	 */
	MaskInput.prototype._validateRegexAgainstPlaceHolderSymbol = function (oRule) {
		if (new RegExp(oRule.getRegex()).test(this.getPlaceholderSymbol())) {
			jQuery.sap.log.error("Rejecting input mask rule because it includes the currently set placeholder symbol.");
			return false;
		}
		return true;
	};

	/**
	 * Overrides the method in order to validate the placeholder symbol.
	 * @param {String} sSymbol The placeholder symbol
	 * @override
	 * @returns {sap.ui.base.MaskInput} <code>this</code> pointer for chaining
	 */
	MaskInput.prototype.setPlaceholderSymbol = function (sSymbol) {
		var bSymbolFound;

		// make sure the placeholder symbol is always a single regex supported character
		if (!/^.$/i.test(sSymbol)) {
			jQuery.sap.log.error("Invalid placeholder symbol string given");
			return this;
		}

		// make sure the placeholder symbol given is not part of any of the existing rules
		// as regex
		bSymbolFound = this.getRules().some(function(oRule){
			return new RegExp(oRule.getRegex()).test(sSymbol);
		});

		if (bSymbolFound) {
			jQuery.sap.log.error("Rejecting placeholder symbol because it is included as a regex in an existing mask input rule.");
		} else {
			this.setProperty("placeholderSymbol", sSymbol);
			this._setupMaskVariables();
		}
		return this;
	};

	/**
	 * Sets the mask for this instance.
	 * The mask is mandatory.
	 * @param {String} sMask The mask
	 * @returns {sap.m.MaskInput} <code>this</code> pointer for chaining
	 * @throws {Error} Throws an error if the input is invalid
	 */
	MaskInput.prototype.setMask = function (sMask) {
		if (!sMask) {
			var sErrorMsg = "Setting an empty mask is pointless. Make sure you set it with a non-empty value.";
			jQuery.sap.log.warning(sErrorMsg);
			return this;
		}
		this.setProperty("mask", sMask, true);
		this._setupMaskVariables();
		return this;
	};

	/**
	 * Verifies whether a character at a given position is allowed according to its mask rule.
	 * @param {String} sChar The character
	 * @param {int} iIndex The position of the character
	 * @protected
	 */
	MaskInput.prototype._isCharAllowed = function (sChar, iIndex) {
		return this._oRules.applyCharAt(sChar, iIndex);
	};

	/**
	 * Gets a replacement string for the character being placed in the input.
	 * Subclasses may override this method in order to get some additional behavior. For instance, switching current input
	 * character with other for time input purposes. As an example, if the user enters "2" (in 12-hour format), the consumer may use
	 * this method to replace the input from "2" to "02".
	 * @param {String} sChar The current character from the input
	 * @param {int} iPlacePosition The position the character should occupy
	 * @param {string} sCurrentInputValue The value currently inside the input field (may differ from the property value)
	 * @returns {String} A string that replaces the character
	 * @protected
	 */
	MaskInput.prototype._feedReplaceChar = function (sChar, iPlacePosition, sCurrentInputValue) {
		return sChar;
	};

	/********************************************************************************************
	 ****************************** Private methods and classes *********************************
	 ********************************************************************************************/

	/**
	 * Encapsulates the work with a char array.
	 * @param {Array} aContent The char array
	 * @constructor
	 * @private
	 */
	var CharArray = function (aContent) {
		// Initial content
		this._aInitial = aContent.slice(0);
		//The real content
		this._aContent = aContent;
	};

	CharArray.prototype.setCharAt = function (sChar, iPosition) {
		this._aContent[iPosition] = sChar;
	};

	CharArray.prototype.charAt = function (iPosition) {
		return this._aContent[iPosition];
	};

	/**
	 * Converts the char array to a string representation.
	 * @returns {String} The char array converted to a string
	 * @private
	 */
	CharArray.prototype.toString = function () {
		return this._aContent.join('');
	};

	/**
	 * Checks whether the char array content differs from its original content.
	 * @returns {boolean} True if different content, false otherwise
	 * @private
	 */
	CharArray.prototype.differsFromOriginal = function () {
		return this.differsFrom(this._aInitial);
	};

	/**
	 * Checks whether the char array content differs from given string.
	 * @param {string | array} vValue The value to compare the char array with
	 * @returns {boolean} True if different content, false otherwise.
	 * @private
	 */
	CharArray.prototype.differsFrom = function (vValue) {
		var i = 0;
		if (vValue.length !== this._aContent.length) {
			return true;
		}
		for (; i < vValue.length; i++) {
			if (vValue[i] !== this._aContent[i]) {
				return true;
			}
		}
		return false;
	};

	/**
	 * Gets the size of the char array.
	 * @returns {int} Number of items in the char array
	 * @private
	 */
	CharArray.prototype.getSize = function () {
		return this._aContent.length;
	};

	/**
	 * Encapsulates the work with test rules.
	 * @param aRules The test rules
	 * @constructor
	 * @private
	 */
	var TestRules = function (aRules) {
		this._aRules = aRules;
	};

	/**
	 * Finds the next testable position in the <code>MaskInput</code>.
	 * @param {int} iCurrentPos The position next to which seeking starts (if skipped, "-1" will be assumed)
	 * @returns {int} The found position.
	 * @private
	 */
	TestRules.prototype.nextTo = function (iCurrentPos) {
		if (typeof iCurrentPos === "undefined") {
			iCurrentPos = -1; // this will make sure the 0 rule is also included in the search
		}
		do {
			iCurrentPos++;
		} while (iCurrentPos < this._aRules.length && !this._aRules[iCurrentPos]);
		return iCurrentPos;
	};

	/**
	 * Finds the previous testable position in the <code>MaskInput</code>.
	 * @param {int} iCurrentPos The position before which seeking starts
	 * @returns {int} The found position
	 * @private
	 */
	TestRules.prototype.previousTo = function (iCurrentPos) {
		do {
			iCurrentPos--;
		} while (!this._aRules[iCurrentPos] && iCurrentPos > 0);
		return iCurrentPos;
	};

	/**
	 * Checks whether there is a rule at the specified index.
	 * @param {int} iIndex The index of the rule
	 * @returns {boolean} True, if there is a rule at the specified index, false otherwise
	 * @private
	 */
	TestRules.prototype.hasRuleAt = function (iIndex) {
		return !!this._aRules[iIndex];
	};

	/**
	 * Applies a rule to a character.
	 * @param {String} sChar The character to which the rule will be applied
	 * @param {int} iIndex The index of the rule
	 * @returns {boolean} True if the character passes the validation rule, false otherwise.
	 * @private
	 */
	TestRules.prototype.applyCharAt = function (sChar, iIndex) {
		return this._aRules[iIndex].test(sChar);
	};

	/**
	 * Sets up default mask rules.
	 * @private
	 */
	MaskInput.prototype._setDefaultRules = function () {
		this._bSkipSetupMaskVariables = true;
		this.addRule(new sap.m.MaskInputRule({
			maskFormatSymbol: "a",
			regex: "[A-Za-z]"
		}), true);
		this.addRule(new sap.m.MaskInputRule({
			maskFormatSymbol: "9",
			regex: "[0-9]"
		}), true);
		this._bSkipSetupMaskVariables = false;
	};

	/**
	 * Checks if the dependent properties and aggregations are valid.
	 * @returns {string | null} The errors if any, or false value if no errors
	 * @private
	 */
	MaskInput.prototype._validateDependencies = function () {
		var sPlaceholderSymbol = this.getPlaceholderSymbol(),
			aRules = this.getRules(),
			aMaskFormatSymbols = [],
			aErrMessages = [];

		if (!this.getMask()) {
			aErrMessages.push("Empty mask");
		}
		// Check if rules are valid (not duplicated and different from the placeholderSymbol)
		if (aRules.length) {
			aMaskFormatSymbols = [];
			aRules.every(function (oRule) {
				var sMaskFormatSymbol = oRule.getMaskFormatSymbol(),
					bCurrentDiffersFromPlaceholder = sMaskFormatSymbol !== sPlaceholderSymbol,
					bCurrentDiffersFromOthers;

				bCurrentDiffersFromOthers = !aMaskFormatSymbols.some(function (sSymbol) {
					return sMaskFormatSymbol === sSymbol;
				});
				aMaskFormatSymbols.push(sMaskFormatSymbol);

				if (!bCurrentDiffersFromPlaceholder) {
					aErrMessages.push("Placeholder symbol is the  same as the existing rule's mask format symbol");
				}
				if (!bCurrentDiffersFromOthers) {
					aErrMessages.push("Duplicated rule's maskFormatSymbol [" + sMaskFormatSymbol + "]");
				}

				return bCurrentDiffersFromPlaceholder && bCurrentDiffersFromOthers;
			});
		}

		return aErrMessages.length ? aErrMessages.join(". ") : null;
	};

	/**
	 * Removes any existing rules with a specific mask symbol.
	 * @param {string} sSymbol The symbol of <code>MaskInputRule</code> which will be removed
	 * @private
	 */
	MaskInput.prototype._removeRuleWithSymbol = function (sSymbol) {
		var oSearchRuleResult = this._findRuleBySymbol(sSymbol, this.getRules());
		if (oSearchRuleResult) {
			this.removeAggregation('rules', oSearchRuleResult.oRule);
			oSearchRuleResult.oRule.destroy();
		}
	};

	/**
	 * Searches for a particular <code>MaskInputRule</code> by a given symbol.
	 * @param {string} sMaskRuleSymbol The rule symbol to search for
	 * @param {array} aRules A collection of rules to search within
	 * @returns {null|object} Two key results (for example, { oRule: {MaskInputRule} The found rule, iIndex: {int} the index of it })
	 * @private
	 */
	MaskInput.prototype._findRuleBySymbol = function (sMaskRuleSymbol, aRules) {
		var oResult = null;

		if (typeof sMaskRuleSymbol !== "string" || sMaskRuleSymbol.length !== 1) {
			jQuery.sap.log.error(sMaskRuleSymbol + " is not a valid mask rule symbol");
			return null;
		}

		jQuery.each(aRules, function (iIndex, oRule) {
			if (oRule.getMaskFormatSymbol() === sMaskRuleSymbol) {
				oResult = {
					oRule: oRule,
					iIndex: iIndex
				};
				return false;
			}
		});

		return oResult;
	};

	/**
	 * Gets the position range of the selected text.
	 * @returns {object} An object that contains the start and end positions of the selected text (zero based)
	 * @private
	 */
	MaskInput.prototype._getTextSelection = function () {
		var _$Input = jQuery(this.getFocusDomRef());

		if (!_$Input && (_$Input.length === 0 || _$Input.is(":hidden"))) {
			return;
		}

		return {
			iFrom: _$Input[0].selectionStart,
			iTo: _$Input[0].selectionEnd,
			bHasSelection: (_$Input[0].selectionEnd - _$Input[0].selectionStart !== 0)
		};
	};

	/**
	 * Places the cursor on a given position (zero based).
	 * @param {int} iPos The position the cursor to be placed on
	 * @private
	 */
	MaskInput.prototype._setCursorPosition = function (iPos) {
		if (sap.ui.Device.browser.webkit && iPos < 0) {
			/* For webkit browsers version >=58.0, negative value position the carret at the end of the string.
			/* In previous versions the outcome was the same as if position is 0 => at the beginning of the string.
			 */
			iPos = 0;
		}
		return jQuery(this.getFocusDomRef()).cursorPos(iPos);
	};

	/**
	 * Gets the current position of the cursor.
	 * @returns {int} The current cursor position (zero based).
	 * @private
	 */
	MaskInput.prototype._getCursorPosition = function () {
		return jQuery(this.getFocusDomRef()).cursorPos();
	};

	/**
	 * Sets up the mask.
	 * @private
	 */
	MaskInput.prototype._setupMaskVariables = function () {
		var aRules = this.getRules(),
			sMask = this.getMask(),
			aSkipIndexes = this._getSkipIndexes(sMask), // Used to collect indexes which should be skipped when building validation rules
			aMask = this._getMaskArray(sMask, aSkipIndexes),
			sPlaceholderSymbol = this.getPlaceholderSymbol(),
			aInitial = this._buildMaskValueArray(aMask, sPlaceholderSymbol, aRules, aSkipIndexes),
			aTestRules = this._buildRules(aMask, aRules, aSkipIndexes);

		this._oTempValue = new CharArray(aInitial);
		this._iMaskLength = aTestRules.length;
		this._oRules = new TestRules(aTestRules);
		this._iUserInputStartPosition = this._oRules.nextTo();
	};

	/**
	 * Converts mask value string to array and skips the escape characters.
	 * @since 1.38
	 * @private
	 * @param {string} sMask Mask value
	 * @param {Array} aSkipIndexes List of character indexes to skip
	 * @returns {Array}
	 */
	MaskInput.prototype._getMaskArray = function (sMask, aSkipIndexes) {
		var iLength = Array.isArray(aSkipIndexes) ? aSkipIndexes.length : 0,
			aMaskArray = (sMask) ? sMask.split("") : [],
			i;

		for (i = 0; i < iLength; i++) {
			aMaskArray.splice(aSkipIndexes[i], 1);
		}
		return aMaskArray;
	};

	/**
	 * Creates an array of indexes for all the characters that are escaped.
	 * @since 1.38
	 * @private
	 * @param {string} sMask Mask value
	 * @returns {Array}
	 */
	MaskInput.prototype._getSkipIndexes = function (sMask) {
		var iLength = (sMask) ? sMask.length : 0,
			i,
			aSkipIndexes = [],
			iPosCorrection = 0,
			bLastCharEscape = false; // Keeps if the last character iterated was an escape character

		for (i = 0; i < iLength; i++) {
			if (sMask[i] === ESCAPE_CHARACTER && !bLastCharEscape) {
				aSkipIndexes.push(i - iPosCorrection);
				// Escape the escape character
				bLastCharEscape = true;
				// Correction for multiple escape characters
				iPosCorrection++;
			} else {
				bLastCharEscape = false;
			}
		}
		return aSkipIndexes;
	};

	/**
	 * Applies the mask functionality to the input.
	 * @private
	 */
	MaskInput.prototype._applyMask = function () {
		var sMaskInputValue = this._getInputValue();

		if (!this.getEditable()) {
			return;
		}
		this._applyAndUpdate(sMaskInputValue);
	};

	/**
	 * Resets the temp value with a given range.
	 * @param {int} iFrom The starting position to start clearing (optional, zero based, default 0)
	 * @param {int} iTo The ending position to finish clearing (optional, zero based, defaults to last char array index)
	 * @private
	 */
	MaskInput.prototype._resetTempValue = function (iFrom, iTo) {
		var iIndex,
			sPlaceholderSymbol = this.getPlaceholderSymbol();

		if (typeof iFrom === "undefined" || iFrom === null) {
			iFrom = 0;
			iTo = this._oTempValue.getSize() - 1;
		}

		for (iIndex = iFrom; iIndex <= iTo; iIndex++) {
			if (this._oRules.hasRuleAt(iIndex)) {
				this._oTempValue.setCharAt(sPlaceholderSymbol, iIndex);
			}
		}
	};

	/**
	 * Applies rules and updates the DOM input value.
	 * @param {String} sMaskInputValue The input string to which the rules will be applied
	 * @private
	 */
	MaskInput.prototype._applyAndUpdate = function (sMaskInputValue) {
		this._applyRules(sMaskInputValue);
		this.updateDomValue(this._oTempValue.toString());
	};

	/**
	 * Finds the first placeholder symbol position.
	 * @returns {int} The first placeholder symbol position or -1 if none
	 * @private
	 */
	MaskInput.prototype._findFirstPlaceholderPosition = function () {
		return this._oTempValue.toString().indexOf(this.getPlaceholderSymbol());
	};

	/**
	 * Applies the rules to the given input string and updates char array with the result.
	 * @param {string} sInput The input string to which the rules will be applied
	 * @private
	 */
	MaskInput.prototype._applyRules = function (sInput) {
		var sCharacter,
			iInputIndex = 0,
			iMaskIndex,
			sPlaceholderSymbol = this.getPlaceholderSymbol(),
			bCharMatched;

		for (iMaskIndex = 0; iMaskIndex < this._iMaskLength; iMaskIndex++) {
			if (this._oRules.hasRuleAt(iMaskIndex)) {
				this._oTempValue.setCharAt(sPlaceholderSymbol, iMaskIndex);
				bCharMatched = false;

				if (sInput.length) {
					do {
						sCharacter = sInput.charAt(iInputIndex);
						iInputIndex++;
						if (this._oRules.applyCharAt(sCharacter, iMaskIndex)) {
							this._oTempValue.setCharAt(sCharacter, iMaskIndex);
							bCharMatched = true;
						}
					} while (!bCharMatched && (iInputIndex < sInput.length));
				}

				// the input string is over ->reset the rest of the char array to the end
				if (!bCharMatched) {
					this._resetTempValue(iMaskIndex + 1, this._iMaskLength - 1);
					break;
				}
			} else {
				if (this._oTempValue.charAt(iMaskIndex) === sInput.charAt(iInputIndex)) {
					iInputIndex++;
				}
			}
		}
	};

	/**
	 * Handles <code>onKeyPress</code> event.
	 * @param {jQuery.Event} oEvent The jQuery event object
	 * @private
	 */
	MaskInput.prototype._keyPressHandler = function (oEvent) {
		if (!this.getEditable()) {
			return;
		}

		var oSelection = this._getTextSelection(),
			iPosition,
			sCharReplacement,
			oKey = this._parseKeyBoardEvent(oEvent);

		if (oKey.bCtrlKey || oKey.bAltKey || oKey.bMetaKey || oKey.bBeforeSpace) {
			return;
		}

		if (!oKey.bEnter && !oKey.bShiftLeftOrRightArrow && !oKey.bHome && !oKey.bEnd &&
			!(oKey.bShift && oKey.bDelete) &&
			!(oKey.bCtrlKey && oKey.bInsert) &&
			!(oKey.bShift && oKey.bInsert)) {
			if (oSelection.bHasSelection) {
				this._resetTempValue(oSelection.iFrom, oSelection.iTo - 1);
				this.updateDomValue(this._oTempValue.toString());
				this._setCursorPosition(Math.max(this._iUserInputStartPosition, oSelection.iFrom));
			}
			iPosition = this._oRules.nextTo(oSelection.iFrom - 1);

			if (iPosition < this._iMaskLength) {
				sCharReplacement = this._feedReplaceChar(oKey.sChar, iPosition, this._getInputValue());
				this._feedNextString(sCharReplacement, iPosition);
			}
			oEvent.preventDefault();
		}
	};

	/**
	 * Handle cut event.
	 *
	 * @param {jQuery.Event} oEvent The event object.
	 * @private
	 */
	MaskInput.prototype.oncut = function(oEvent) {
		var oSelection = this._getTextSelection(),
			iMinBrowserDelay = this._getMinBrowserDelay(),
			iBegin = oSelection.iFrom,
			iEnd = oSelection.iTo;

		InputBase.prototype.oncut(oEvent);

		if (!oSelection.bHasSelection) {
			return;
		}

		iEnd = iEnd - 1;
		this._resetTempValue(iBegin, iEnd);

		//oncut happens before the input event fires (before oninput)
		//we want to use the values from this point of time
		//but set them after the input event is handled (after oninput)

		// give a chance the normal browser cut and oninput handler to finish its work with the current selection,
		// before messing up the dom value (updateDomValue) or the selection (by setting a new cursor position)
		jQuery.sap.delayedCall(iMinBrowserDelay, this,
			function updateDomAndCursor(sValue, iPos, aOldTempValueContent) {
				//update the temp value back
				//because oninput breaks it
				this._oTempValue._aContent = aOldTempValueContent;
				this.updateDomValue(sValue);

				//we want that shortly after updateDomValue
				//but _positionCaret sets the cursor, also with a delayedCall
				//so we must put our update in the queue
				jQuery.sap.delayedCall(iMinBrowserDelay, this, this._setCursorPosition, [iPos]);
			},
			[
				this._oTempValue.toString(),
				Math.max(this._iUserInputStartPosition, iBegin),
				this._oTempValue._aContent.slice(0)
			]
		);
	};

	/**
	 * Handles <code>onKeyDown</code> event.
	 * @param {jQuery.Event} oEvent The jQuery event object
	 * @private
	 */
	MaskInput.prototype._keyDownHandler = function (oEvent, oKey) {
		var sDirection,
			oSelection,
			iCursorPos,
			iNextCursorPos,
			oKey = oKey || this._parseKeyBoardEvent(oEvent);

		if (!this.getEditable()) {
			return;
		}

		if (!oKey.bShift && (oKey.bArrowRight || oKey.bArrowLeft)) {
			iCursorPos = this._getCursorPosition();
			oSelection = this._getTextSelection();


			// Determine the correct direction based on RTL mode, input characters and selection state
			sDirection = this._determineArrowKeyDirection(oKey, oSelection);

			if (this._isRtlMode() && oSelection.bHasSelection) {
				iNextCursorPos = this._determineRtlCaretPositionFromSelection(sDirection);
			} else {
				// Determine the next position based on mask validation rules only
				iNextCursorPos = this._oRules[sDirection](iCursorPos);
			}

			// chrome needs special treatment, because of a browser bug with switched first and last position
			if (this._isWebkitProblematicCase()) {
				iNextCursorPos = this._fixWebkitBorderPositions(iNextCursorPos, sDirection);
			}

			this._setCursorPosition(iNextCursorPos);
			oEvent.preventDefault();

		} else if (oKey.bEscape) {
			this._applyAndUpdate(this._sOldInputValue);
			this._positionCaret(true);
			oEvent.preventDefault();

		} else if (oKey.bEnter) {
			this._inputCompletedHandler(oEvent);

		} else if ((oKey.bCtrlKey && oKey.bInsert) ||
			(oKey.bShift && oKey.bInsert)) {
			InputBase.prototype.onkeydown.apply(this, arguments);
		} else if ((!oKey.bShift && oKey.bDelete) || oKey.bBackspace) {
			this._revertKey(oKey);
			oEvent.preventDefault();
		} else if (sap.ui.Device.browser.chrome && sap.ui.Device.os.android) {
/*
			 Needs a special handling for Chrome on Android, where keyrpess event is not firing.
			 If the digit "9" is pressed, when the caret is at the beginning (0),
			 when "SAP-" is the prefix, the order of events and its handling is the following:

Event	     Desktop/iPhone		                    Android:
-----------------------------------------------------------------------------------------------
keydown		 9 arrives, nothing is                 	9 arrives,
			 happening							    caret is moved to the
			 										first free pos for user input(4)

keypress	 9 arrived;								<does not trigger>
			 caret is moved to the
			 first free
			 for user input position(4);
			 9 is being applied at the
			 position 4,
			 which ends with the final
			 result "SAP-9"


oninput      <does not trigger>						the dom is "SAP9",
													since the caret has moved to 4,
													the call to this._applyMask() applies
													the "9" at position 4, which ends with
													the same final result "SAP-9"
*/
			this._setCursorPosition(Math.max(this._iUserInputStartPosition, this._getTextSelection().iFrom));
		}
	};

	/**
	 * Reverts the value, as if no key down.
	 * In case of backspace, just reverts to the previous temp value.
	 * @param {object} oKey All the info for a key in a keydown event
	 * @private
	 */
	MaskInput.prototype._revertKey = function(oKey) {
		var oSelection = this._getTextSelection(),
			iBegin = oSelection.iFrom,
			iEnd = oSelection.iTo;

		if (!oSelection.bHasSelection) {
			if (oKey.bBackspace) {
				iBegin = this._oRules.previousTo(iBegin);
			}
		}

		if (oKey.bBackspace || (oKey.bDelete && oSelection.bHasSelection)) {
			iEnd = iEnd - 1;
		}

		this._resetTempValue(iBegin, iEnd);
		this.updateDomValue(this._oTempValue.toString());
		this._setCursorPosition(Math.max(this._iUserInputStartPosition, iBegin));
	};

	/**
	 * @private
	 */
	MaskInput.prototype._feedNextString = function (sNextString, iPos) {
		var iNextPos,
			bAtLeastOneSuccessfulCharPlacement = false,
			aNextChars = sNextString.split(""),
			sNextChar;

		while (aNextChars.length) {
			sNextChar = aNextChars.splice(0, 1)[0]; //get and remove the first element
			if (this._oRules.applyCharAt(sNextChar, iPos)) {
				bAtLeastOneSuccessfulCharPlacement = true;

				this._oTempValue.setCharAt(sNextChar, iPos);
				iPos = this._oRules.nextTo(iPos);
			}
		}

		if (bAtLeastOneSuccessfulCharPlacement) {
			iNextPos = iPos; //because the cycle above already found the next pos
			this.updateDomValue(this._oTempValue.toString());
			this._setCursorPosition(iNextPos);
		}
	};

	/**
	 * Handles completed user input.
	 * @private
	 */
	MaskInput.prototype._inputCompletedHandler = function () {
		var sNewMaskInputValue = this._getInputValue(),
			bTempValueDiffersFromOriginal,
			sValue,
			bEmptyPreviousDomValue,
			bEmptyNewDomValue;

		if (this._oTempValue.differsFrom(sNewMaskInputValue)) {
			this._applyAndUpdate(sNewMaskInputValue);
		}

		bTempValueDiffersFromOriginal = this._oTempValue.differsFromOriginal();
		sValue = bTempValueDiffersFromOriginal ? this._oTempValue.toString() : "";
		bEmptyPreviousDomValue = !this._sOldInputValue;
		bEmptyNewDomValue = !sNewMaskInputValue;

		if (bEmptyPreviousDomValue && (bEmptyNewDomValue || !bTempValueDiffersFromOriginal)){
			this.updateDomValue("");
			return;
		}

		if (this._sOldInputValue !== this._oTempValue.toString()) {
			InputBase.prototype.setValue.call(this, sValue);
			this._sOldInputValue = sValue;
			if (this.onChange && !this.onChange({value: sValue})) {//if the subclass didn't fire the "change" event by itself
				this.fireChangeEvent(sValue);
			}
		}
	};

	/**
	 * @param {Array} aSkipIndexes @since 1.38 List of indexes to skip
	 * @private
	 */
	MaskInput.prototype._buildMaskValueArray = function (aMask, sPlaceholderSymbol, aRules, aSkipIndexes) {
		return aMask.map(function (sChar, iIndex) {
			var bNotSkip = aSkipIndexes.indexOf(iIndex) === -1,
				bRuleFound = this._findRuleBySymbol(sChar, aRules);
			return (bNotSkip && bRuleFound) ? sPlaceholderSymbol : sChar;
		}, this);
	};

	/**
	 * Builds the test rules according to the mask input rule's regex string.
	 * @param {Array} aSkipIndexes @since 1.38 List of indexes to skip
	 * @private
	 */
	MaskInput.prototype._buildRules = function (aMask, aRules, aSkipIndexes) {
		var aTestRules = [],
			oSearchResult,
			iLength = aMask.length,
			i = 0;

		for (; i < iLength; i++) {
			if (aSkipIndexes.indexOf(i) === -1) {
				oSearchResult = this._findRuleBySymbol(aMask[i], aRules);
				aTestRules.push(oSearchResult ? new RegExp(oSearchResult.oRule.getRegex()) : null);
			} else {
				aTestRules.push(null);
			}
		}
		return aTestRules;
	};

	/**
	 * Parses the keyboard events.
	 * @param {object} oEvent
	 * @private
	 * @returns {object} Summary object with information about the pressed keys, for example: {{iCode: (*|oEvent.keyCode), sChar: (string|*), bCtrlKey: boolean, bAltKey: boolean, bMetaKey: boolean,
	 * bShift: boolean, bBackspace: boolean, bDelete: boolean, bEscape: boolean, bEnter: boolean, bIphoneEscape: boolean,
	 * bArrowRight: boolean, bArrowLeft: boolean, bHome: boolean, bEnd: boolean, bShiftLeftOrRightArrow: boolean,
	 * bBeforeSpace: boolean}}
	 */
	MaskInput.prototype._parseKeyBoardEvent = function (oEvent) {
		var iPressedKey = oEvent.which || oEvent.keyCode,
			mKC = jQuery.sap.KeyCodes,
			bArrowRight = iPressedKey === mKC.ARROW_RIGHT,
			bArrowLeft = iPressedKey === mKC.ARROW_LEFT,
			bShift = oEvent.shiftKey;

		return {
			iCode: iPressedKey,
			sChar: String.fromCharCode(iPressedKey),
			bCtrlKey: oEvent.ctrlKey,
			bAltKey: oEvent.altKey,
			bMetaKey: oEvent.metaKey,
			bShift: bShift,
			bInsert: iPressedKey === jQuery.sap.KeyCodes.INSERT,
			bBackspace: iPressedKey === mKC.BACKSPACE,
			bDelete: iPressedKey === mKC.DELETE,
			bEscape: iPressedKey === mKC.ESCAPE,
			bEnter: iPressedKey === mKC.ENTER,
			bIphoneEscape: (sap.ui.Device.system.phone && sap.ui.Device.os.ios && iPressedKey === 127),
			bArrowRight: bArrowRight,
			bArrowLeft: bArrowLeft,
			bHome: iPressedKey === jQuery.sap.KeyCodes.HOME,
			bEnd:  iPressedKey === jQuery.sap.KeyCodes.END,
			bShiftLeftOrRightArrow: bShift && (bArrowLeft || bArrowRight),
			bBeforeSpace: iPressedKey < mKC.SPACE
		};
	};

	/**
	 * Positions the caret or selects the whole input.
	 * @param {boolean} bSelectAllIfInputIsCompleted If true, selects the whole input if it is fully completed,
	 * or otherwise, always moves the caret to the first placeholder position
	 * @private
	 */
	MaskInput.prototype._positionCaret = function (bSelectAllIfInputIsCompleted) {
		var sMask = this.getMask(),
			iMinBrowserDelay = this._getMinBrowserDelay(),
			iEndSelectionIndex;

		clearTimeout(this._iCaretTimeoutId);
		iEndSelectionIndex = this._findFirstPlaceholderPosition();
		if (iEndSelectionIndex < 0) {
			iEndSelectionIndex = sMask.length;
		}

		this._iCaretTimeoutId = jQuery.sap.delayedCall(iMinBrowserDelay, this, function () {
			if (this.getFocusDomRef() !== document.activeElement) {
				return;
			}
			if (bSelectAllIfInputIsCompleted && (iEndSelectionIndex === (sMask.length))) {
				this.selectText(0, iEndSelectionIndex);
			} else {
				this._setCursorPosition(iEndSelectionIndex);
			}
		});
	};

	/**
	 * Determines the browser specific minimal delay time for setTimeout.
	 *
	 * Todo: This logic is a good candidate to be implemented generally in jQuery.sap.delayedCall method.
	 *
	 * @private
	 */
	MaskInput.prototype._getMinBrowserDelay = function () {
		return !sap.ui.Device.browser.msie ? 4 : 50;
	};

	/**
	 * Determines if a given string contains characters that will not comply to the mask input rules.
	 *
	 * @private
	 * @param {string} sInput the input
	 * @returns {boolean} True if the whole <code>sInput</code> passes the validation, false otherwise.
	 */
	MaskInput.prototype._isValidInput = function (sInput) {
		var iLimit = sInput.length,
			i = 0,
			sChar;

		for (; i < iLimit; i++) {
			sChar = sInput[i];

			/* consider the input invalid if any character except the placeholder symbol does not comply to the mask
			 rules of the corresponding position or if in case there is no rule, if the character is not exactly the same
			 as the current mask character at that position (i.e. immutable characters) */
			if (this._oRules.hasRuleAt(i) && (!this._oRules.applyCharAt(sChar, i) && sChar !== this.getPlaceholderSymbol())) {
				return false;
			}

			if (!this._oRules.hasRuleAt(i) && sChar !== this._oTempValue.charAt(i)) {
				return false;
			}
		}

		return true;
	};


	/**
	 * Checks if a given character belongs to an RTL language
	 * @private
	 * @param sString
	 * @returns {boolean}
	 */
	MaskInput.prototype._isRtlChar = function (sString) {
		var ltrChars    = 'A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02B8\u0300-\u0590\u0800-\u1FFF' + '\u2C00-\uFB1C\uFDFE-\uFE6F\uFEFD-\uFFFF',
			rtlChars    = '\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC',
			rtlDirCheck = new RegExp('^[^' + ltrChars + ']*[' + rtlChars + ']');

		return rtlDirCheck.test(sString);
	};


	/**
	 * Fix an issue with Chrome where first and last positions are switched
	 * @private
	 * @param iCurrentPosition
	 * @param sDirection
	 * @returns {*}
	 */
	MaskInput.prototype._fixWebkitBorderPositions = function (iCurrentPosition, sDirection) {
		var iTempLength = this._oTempValue.toString().length;

		if (sDirection === 'nextTo') {

			if (iCurrentPosition === 0 || iCurrentPosition === iTempLength || iCurrentPosition === 1) {
				iCurrentPosition = 0;
			} else if (iCurrentPosition === iTempLength + 1) {
				iCurrentPosition = 1;
			}

		} else {

			if (iCurrentPosition === 0 || iCurrentPosition === iTempLength - 1) {
				iCurrentPosition = iTempLength;
			} else if (iCurrentPosition === -1 || iCurrentPosition === iTempLength) {
				iCurrentPosition = iTempLength - 1;
			}

		}

		return iCurrentPosition;
	};


	/**
	 * Check if the current value contains any RTL characters
	 * @private
	 * @returns {boolean}
	 */
	MaskInput.prototype._containsRtlChars = function () {
		var sTempValue = this._oTempValue.toString(),
			bContainsRtl = false;
		for (var i = 0; i < sTempValue.length; i++) {
			bContainsRtl = this._isRtlChar(sTempValue[i]);
		}
		return bContainsRtl;
	};


	/**
	 * Check if the current control is in RTL mode.
	 * @private
	 * @returns {boolean}
	 */
	MaskInput.prototype._isRtlMode = function () {
		return sap.ui.getCore().getConfiguration().getRTL() || (this.getTextDirection() === sap.ui.core.TextDirection.RTL);
	};

	/**
	 * Check if the current environment and interaction lead to a bug in Webkit
	 * @private
	 * @returns {boolean|*}
	 */
	MaskInput.prototype._isWebkitProblematicCase = function () {
		return (sap.ui.Device.browser.webkit && this._isRtlMode() && !this._containsRtlChars());
	};

	/**
	 * Determine the correct direction based on RTL mode, current input characters and selection state
	 * @private
	 * @param oKey
	 * @param {object} oSelection
	 * @returns {string} sDirection
	 */
	MaskInput.prototype._determineArrowKeyDirection = function (oKey, oSelection) {
		var sDirection;
		if (!this._isRtlMode() || !this._containsRtlChars() || oSelection.bHasSelection) {
			// when there is selection we want the arrows to always behave as on a ltr input
			if (oKey.bArrowRight) {
				sDirection = 'nextTo';
			} else {
				sDirection = 'previousTo';
			}
		} else {
			// rtl mode
			if (oKey.bArrowRight) {
				sDirection = 'previousTo';
			} else {
				sDirection = 'nextTo';
			}
		}
		return sDirection;
	};

	/**
	 * Determine the right caret position based on the current selection state
	 * @private
	 * @param sDirection
	 * @returns {int} iNewCaretPos
	 */
	MaskInput.prototype._determineRtlCaretPositionFromSelection = function (sDirection, bWithChromeFix) {
		var iNewCaretPos,
			oSelection = this._getTextSelection();

		if (bWithChromeFix) {
			if (sDirection === 'nextTo') {
				if (!this._containsRtlChars()) {
					iNewCaretPos = oSelection.iFrom;
				} else {
					iNewCaretPos = oSelection.iTo;
				}
			} else {
				if (!this._containsRtlChars()) {
					iNewCaretPos = oSelection.iTo;
				} else {
					iNewCaretPos = oSelection.iFrom;
				}
			}
		} else {
			if (sDirection === 'nextTo') {
				if (!this._containsRtlChars()) {
					iNewCaretPos = oSelection.iTo;
				} else {
					iNewCaretPos = oSelection.iFrom;
				}
			} else {
				if (!this._containsRtlChars()) {
					iNewCaretPos = oSelection.iFrom;
				} else {
					iNewCaretPos = oSelection.iTo;
				}
			}
		}

		return iNewCaretPos;
	};

	return MaskInput;

}, /* bExport= */ true);
