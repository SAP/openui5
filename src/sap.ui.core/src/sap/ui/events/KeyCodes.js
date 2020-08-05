/*!
 * ${copyright}
 */
sap.ui.define([], function() {
	"use strict";

	/**
	 * @enum {int}
	 * @since 1.58
	 * @alias module:sap/ui/events/KeyCodes
	 * @public
	 */
	var mKeyCodes = {

		/**
		 * @type int
		 * @public
		 */
		BACKSPACE: 8,

		/**
		 * @type int
		 * @public
		 */
		TAB: 9,

		/**
		 * @type int
		 * @public
		 */
		ENTER: 13,

		/**
		 * @type int
		 * @public
		 */
		SHIFT: 16,

		/**
		 * @type int
		 * @public
		 */
		CONTROL: 17,

		/**
		 * @type int
		 * @public
		 */
		ALT: 18,

		/**
		 * @type int
		 * @public
		 */
		BREAK: 19,

		/**
		 * @type int
		 * @public
		 */
		CAPS_LOCK: 20,

		/**
		 * @type int
		 * @public
		 */
		ESCAPE: 27,

		/**
		 * @type int
		 * @public
		 */
		SPACE: 32,

		/**
		 * @type int
		 * @public
		 */
		PAGE_UP: 33,

		/**
		 * @type int
		 * @public
		 */
		PAGE_DOWN: 34,

		/**
		 * @type int
		 * @public
		 */
		END: 35,

		/**
		 * @type int
		 * @public
		 */
		HOME: 36,

		/**
		 * @type int
		 * @public
		 */
		ARROW_LEFT: 37,

		/**
		 * @type int
		 * @public
		 */
		ARROW_UP: 38,

		/**
		 * @type int
		 * @public
		 */
		ARROW_RIGHT: 39,

		/**
		 * @type int
		 * @public
		 */
		ARROW_DOWN: 40,

		/**
		 * @type int
		 * @public
		 */
		PRINT: 44,

		/**
		 * @type int
		 * @public
		 */
		INSERT: 45,

		/**
		 * @type int
		 * @public
		 */
		DELETE: 46,

		/**
		 * @type int
		 * @public
		 */
		DIGIT_0: 48,

		/**
		 * @type int
		 * @public
		 */
		DIGIT_1: 49,

		/**
		 * @type int
		 * @public
		 */
		DIGIT_2: 50,

		/**
		 * @type int
		 * @public
		 */
		DIGIT_3: 51,

		/**
		 * @type int
		 * @public
		 */
		DIGIT_4: 52,

		/**
		 * @type int
		 * @public
		 */
		DIGIT_5: 53,

		/**
		 * @type int
		 * @public
		 */
		DIGIT_6: 54,

		/**
		 * @type int
		 * @public
		 */
		DIGIT_7: 55,

		/**
		 * @type int
		 * @public
		 */
		DIGIT_8: 56,

		/**
		 * @type int
		 * @public
		 */
		DIGIT_9: 57,

		/**
		 * @type int
		 * @public
		 */
		A: 65,

		/**
		 * @type int
		 * @public
		 */
		B: 66,

		/**
		 * @type int
		 * @public
		 */
		C: 67,

		/**
		 * @type int
		 * @public
		 */
		D: 68,

		/**
		 * @type int
		 * @public
		 */
		E: 69,

		/**
		 * @type int
		 * @public
		 */
		F: 70,

		/**
		 * @type int
		 * @public
		 */
		G: 71,

		/**
		 * @type int
		 * @public
		 */
		H: 72,

		/**
		 * @type int
		 * @public
		 */
		I: 73,

		/**
		 * @type int
		 * @public
		 */
		J: 74,

		/**
		 * @type int
		 * @public
		 */
		K: 75,

		/**
		 * @type int
		 * @public
		 */
		L: 76,

		/**
		 * @type int
		 * @public
		 */
		M: 77,

		/**
		 * @type int
		 * @public
		 */
		N: 78,

		/**
		 * @type int
		 * @public
		 */
		O: 79,

		/**
		 * @type int
		 * @public
		 */
		P: 80,

		/**
		 * @type int
		 * @public
		 */
		Q: 81,

		/**
		 * @type int
		 * @public
		 */
		R: 82,

		/**
		 * @type int
		 * @public
		 */
		S: 83,

		/**
		 * @type int
		 * @public
		 */
		T: 84,

		/**
		 * @type int
		 * @public
		 */
		U: 85,

		/**
		 * @type int
		 * @public
		 */
		V: 86,

		/**
		 * @type int
		 * @public
		 */
		W: 87,

		/**
		 * @type int
		 * @public
		 */
		X: 88,

		/**
		 * @type int
		 * @public
		 */
		Y: 89,

		/**
		 * @type int
		 * @public
		 */
		Z: 90,

		/**
		 * @type int
		 * @public
		 */
		WINDOWS: 91,

		/**
		 * @type int
		 * @public
		 */
		CONTEXT_MENU: 93,

		/**
		 * @type int
		 * @public
		 */
		TURN_OFF: 94,

		/**
		 * @type int
		 * @public
		 */
		SLEEP: 95,

		/**
		 * @type int
		 * @public
		 */
		NUMPAD_0: 96,

		/**
		 * @type int
		 * @public
		 */
		NUMPAD_1: 97,

		/**
		 * @type int
		 * @public
		 */
		NUMPAD_2: 98,

		/**
		 * @type int
		 * @public
		 */
		NUMPAD_3: 99,

		/**
		 * @type int
		 * @public
		 */
		NUMPAD_4: 100,

		/**
		 * @type int
		 * @public
		 */
		NUMPAD_5: 101,

		/**
		 * @type int
		 * @public
		 */
		NUMPAD_6: 102,

		/**
		 * @type int
		 * @public
		 */
		NUMPAD_7: 103,

		/**
		 * @type int
		 * @public
		 */
		NUMPAD_8: 104,

		/**
		 * @type int
		 * @public
		 */
		NUMPAD_9: 105,

		/**
		 * @type int
		 * @public
		 */
		NUMPAD_ASTERISK: 106,

		/**
		 * @type int
		 * @public
		 */
		NUMPAD_PLUS: 107,

		/**
		 * @type int
		 * @public
		 */
		NUMPAD_MINUS: 109,

		/**
		 * @type int
		 * @public
		 */
		NUMPAD_COMMA: 110,

		/**
		 * @type int
		 * @public
		 */
		NUMPAD_SLASH: 111,

		/**
		 * @type int
		 * @public
		 */
		F1: 112,

		/**
		 * @type int
		 * @public
		 */
		F2: 113,

		/**
		 * @type int
		 * @public
		 */
		F3: 114,

		/**
		 * @type int
		 * @public
		 */
		F4: 115,

		/**
		 * @type int
		 * @public
		 */
		F5: 116,

		/**
		 * @type int
		 * @public
		 */
		F6: 117,

		/**
		 * @type int
		 * @public
		 */
		F7: 118,

		/**
		 * @type int
		 * @public
		 */
		F8: 119,

		/**
		 * @type int
		 * @public
		 */
		F9: 120,

		/**
		 * @type int
		 * @public
		 */
		F10: 121,

		/**
		 * @type int
		 * @public
		 */
		F11: 122,

		/**
		 * @type int
		 * @public
		 */
		F12: 123,

		/**
		 * @type int
		 * @public
		 */
		NUM_LOCK: 144,

		/**
		 * @type int
		 * @public
		 */
		SCROLL_LOCK: 145,

		/**
		 * @type int
		 * @public
		 */
		OPEN_BRACKET: 186,

		/**
		 * @type int
		 * @public
		 */
		PLUS: 187,

		/**
		 * @type int
		 * @public
		 */
		COMMA: 188,

		/**
		 * @type int
		 * @public
		 */
		SLASH: 189,

		/**
		 * @type int
		 * @public
		 */
		DOT: 190,

		/**
		 * @type int
		 * @public
		 */
		PIPE: 191,

		/**
		 * @type int
		 * @public
		 */
		SEMICOLON: 192,

		/**
		 * @type int
		 * @public
		 */
		MINUS: 219,

		/**
		 * @type int
		 * @public
		 */
		GREAT_ACCENT: 220,

		/**
		 * @type int
		 * @public
		 */
		EQUALS: 221,

		/**
		 * @type int
		 * @public
		 */
		SINGLE_QUOTE: 222,

		/**
		 * @type int
		 * @public
		 */
		BACKSLASH: 226
	};

	return mKeyCodes;

});