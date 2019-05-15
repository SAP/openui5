/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/test/actions/Action",
	"sap/ui/events/KeyCodes"
], function(Action, KeyCodes) {
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
				this.oLogger.error("Please provide a text for this EnterText action");
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
			}

			// Trigger events for every keystroke - livechange controls
			var sValueBuffer = $ActionDomRef.val();
			this.getText().split("").forEach(function (sChar) {
				sValueBuffer += sChar;
				// Change the domref and fire the input event
				oUtils.triggerCharacterInput(oActionDomRef, sChar, sValueBuffer);
				oUtils.triggerEvent("input", oActionDomRef);
			});

			if (!this.getKeepFocus()) {
				// simulate the blur - focus stays but the value is updated now
				this._simulateFocusout(oActionDomRef);

				// always trigger search since searchfield does not react to loosing the focus
				oUtils.triggerEvent("search", oActionDomRef);
			}
		}
	});

});