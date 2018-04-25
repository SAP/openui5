/*!
 * ${copyright}
 */

sap.ui.define([
	"jquery.sap.global",
	"sap/ui/test/_OpaLogger",
	"./Action"
], function ($, _OpaLogger, Action) {
	"use strict";

	var oLogger = _OpaLogger.getLogger("sap.ui.test.actions.EnterText");

	/**
	 * The EnterText action is used to simulate a user entering texts to inputs.
	 * EnterText will be executed on a control's focus dom ref.
	 * Supported controls are (for other controls this action still might work):
	 * <ul>
	 *     <li>sap.m.Input</li>
	 *     <li>sap.m.SearchField</li>
	 *     <li>sap.m.TextArea</li>
	 * </ul>
	 * @class
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
			// focus it
			var $ActionDomRef = this.$(oControl),
				oActionDomRef = $ActionDomRef[0];

			if (!oActionDomRef) {
				return;
			}
			if (this.getText() === undefined || (!this.getClearTextFirst() && !this.getText())) {
				$.sap.log.error("Please provide a text for this EnterText action", this._sLogPrefix);
				return;
			}

			var oUtils = this.getUtils();

			oLogger.timestamp("opa.actions.enterText");
			oLogger.debug("Enter text in control " + oControl);

			this._tryOrSimulateFocusin($ActionDomRef, oControl);

			if (this.getClearTextFirst()) {
				oUtils.triggerKeydown(oActionDomRef, $.sap.KeyCodes.DELETE);
				oUtils.triggerKeyup(oActionDomRef, $.sap.KeyCodes.DELETE);
				$ActionDomRef.val("");
				oUtils.triggerEvent("input", oActionDomRef);
			}

			// Trigger events for every keystroke - livechange controls
			this.getText().split("").forEach(function (sChar) {
				// Change the domref and fire the input event
				oUtils.triggerCharacterInput(oActionDomRef, sChar);
				oUtils.triggerEvent("input", oActionDomRef);
			});

			// simulate the blur - focus stays but the value is updated now
			this._simulateFocusout(oActionDomRef);

			// always trigger search since searchfield does not react to loosing the focus
			oUtils.triggerEvent("search", oActionDomRef);
		}
	});

});
