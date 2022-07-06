sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/keyboard-and-mouse', './v4/keyboard-and-mouse'], function (exports, Theme, keyboardAndMouse$1, keyboardAndMouse$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? keyboardAndMouse$1.pathData : keyboardAndMouse$2.pathData;
	var keyboardAndMouse = "keyboard-and-mouse";

	exports.accData = keyboardAndMouse$1.accData;
	exports.ltr = keyboardAndMouse$1.ltr;
	exports.default = keyboardAndMouse;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
