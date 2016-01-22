/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global', './Action'], function ($, Action) {
	"use strict";

	/**
	 * @class The EnterText action is used to simulate a user entering texts to inputs.
	 * @extends sap.ui.test.actions.Action
	 * @public
	 * @name sap.ui.test.actions.EnterText
	 * @author SAP SE
	 * @since 1.34
	 */
	return Action.extend("sap.ui.test.actions.EnterText", /** @lends sap.ui.test.actions.EnterText.prototype */  {

		metadata : {
			properties: {
				/**
				 * The Text that is going to be typed to the control. If you are entering an empty string, the value will be cleared.
				 */
				text: {
					type: "string"
				},
				/**
				 * @Since 1.38.0 If it is set to false, the current text of the Control will be preserved. By default the current text of the control will be cleared.
				 * When the text is going to be cleared, a delete character event will be fired and then the value of the input is emptied.
				 * This will trigger a liveChange event on the input with an empty value.
				 */
				clearTextFirst: {
					type: "boolean",
					defaultValue: true
				}
			},
			publicMethods : [ "executeOn" ]
		},

		/**
		 * Sets focus on given control and triggers Multiple keyboard events on it, one event for every character in the text.
		 * Logs an error if control has no focusable dom ref or is not visible.
		 *
		 * @param {sap.ui.core.Control} oControl the control on which the text event should be entered in.
		 * @public
		 */
		executeOn : function (oControl) {
			// Every input control should have a focusable domref
			var oFocusDomRef = oControl.getFocusDomRef();
			if (!oFocusDomRef) {
				$.sap.log.error("Control " + oControl + " has no focusable dom representation", this._sLogPrefix);
				return;
			}
			if (this.getText() === undefined || (!this.getClearTextFirst() && !this.getText())) {
				$.sap.log.error("Please provide a text for this EnterText action", this._sLogPrefix);
				return;
			}

			// focus it
			var $FocusDomRef = $(oFocusDomRef);
			$FocusDomRef.focus();

			if (!$FocusDomRef.is(":focus")) {
				$.sap.log.warning("Control " + oControl + " could not be focused - maybe you are debugging?", this._sLogPrefix);
			}
			var oUtils = this._getUtils();

			if (this.getClearTextFirst()) {
				oUtils.triggerKeydown(oFocusDomRef, $.sap.KeyCodes.DELETE);
				oUtils.triggerKeyup(oFocusDomRef, $.sap.KeyCodes.DELETE);
				$FocusDomRef.val("");
				oUtils.triggerEvent("input", oFocusDomRef);
			}

			// Trigger events for every keystroke - livechange controls
			this.getText().split("").forEach(function (sChar) {
				// Change the domref and fire the input event
				oUtils.triggerCharacterInput(oFocusDomRef, sChar);
				oUtils.triggerEvent("input", oFocusDomRef);
			});

			// trigger change by pressing enter - the dom should be updated by the events above

			// Input change will fire here
			oUtils.triggerKeydown(oFocusDomRef, "ENTER");
			// Seachfield will fire here
			oUtils.triggerKeyup(oFocusDomRef, "ENTER");
			// To make extra sure - textarea only works with blur
			oUtils.triggerEvent("blur", oFocusDomRef);
		}
	});

}, /* bExport= */ true);
