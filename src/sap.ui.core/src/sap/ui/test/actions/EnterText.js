/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global', 'sap/ui/base/ManagedObject', 'sap/ui/qunit/QUnitUtils'], function ($, ManagedObject, Utils) {
	"use strict";

	/**
	 * @class The EnterText action is used to simulate a user entering texts to inputs.
	 * @extends sap.ui.base.ManagedObject
	 * @public
	 * @alias sap.ui.test.actions.EnterText
	 * @author SAP SE
	 * @since 1.34
	 */
	return ManagedObject.extend("sap.ui.test.actions.EnterText", {

		metadata : {
			properties: {
				/**
				 * The Text that is going to be typed to the control.
				 */
				text: {
					type: "string"
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
		 * @function
		 */
		executeOn : function (oControl) {
			// Every input control should have a focusable domref
			var oFocusDomRef = oControl.getFocusDomRef();
			if (!oFocusDomRef) {
				$.sap.log.error("Control " + oControl + " has no focusable dom representation", this);
				return;
			}

			// focus it
			var $FocusDomRef = $(oFocusDomRef);
			$FocusDomRef.focus();

			if (!$FocusDomRef.is(":focus")) {
				$.sap.log.warning("Control " + oControl + " could not be focused - maybe you are debugging?", this);
			}

			// Trigger events for every keystroke - livechange controls
			this.getText().split("").forEach(function (sChar) {
				// Change the domref and fire the input event
				Utils.triggerCharacterInput(oFocusDomRef, sChar);
				Utils.triggerEvent("input", oFocusDomRef);
			});

			// trigger change by pressing enter - the dom should be updated by the events above

			// Input change will fire here
			Utils.triggerKeydown(oFocusDomRef, "ENTER");
			// Seachfield will fire here
			Utils.triggerKeyup(oFocusDomRef, "ENTER");
			// To make extra sure - textarea only works with blur
			Utils.triggerEvent("blur", oFocusDomRef);
		}
	});

}, /* bExport= */ true);
