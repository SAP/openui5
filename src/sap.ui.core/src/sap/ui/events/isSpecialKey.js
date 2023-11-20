/*!
 * ${copyright}
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */
sap.ui.define(function() {
	"use strict";

	/**
	 * Detect whether the pressed key is a special key.
	 *
	 * Special keys:
	 * SHIFT, CONTROL, ALT, ALTGRAPH, BREAK, CAPS_LOCK, NUM_LOCK
	 * PAGE_UP, PAGE_DOWN, END, HOME, ARROW_LEFT, ARROW_UP, ARROW_RIGHT, ARROW_DOWN,
	 * PRINT, INSERT, DELETE, F1, F2, F3, F4, F5, F6, F7, F8, F9, F10, F11, F12,
	 * BACKSPACE, TAB, ENTER, ESCAPE
	 *
	 * @function
	 * @since 1.58
	 * @alias module:sap/ui/events/isSpecialKey
	 * @param {jQuery.Event} oEvent The event object of the <code>keydown</code>, <code>keyup</code> or <code>keypress</code> events.
	 * @returns {boolean} True if a special key was pressed
	 * @private
	 * @ui5-restricted sap.ui.core
	 */
	var fnIsSpecialKey = function(oEvent) {
		/**
		 * Detect whether the pressed key is a modifier.
		 *
		 * Modifier keys are considered:
		 * SHIFT, CONTROL, ALT, ALTGRAPH, CAPS_LOCK, NUM_LOCK
		 * These keys don't send characters, but modify the characters sent by other keys.
		 *
		 * @param {jQuery.Event} oEvent The event object of the <code>keydown</code>, <code>keyup</code> or <code>keypress</code> events.
		 * @static
		 * @returns {boolean} True if a modifier key was pressed
		 */
		function isModifierKey(oEvent) {
			var sKey = oEvent.key; // based on KeyBoardEvent.key (https://www.w3.org/TR/uievents/) and (https://www.w3.org/TR/uievents-key/)
			return (sKey === 'Shift') ||
				(sKey === 'Control') ||
				(sKey === 'Alt') || // Modern browsers uses 'Alt' for left 'Alt' key and 'AltGraph' for right 'Alt Gr' key
				(sKey === 'AltGraph') || // see above -^
				(sKey === 'CapsLock') ||
				(sKey === 'NumLock');
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
			var sKey = oEvent.key; // based on KeyBoardEvent.key (https://www.w3.org/TR/uievents/) and (https://www.w3.org/TR/uievents-key/)

			return (sKey === 'ArrowLeft') ||
				(sKey === 'ArrowUp') ||
				(sKey === 'ArrowRight') ||
				(sKey === 'ArrowDown');
		}

		var sKey = oEvent.key, // based on KeyBoardEvent.key (https://www.w3.org/TR/uievents/) and (https://www.w3.org/TR/uievents-key/)
			bSpecialKey = isModifierKey(oEvent) ||
				isArrowKey(oEvent) ||
				sKey === 'PageUp' || sKey === 'PageDown' || sKey === 'End' || sKey === 'Home' ||
				sKey === 'PrintScreen' || sKey === 'Insert' || sKey === 'Delete' ||
				sKey === 'F1' || sKey === 'F2' || sKey === 'F3' || sKey === 'F4' || sKey === 'F5' || sKey === 'F6' || sKey === 'F7' || sKey === 'F8' || sKey === 'F9' || sKey === 'F10' || sKey === 'F11' || sKey === 'F12' ||
				sKey === 'Pause' ||
				sKey === 'Backspace' ||
				sKey === 'Tab' ||
				sKey === 'Enter' ||
				sKey === 'Escape' ||
				sKey === 'ScrollLock';

		switch (oEvent.type) {
			case "keydown":
			case "keyup":
			case "keypress":
				return bSpecialKey;

			default:
				return false;
		}
	};

	return fnIsSpecialKey;
});
