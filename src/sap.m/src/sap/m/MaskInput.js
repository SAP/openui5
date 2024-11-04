/*!
 * ${copyright}
 */

// Provides control sap.m.MaskInput.
sap.ui.define(['./InputBase', './MaskEnabler', './MaskInputRenderer'], function(InputBase, MaskEnabler, MaskInputRenderer) {
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
	 * When focused, the masked input field is formatted and prefilled. The <code>placeholderSymbol</code> property value is reserved for a placeholder.
	 * The value that has to be entered in this field is in the <code>mask</code> property value format where every symbol corresponds to a rule.
	 * A rule is a set of characters that are allowed for their particular position.
	 * Symbols that do not have a rule are immutable characters and are part of the value formatting.
	 *
	 * <b<Note:</b> Descriptive text as <code>placeholder</code> property value should be added,
	 * in order guide users what input is expected based on the particular control configuration.
	 *
	 * @author SAP SE
	 * @extends sap.m.InputBase
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.34.0
	 * @alias sap.m.MaskInput
	 * @see {@link fiori:https://experience.sap.com/fiori-design-web/generic-mask-input/ Mask Input}
	 */
	var MaskInput = InputBase.extend("sap.m.MaskInput", /** @lends sap.m.MaskInput.prototype */ {
		metadata: {
			library: "sap.m",
			properties: {

				/**
				 * Defines a placeholder symbol. Shown at the position where there is no user input yet.
				 */
				placeholderSymbol: { type: "string", group: "Misc", defaultValue: "_" },

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
				mask: { type: "string", group: "Misc", defaultValue: null },

				/**
				 * Specifies whether a clear icon is shown.
				 * Pressing the icon will clear input's value and fire the change event.
				 * @since 1.96
				 */
				 showClearIcon: { type: "boolean", defaultValue: false },

				 /**
				  * Specifies whether the clear icon should be shown/hidden on user interaction.
				  * @private
				  */
				 effectiveShowClearIcon: { type: "boolean", defaultValue: false, visibility: "hidden" }

			},
			aggregations: {

				/**
				 A list of validation rules (one rule per mask character).
				 */
				rules: { type: "sap.m.MaskInputRule", multiple: true, singularName: "rule" }

			},
			events : {

				/**
				 * Fired when the value of the <code>MaskInput</code> is changed by user interaction - each keystroke, delete, paste, etc.
				 *
				 * <b>Note:</b> Browsing autocomplete suggestions doesn't fire the event.
				 * @since 1.104.0
				 */
				liveChange: {
					parameters : {
						/**
						 * The current value of the input, after a live change event.
						 */
						value: {type : "string"},

						/**
						 * The previous value of the input, before the last user interaction.
						 */
						previousValue: {type : "string"}
					}
				},
				/**
				 * This event is fired when user presses the <kbd>Enter</kbd> key on the Mask input.
				 *
				 * <b>Notes:</b>
				 * <ul>
				 * <li>The event is fired independent of whether there was a change before or not. If a change was performed, the event is fired after the change event.</li>
				 * <li>The event is only fired on an input which allows text input (<code>editable</code> and <code>enabled</code>).</li>
				 * </ul>
				 *
				 * @since 1.131.0
				 */
				submit : {
					parameters: {

						/**
						 * The new value of the Mask input.
						 */
						value: { type: "string" }
					}
				}

			},
			dnd: { draggable: false, droppable: true }
		},

		renderer: MaskInputRenderer
	});

	MaskEnabler.call(MaskInput.prototype);

	/**
	 * Returns if the mask is enabled.
	 *
	 * @returns {boolean}
	 * @private
	 */
	MaskInput.prototype._isMaskEnabled = function () {
		return true;
	};

	MaskInput.prototype._revertKey = function(oKey, oSelection) {
		oSelection = oSelection || this._getTextSelection();

		let iBegin = oSelection.iFrom,
			iEnd = oSelection.iTo,
			iStart = iBegin,
			sPlaceholder,
			iLen;

		if (!oSelection.bHasSelection) {
			if (oKey.bBackspace) {
				iStart = iBegin = this._oRules.previousTo(iBegin);
			} else if (oKey.bDelete) {
				sPlaceholder = this.getPlaceholderSymbol();
				iLen = this._oTempValue._aContent.length;

				// find first character that is not a placeholder or separator character
				while ((this._oTempValue._aContent[iBegin] === sPlaceholder ||
						this._oTempValue._aInitial[iBegin] !== sPlaceholder) &&
						iBegin < iLen) {
					iBegin++;
				}
				iEnd = iBegin;
			}
		}

		if (oKey.bBackspace || (oKey.bDelete && oSelection.bHasSelection)) {
			iEnd = iEnd - 1;
		}

		this._resetTempValue(iBegin, iEnd);
		this._bCheckForLiveChange = true;
		this.updateDomValue(this._oTempValue.toString());
		this._setCursorPosition(Math.max(this._iUserInputStartPosition, iStart));
	};

	MaskInput.prototype.onsapenter = function(oEvent) {
		const bFireSubmit = this.getEnabled() && this.getEditable();

		if (bFireSubmit) {
			InputBase.prototype.onsapenter.apply(this, arguments);
			this.fireSubmit({value: this.getValue()});
		}
	};

	return MaskInput;

});
