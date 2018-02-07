/*!
 * ${copyright}
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */
sap.ui.define([], function() {
	"use strict";

	/**
	 * @exports sap/base/events/KeyCodes
	 * @enum {Number}
	 * @private
	 */
	var mKeyCodes = {

		/**
		 * @type number
		 * @private
		 */
		BACKSPACE: 8,

		/**
		 * @type number
		 * @private
		 */
		TAB: 9,

		/**
		 * @type number
		 * @private
		 */
		ENTER: 13,

		/**
		 * @type number
		 * @private
		 */
		SHIFT: 16,

		/**
		 * @type number
		 * @private
		 */
		CONTROL: 17,

		/**
		 * @type number
		 * @private
		 */
		ALT: 18,

		/**
		 * @type number
		 * @private
		 */
		BREAK: 19,

		/**
		 * @type number
		 * @private
		 */
		CAPS_LOCK: 20,

		/**
		 * @type number
		 * @private
		 */
		ESCAPE: 27,

		/**
		 * @type number
		 * @private
		 */
		SPACE: 32,

		/**
		 * @type number
		 * @private
		 */
		PAGE_UP: 33,

		/**
		 * @type number
		 * @private
		 */
		PAGE_DOWN: 34,

		/**
		 * @type number
		 * @private
		 */
		END: 35,

		/**
		 * @type number
		 * @private
		 */
		HOME: 36,

		/**
		 * @type number
		 * @private
		 */
		ARROW_LEFT: 37,

		/**
		 * @type number
		 * @private
		 */
		ARROW_UP: 38,

		/**
		 * @type number
		 * @private
		 */
		ARROW_RIGHT: 39,

		/**
		 * @type number
		 * @private
		 */
		ARROW_DOWN: 40,

		/**
		 * @type number
		 * @private
		 */
		PRINT: 44,

		/**
		 * @type number
		 * @private
		 */
		INSERT: 45,

		/**
		 * @type number
		 * @private
		 */
		DELETE: 46,

		/**
		 * @type number
		 * @private
		 */
		DIGIT_0: 48,

		/**
		 * @type number
		 * @private
		 */
		DIGIT_1: 49,

		/**
		 * @type number
		 * @private
		 */
		DIGIT_2: 50,

		/**
		 * @type number
		 * @private
		 */
		DIGIT_3: 51,

		/**
		 * @type number
		 * @private
		 */
		DIGIT_4: 52,

		/**
		 * @type number
		 * @private
		 */
		DIGIT_5: 53,

		/**
		 * @type number
		 * @private
		 */
		DIGIT_6: 54,

		/**
		 * @type number
		 * @private
		 */
		DIGIT_7: 55,

		/**
		 * @type number
		 * @private
		 */
		DIGIT_8: 56,

		/**
		 * @type number
		 * @private
		 */
		DIGIT_9: 57,

		/**
		 * @type number
		 * @private
		 */
		A: 65,

		/**
		 * @type number
		 * @private
		 */
		B: 66,

		/**
		 * @type number
		 * @private
		 */
		C: 67,

		/**
		 * @type number
		 * @private
		 */
		D: 68,

		/**
		 * @type number
		 * @private
		 */
		E: 69,

		/**
		 * @type number
		 * @private
		 */
		F: 70,

		/**
		 * @type number
		 * @private
		 */
		G: 71,

		/**
		 * @type number
		 * @private
		 */
		H: 72,

		/**
		 * @type number
		 * @private
		 */
		I: 73,

		/**
		 * @type number
		 * @private
		 */
		J: 74,

		/**
		 * @type number
		 * @private
		 */
		K: 75,

		/**
		 * @type number
		 * @private
		 */
		L: 76,

		/**
		 * @type number
		 * @private
		 */
		M: 77,

		/**
		 * @type number
		 * @private
		 */
		N: 78,

		/**
		 * @type number
		 * @private
		 */
		O: 79,

		/**
		 * @type number
		 * @private
		 */
		P: 80,

		/**
		 * @type number
		 * @private
		 */
		Q: 81,

		/**
		 * @type number
		 * @private
		 */
		R: 82,

		/**
		 * @type number
		 * @private
		 */
		S: 83,

		/**
		 * @type number
		 * @private
		 */
		T: 84,

		/**
		 * @type number
		 * @private
		 */
		U: 85,

		/**
		 * @type number
		 * @private
		 */
		V: 86,

		/**
		 * @type number
		 * @private
		 */
		W: 87,

		/**
		 * @type number
		 * @private
		 */
		X: 88,

		/**
		 * @type number
		 * @private
		 */
		Y: 89,

		/**
		 * @type number
		 * @private
		 */
		Z: 90,

		/**
		 * @type number
		 * @private
		 */
		WINDOWS: 91,

		/**
		 * @type number
		 * @private
		 */
		CONTEXT_MENU: 93,

		/**
		 * @type number
		 * @private
		 */
		TURN_OFF: 94,

		/**
		 * @type number
		 * @private
		 */
		SLEEP: 95,

		/**
		 * @type number
		 * @private
		 */
		NUMPAD_0: 96,

		/**
		 * @type number
		 * @private
		 */
		NUMPAD_1: 97,

		/**
		 * @type number
		 * @private
		 */
		NUMPAD_2: 98,

		/**
		 * @type number
		 * @private
		 */
		NUMPAD_3: 99,

		/**
		 * @type number
		 * @private
		 */
		NUMPAD_4: 100,

		/**
		 * @type number
		 * @private
		 */
		NUMPAD_5: 101,

		/**
		 * @type number
		 * @private
		 */
		NUMPAD_6: 102,

		/**
		 * @type number
		 * @private
		 */
		NUMPAD_7: 103,

		/**
		 * @type number
		 * @private
		 */
		NUMPAD_8: 104,

		/**
		 * @type number
		 * @private
		 */
		NUMPAD_9: 105,

		/**
		 * @type number
		 * @private
		 */
		NUMPAD_ASTERISK: 106,

		/**
		 * @type number
		 * @private
		 */
		NUMPAD_PLUS: 107,

		/**
		 * @type number
		 * @private
		 */
		NUMPAD_MINUS: 109,

		/**
		 * @type number
		 * @private
		 */
		NUMPAD_COMMA: 110,

		/**
		 * @type number
		 * @private
		 */
		NUMPAD_SLASH: 111,

		/**
		 * @type number
		 * @private
		 */
		F1: 112,

		/**
		 * @type number
		 * @private
		 */
		F2: 113,

		/**
		 * @type number
		 * @private
		 */
		F3: 114,

		/**
		 * @type number
		 * @private
		 */
		F4: 115,

		/**
		 * @type number
		 * @private
		 */
		F5: 116,

		/**
		 * @type number
		 * @private
		 */
		F6: 117,

		/**
		 * @type number
		 * @private
		 */
		F7: 118,

		/**
		 * @type number
		 * @private
		 */
		F8: 119,

		/**
		 * @type number
		 * @private
		 */
		F9: 120,

		/**
		 * @type number
		 * @private
		 */
		F10: 121,

		/**
		 * @type number
		 * @private
		 */
		F11: 122,

		/**
		 * @type number
		 * @private
		 */
		F12: 123,

		/**
		 * @type number
		 * @private
		 */
		NUM_LOCK: 144,

		/**
		 * @type number
		 * @private
		 */
		SCROLL_LOCK: 145,

		/**
		 * @type number
		 * @private
		 */
		OPEN_BRACKET: 186,

		/**
		 * @type number
		 * @private
		 */
		PLUS: 187,

		/**
		 * @type number
		 * @private
		 */
		COMMA: 188,

		/**
		 * @type number
		 * @private
		 */
		SLASH: 189,

		/**
		 * @type number
		 * @private
		 */
		DOT: 190,

		/**
		 * @type number
		 * @private
		 */
		PIPE: 191,

		/**
		 * @type number
		 * @private
		 */
		SEMICOLON: 192,

		/**
		 * @type number
		 * @private
		 */
		MINUS: 219,

		/**
		 * @type number
		 * @private
		 */
		GREAT_ACCENT: 220,

		/**
		 * @type number
		 * @private
		 */
		EQUALS: 221,

		/**
		 * @type number
		 * @private
		 */
		SINGLE_QUOTE: 222,

		/**
		 * @type number
		 * @private
		 */
		BACKSLASH: 226
	};

	return mKeyCodes;

});