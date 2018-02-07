/*!
 * ${copyright}
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */
sap.ui.define(['sap/base/events/KeyCodes'], function(KeyCodes) {
	"use strict";

	/**
	 * Detect whether the pressed key is a special key.
	 *
	 * Special keys:
	 * SHIFT, CONTROL, ALT, BREAK, CAPS_LOCK,
	 * PAGE_UP, PAGE_DOWN, END, HOME, ARROW_LEFT, ARROW_UP, ARROW_RIGHT, ARROW_DOWN,
	 * PRINT, INSERT, DELETE, F1, F2, F3, F4, F5, F6, F7, F8, F9, F10, F11, F12,
	 * BACKSPACE, TAB, ENTER, ESCAPE
	 *
	 * @function
	 * @param {jQuery.Event} oEvent The event object of the <code>keydown</code>, <code>keyup</code> or <code>keypress</code> events.
	 * @static
	 * @returns {boolean} True if a special key was pressed
	 * @private
	 * @experimental Since 1.24.0 Implementation might change.
	 */
	var fnIsSpecialKey = function(oEvent) {
		/**
		 * Detect whether the pressed key is a modifier.
		 *
		 * Modifier keys are considered:
		 * SHIFT, CONTROL, ALT, CAPS_LOCK, NUM_LOCK
		 * These keys don't send characters, but modify the characters sent by other keys.
		 *
		 * @param {jQuery.Event} oEvent The event object of the <code>keydown</code>, <code>keyup</code> or <code>keypress</code> events.
		 * @static
		 * @returns {boolean} True if a modifier key was pressed
		 */
		function isModifierKey(oEvent) {
			var iKeyCode = oEvent.which; // jQuery oEvent.which normalizes oEvent.keyCode and oEvent.charCode

			return (iKeyCode === KeyCodes.SHIFT) ||
				(iKeyCode === KeyCodes.CONTROL) ||
				(iKeyCode === KeyCodes.ALT) ||
				(iKeyCode === KeyCodes.CAPS_LOCK) ||
				(iKeyCode === KeyCodes.NUM_LOCK);
		}

		/**
		 * Detect whether the pressed key is a navigation key.
		 *
		 * Navigation keys are considered:
		 * ARROW_LEFT, ARROW_UP, ARROW_RIGHT, ARROW_DOWN
		 *
		 * @param {jQuery.Event} oEvent The event object of the <code>keydown</code>, <code>keyup</code> or <code>keypress</code> events.
		 * @static
		 * @returns {boolean} True if a arrow key was pressed
		 */
		function isArrowKey(oEvent) {
			var iKeyCode = oEvent.which, // jQuery oEvent.which normalizes oEvent.keyCode and oEvent.charCode
				bArrowKey = (iKeyCode >= 37 && iKeyCode <= 40); // ARROW_LEFT, ARROW_UP, ARROW_RIGHT, ARROW_DOWN

			switch (oEvent.type) {
				case "keydown":
				case "keyup":
					return bArrowKey;

				// note: the keypress event should be fired only when a character key is pressed,
				// unfortunately some browsers fire the keypress event for other keys. e.g.:
				//
				// Firefox fire it for:
				// ARROW_LEFT, ARROW_RIGHT
				case "keypress":

					// in Firefox, almost all noncharacter keys that fire the keypress event have a key code of 0
					return iKeyCode === 0;

				default:
					return false;
			}
		}

		var iKeyCode = oEvent.which, // jQuery oEvent.which normalizes oEvent.keyCode and oEvent.charCode
			bSpecialKey = isModifierKey(oEvent) ||
				isArrowKey(oEvent) ||
				(iKeyCode >= 33 && iKeyCode <= 36) || // PAGE_UP, PAGE_DOWN, END, HOME
				(iKeyCode >= 44 && iKeyCode <= 46) || // PRINT, INSERT, DELETE
				(iKeyCode >= 112 && iKeyCode <= 123) || // F1, F2, F3, F4, F5, F6, F7, F8, F9, F10, F11, F12
				(iKeyCode === KeyCodes.BREAK) ||
				(iKeyCode === KeyCodes.BACKSPACE) ||
				(iKeyCode === KeyCodes.TAB) ||
				(iKeyCode === KeyCodes.ENTER) ||
				(iKeyCode === KeyCodes.ESCAPE) ||
				(iKeyCode === KeyCodes.SCROLL_LOCK);

		switch (oEvent.type) {
			case "keydown":
			case "keyup":
				return bSpecialKey;

			// note: the keypress event should be fired only when a character key is pressed,
			// unfortunately some browsers fire the keypress event for other keys. e.g.:
			//
			// Firefox fire it for:
			// BREAK, ARROW_LEFT, ARROW_RIGHT, INSERT, DELETE,
			// F1, F2, F3, F5, F6, F7, F8, F9, F10, F11, F12
			// BACKSPACE, ESCAPE
			//
			// Internet Explorer fire it for:
			// ESCAPE
			case "keypress":

				// note: in Firefox, almost all noncharacter keys that fire the keypress event have a key code of 0,
				// with the exception of BACKSPACE (key code of 8).
				// note: in IE the ESCAPE key is also fired for the keypress event
				return (iKeyCode === 0 || // in Firefox, almost all noncharacter keys that fire the keypress event have a key code of 0, with the exception of BACKSPACE (key code of 8)
					iKeyCode === KeyCodes.BACKSPACE ||
					iKeyCode === KeyCodes.ESCAPE ||
					iKeyCode === KeyCodes.ENTER /* all browsers */) || false;

			default:
				return false;
		}
	};

	return fnIsSpecialKey;
});