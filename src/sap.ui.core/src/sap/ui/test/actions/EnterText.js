/*!
 * ${copyright}
 */
/*global FocusEvent, document */

sap.ui.define(['jquery.sap.global', './Action', 'sap/ui/Device'], function ($, Action, Device) {
	"use strict";

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

			$ActionDomRef.focus();

			if (!$ActionDomRef.is(":focus")) {
				$.sap.log.warning("Control " + oControl + " could not be focused - maybe you are debugging?", this._sLogPrefix);
			}

			var oUtils = this.getUtils();

			var createAndDispatchFocusEvent = function (sName) {
				var oFocusEvent;

				// PhantomJS does not have a FocusEvent constructer and no InitFocusEvent function
				if (Device.browser.phantomJS) {
					oFocusEvent = document.createEvent("FocusEvent");
					oFocusEvent.initEvent(sName, true, false);
				// IE 11 and below don't really like the FocusEvent constructor - Fire it the IE way
				} else if (Device.browser.msie && (Device.browser.version < 12)) {
					oFocusEvent = document.createEvent("FocusEvent");
					oFocusEvent.initFocusEvent(sName, true, false, window, 0, oActionDomRef);
				} else {
					oFocusEvent = new FocusEvent(sName);
				}

				oActionDomRef.dispatchEvent(oFocusEvent);
				$.sap.log.info("Dispatched focus event: '" + sName + "'", this._sLogPrefix);
			}.bind(this);

			var bWasFocused = $ActionDomRef.is(":focus");
			if (!bWasFocused) {
				createAndDispatchFocusEvent("focusin");
				createAndDispatchFocusEvent("focus");
				createAndDispatchFocusEvent("activate");
			}

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
			createAndDispatchFocusEvent("focusout");
			createAndDispatchFocusEvent("blur");
			createAndDispatchFocusEvent("deactivate");

			// always trigger search since searchfield does not react to loosing the focus
			oUtils.triggerEvent("search", oActionDomRef);
		}
	});

}, /* bExport= */ true);
