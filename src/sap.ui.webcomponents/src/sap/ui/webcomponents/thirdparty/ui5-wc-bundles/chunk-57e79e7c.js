sap.ui.define(['exports'], function (exports) { 'use strict';

	var KeyCodes = {
	  BACKSPACE: 8,
	  TAB: 9,
	  ENTER: 13,
	  SHIFT: 16,
	  CONTROL: 17,
	  ALT: 18,
	  BREAK: 19,
	  CAPS_LOCK: 20,
	  ESCAPE: 27,
	  SPACE: 32,
	  PAGE_UP: 33,
	  PAGE_DOWN: 34,
	  END: 35,
	  HOME: 36,
	  ARROW_LEFT: 37,
	  ARROW_UP: 38,
	  ARROW_RIGHT: 39,
	  ARROW_DOWN: 40,
	  PRINT: 44,
	  INSERT: 45,
	  DELETE: 46,
	  DIGIT_0: 48,
	  DIGIT_1: 49,
	  DIGIT_2: 50,
	  DIGIT_3: 51,
	  DIGIT_4: 52,
	  DIGIT_5: 53,
	  DIGIT_6: 54,
	  DIGIT_7: 55,
	  DIGIT_8: 56,
	  DIGIT_9: 57,
	  A: 65,
	  B: 66,
	  C: 67,
	  D: 68,
	  E: 69,
	  F: 70,
	  G: 71,
	  H: 72,
	  I: 73,
	  J: 74,
	  K: 75,
	  L: 76,
	  M: 77,
	  N: 78,
	  O: 79,
	  P: 80,
	  Q: 81,
	  R: 82,
	  S: 83,
	  T: 84,
	  U: 85,
	  V: 86,
	  W: 87,
	  X: 88,
	  Y: 89,
	  Z: 90,
	  WINDOWS: 91,
	  CONTEXT_MENU: 93,
	  TURN_OFF: 94,
	  SLEEP: 95,
	  NUMPAD_0: 96,
	  NUMPAD_1: 97,
	  NUMPAD_2: 98,
	  NUMPAD_3: 99,
	  NUMPAD_4: 100,
	  NUMPAD_5: 101,
	  NUMPAD_6: 102,
	  NUMPAD_7: 103,
	  NUMPAD_8: 104,
	  NUMPAD_9: 105,
	  NUMPAD_ASTERISK: 106,
	  NUMPAD_PLUS: 107,
	  NUMPAD_MINUS: 109,
	  NUMPAD_COMMA: 110,
	  NUMPAD_SLASH: 111,
	  F1: 112,
	  F2: 113,
	  F3: 114,
	  F4: 115,
	  F5: 116,
	  F6: 117,
	  F7: 118,
	  F8: 119,
	  F9: 120,
	  F10: 121,
	  F11: 122,
	  F12: 123,
	  NUM_LOCK: 144,
	  SCROLL_LOCK: 145,
	  OPEN_BRACKET: 186,
	  PLUS: 187,
	  COMMA: 188,
	  SLASH: 189,
	  DOT: 190,
	  PIPE: 191,
	  SEMICOLON: 192,
	  MINUS: 219,
	  GREAT_ACCENT: 220,
	  EQUALS: 221,
	  SINGLE_QUOTE: 222,
	  BACKSLASH: 226
	};

	var isEnter = function isEnter(event) {
	  return (event.key ? event.key === "Enter" : event.keyCode === KeyCodes.ENTER) && !hasModifierKeys(event);
	};

	var isSpace = function isSpace(event) {
	  return (event.key ? event.key === "Spacebar" || event.key === " " : event.keyCode === KeyCodes.SPACE) && !hasModifierKeys(event);
	};

	var isLeft = function isLeft(event) {
	  return (event.key ? event.key === "ArrowLeft" || event.key === "Left" : event.keyCode === KeyCodes.ARROW_LEFT) && !hasModifierKeys(event);
	};

	var isRight = function isRight(event) {
	  return (event.key ? event.key === "ArrowRight" || event.key === "Right" : event.keyCode === KeyCodes.ARROW_RIGHT) && !hasModifierKeys(event);
	};

	var isUp = function isUp(event) {
	  return (event.key ? event.key === "ArrowUp" || event.key === "Up" : event.keyCode === KeyCodes.ARROW_UP) && !hasModifierKeys(event);
	};

	var isDown = function isDown(event) {
	  return (event.key ? event.key === "ArrowDown" || event.key === "Down" : event.keyCode === KeyCodes.ARROW_DOWN) && !hasModifierKeys(event);
	};

	var isHome = function isHome(event) {
	  return (event.key ? event.key === "Home" : event.keyCode === KeyCodes.HOME) && !hasModifierKeys(event);
	};

	var isEnd = function isEnd(event) {
	  return (event.key ? event.key === "End" : event.keyCode === KeyCodes.END) && !hasModifierKeys(event);
	};

	var isEscape = function isEscape(event) {
	  return (event.key ? event.key === "Escape" || event.key === "Esc" : event.keyCode === KeyCodes.ESCAPE) && !hasModifierKeys(event);
	};

	var isTabNext = function isTabNext(event) {
	  return (event.key ? event.key === "Tab" : event.keyCode === KeyCodes.TAB) && !hasModifierKeys(event);
	};

	var isTabPrevious = function isTabPrevious(event) {
	  return (event.key ? event.key === "Tab" : event.keyCode === KeyCodes.TAB) && checkModifierKeys(event,
	  /* Ctrl */
	  false,
	  /* Alt */
	  false,
	  /* Shift */
	  true);
	};

	var isBackSpace = function isBackSpace(event) {
	  return (event.key ? event.key === "Backspace" : event.keyCode === KeyCodes.BACKSPACE) && !hasModifierKeys(event);
	};

	var isShow = function isShow(event) {
	  if (event.key) {
	    return isF4(event) || isShowByArrows(event);
	  }

	  return event.keyCode === KeyCodes.F4 && !hasModifierKeys(event) || event.keyCode === KeyCodes.ARROW_DOWN && checkModifierKeys(event,
	  /* Ctrl */
	  false,
	  /* Alt */
	  true,
	  /* Shift */
	  false);
	};

	var isF4 = function isF4(event) {
	  return event.key === "F4" && !hasModifierKeys(event);
	};

	var isShowByArrows = function isShowByArrows(event) {
	  return (event.key === "ArrowDown" || event.key === "Down" || event.key === "ArrowUp" || event.key === "Up") && checkModifierKeys(event,
	  /* Ctrl */
	  false,
	  /* Alt */
	  true,
	  /* Shift */
	  false);
	};

	var hasModifierKeys = function hasModifierKeys(event) {
	  return event.shiftKey || event.altKey || getCtrlKey(event);
	};

	var getCtrlKey = function getCtrlKey(event) {
	  return !!(event.metaKey || event.ctrlKey);
	}; // double negation doesn't have effect on boolean but ensures null and undefined are equivalent to false.


	var checkModifierKeys = function checkModifierKeys(event, bCtrlKey, bAltKey, bShiftKey) {
	  return event.shiftKey === bShiftKey && event.altKey === bAltKey && getCtrlKey(event) === bCtrlKey;
	};

	exports.isEnter = isEnter;
	exports.isSpace = isSpace;
	exports.isDown = isDown;
	exports.isRight = isRight;
	exports.isUp = isUp;
	exports.isLeft = isLeft;
	exports.isTabNext = isTabNext;
	exports.isTabPrevious = isTabPrevious;
	exports.isShow = isShow;
	exports.isF4 = isF4;
	exports.isEscape = isEscape;
	exports.isHome = isHome;
	exports.isEnd = isEnd;
	exports.isBackSpace = isBackSpace;

});
//# sourceMappingURL=chunk-57e79e7c.js.map
