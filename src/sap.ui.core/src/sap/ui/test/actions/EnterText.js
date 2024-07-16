/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/extend",
	"sap/ui/base/ManagedObject",
	"sap/ui/test/actions/Action",
	"sap/ui/events/KeyCodes",
	"sap/ui/thirdparty/jquery"
], function (extend, ManagedObject, Action, KeyCodes, jQuery) {
	"use strict";

	/**
	 * @class
	 * The <code>EnterText</code> action is used to simulate a user entering texts to inputs.
	 * <code>EnterText</code> will be executed on a control's focus dom ref.
	 * Supported controls are (for other controls this action still might work):
	 * <ul>
	 *     <li><code>sap.m.Input</code></li>
	 *     <li><code>sap.m.SearchField</code></li>
	 *     <li><code>sap.m.TextArea</code></li>
	 * </ul>
	 *
	 * @param {string}
	 *            [sId] Optional ID for the new instance; generated automatically if
	 *            no non-empty ID is given. Note: this can be omitted, no matter
	 *            whether <code>mSettings</code> are given or not!
	 * @param {object}
	 *            [mSettings] Optional object with initial settings for the new instance
	 * @extends sap.ui.test.actions.Action
	 * @public
	 * @alias sap.ui.test.actions.EnterText
	 * @author SAP SE
	 * @since 1.34
	 */
	var EnterText = Action.extend("sap.ui.test.actions.EnterText", /** @lends sap.ui.test.actions.EnterText.prototype */  {

		metadata : {
			properties: {
				/**
				 * The Text that is going to be typed to the control. If you are entering an empty string, the value will be cleared.
				 */
				text: {
					type: "string"
				},
				/**
				 * If it is set to <code>false</code>, the current text of the control will be preserved. By default, the current text of the control will be cleared.
				 * When the text is going to be cleared, a delete character event will be fired and then the value of the input is emptied.
				 * This will trigger a <code>liveChange</code> event on the input with an empty value.
				 * @since 1.38.0
				 */
				clearTextFirst: {
					type: "boolean",
					defaultValue: true
				},
				/*
				 * If it is set to <code>true</code>, the input will remain focused after text is entered.
				 * Use this for inputs with a suggestion list that you want to keep open.
				 * @since 1.67
				 */
				keepFocus: {
					type: "boolean",
					defaultValue: false
				},
				/*
				 * If it is set to <code>true</code>, an ENTER key will be entered after the text.
				 * Use this for inputs that shouldn't lose the focus after a text is entered.
				 * (e.g. inputs in a sap.m.Popover shouldn't be focused out, as this will make the popover close in FF and IE11)
				 * @since 1.76
				 */
				pressEnterKey: {
					type: "boolean",
					defaultValue: false
				}
			}
		},

		constructor: function (mSettings) {
			if (mSettings && mSettings.text) {
				mSettings.text = ManagedObject.escapeSettingsValue(mSettings.text);
			}
			Action.prototype.constructor.call(this, mSettings);
		},

		init: function () {
			Action.prototype.init.apply(this, arguments);
			this.controlAdapters = extend(this.controlAdapters, EnterText.controlAdapters);
		},

		/**
		 * Sets focus on given control and triggers Multiple keyboard events on it, one event for every character in the text.
		 * Logs an error if control has no focusable dom ref or is not visible.
		 *
		 * @param {sap.ui.core.Control} oControl the control on which the text event should be entered in.
		 * @public
		 */
		executeOn : function (oControl) {
			// focus it
			var $ActionDomRef = this.$(oControl),
				oActionDomRef = $ActionDomRef[0];

			if (!oActionDomRef) {
				return;
			}
			if (this.getText() === undefined || (!this.getClearTextFirst() && !this.getText())) {
				this.oLogger.error("Please provide a text for this EnterText action");
				return;
			}
			if (oActionDomRef.readOnly) {
				this.oLogger.debug("Cannot enter text in control " + oControl + ": control is not editable!");
				return;
			}
			if (oActionDomRef.disabled) {
				this.oLogger.debug("Cannot enter text in control " + oControl + ": control is not enabled!");
				return;
			}

			var oUtils = this.getUtils();

			this.oLogger.timestamp("opa.actions.enterText");
			this.oLogger.debug("Enter text in control " + oControl);

			this._tryOrSimulateFocusin($ActionDomRef, oControl);

			if (this.getClearTextFirst()) {
				oUtils.triggerKeydown(oActionDomRef, KeyCodes.DELETE);
				oUtils.triggerKeyup(oActionDomRef, KeyCodes.DELETE);
				$ActionDomRef.val("");
				oUtils.triggerEvent("input", oActionDomRef);
				if (typeof oActionDomRef.selectionStart === 'number') { // element supports selection
					oActionDomRef.selectionStart = 0;
					oActionDomRef.selectionEnd = 0;
				}
			}

			var sTypedInText = $ActionDomRef.val();

			if (($ActionDomRef[0].selectionStart !== $ActionDomRef[0].selectionEnd) &&
				($ActionDomRef[0].selectionStart !== sTypedInText.length)) {
				// get non selected value only
				sTypedInText = sTypedInText.slice(0, $ActionDomRef[0].selectionStart);
				// remove selection as a new value will be typed there
				$ActionDomRef[0].setSelectionRange($ActionDomRef[0].selectionStart, $ActionDomRef[0].selectionStart);
			}

			// Trigger events for every keystroke - livechange controls
			var sValueBuffer = this.getClearTextFirst() ? "" : sTypedInText;
			var iCursorPosition = oActionDomRef.selectionStart;
			this.getText().split("").forEach(function (sChar) {

				if (iCursorPosition === 0 || typeof iCursorPosition !== 'number') {
					sValueBuffer += sChar;
				} else {
					var sLeftPart = sValueBuffer.slice(0, iCursorPosition);
					var sRightPart = sValueBuffer.slice(iCursorPosition);
					sValueBuffer = sLeftPart + sChar + sRightPart;
				}
				// Change the domref and fire the mock 'keypress' and 'input' events
				this.triggerCharacterInput(oActionDomRef, sChar, sValueBuffer, oControl);
				oUtils.triggerEvent("input", oActionDomRef);
			}, this);

			if (this.getPressEnterKey()) {
				// trigger change event with enter key
				oUtils.triggerKeydown(oActionDomRef, KeyCodes.ENTER);
				oUtils.triggerKeyup(oActionDomRef, KeyCodes.ENTER);
				oUtils.triggerEvent("input", oActionDomRef);
				oUtils.triggerEvent("search", oActionDomRef);
			} else if (!this.getKeepFocus()) {
				// simulate the blur - focus stays but the value is updated now
				this._simulateFocusout(oActionDomRef);

				// always trigger search since searchfield does not react to loosing the focus
				oUtils.triggerEvent("search", oActionDomRef);
			}
		},

		triggerCharacterInput: function(oInput, sChar, sValue, oControl) {
			oControl.addEventDelegate({
				"onkeypress": function(oEvent) {
					if (!oEvent.isDefaultPrevented()) {
						// mock the browser default action
						// upon pressing a key inside a focused input
						applyInput();
					}
					oControl.removeEventDelegate(this);
				}
			});

			function applyInput() {
				if (typeof (oInput) == "string") {
					oInput = oInput ? document.getElementById(oInput) : null;
				}
				var $Input = jQuery(oInput);

				if (typeof sValue !== "undefined") {
					$Input.val(sValue);
				} else {
					$Input.val($Input.val() + sChar);
				}
			}

			this.getUtils().triggerKeypress(oInput, sChar);
		}
	});

	/**
	 * A map of ID suffixes for controls that require a special DOM reference for
	 * <code>EnterText</code> interaction.
	 *
	 * You can specify an ID suffix for specific controls in this map.
	 * The enter text action will be triggered on the DOM element with the specified suffix.
	 *
	 * Here is a sublist of supported controls and their <code>EnterText</code> control adapter:
	 * <ul>
	 *  <li>sap.m.StepInput - internal Input</li>
	 * </ul>
	 *
	 * @since 1.70 a control adapter can also be a function.
	 * This is useful for controls with different modes where a different control adapter makes sense in different modes.
	 *
	 * When you extended a UI5 controls the adapter of the control will be taken.
	 * If you need an adapter for your own control you can add it here. For example:
	 * You wrote a control with the namespace my.Control it renders two inputs and you want the EnterText action to enter text in the second one by default.
	 *
	 * <pre>
	 * <code>
	 *     new my.Control("myId");
	 * </code>
	 * </pre>
	 *
	 * It contains two input tags in its DOM.
	 * When you render your control it creates the following DOM:
	 *
	 *
	 * <pre>
	 * <code>
	 *     &lt;div id="myId"&gt;
	 *         &lt;input id="myId-firstInput"/&gt;
	 *         &lt;input id="myId-secondInput"/&gt;
	 *     &lt;/div&gt;
	 * </code>
	 * </pre>
	 *
	 * Then you may add a control adapter like this
	 *
	 * <pre>
	 * <code>
	 *     EnterText.controlAdapters["my.control"] = "secondInput"; //This can be used by setting the Target Property of an action
	 *
	 *     // Example usage
	 *     new EnterText(); // executes on second Input since it is set as default
	 *     new EnterText({ idSuffix: "firstInput"}); // executes on the first input has to be the same as the last part of the ID in the DOM
	 * </code>
	 * </pre>
	 *
	 *
	 * @public
	 * @static
	 * @type Object<string,(string|function(sap.ui.core.Control):string)>
	 */
	EnterText.controlAdapters = {};
	EnterText.controlAdapters["sap.m.StepInput"] = "input-inner"; // focusDomRef: <input>


	return EnterText;
});