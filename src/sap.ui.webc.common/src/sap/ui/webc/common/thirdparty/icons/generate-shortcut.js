sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/generate-shortcut', './v4/generate-shortcut'], function (exports, Theme, generateShortcut$1, generateShortcut$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? generateShortcut$1.pathData : generateShortcut$2.pathData;
	var generateShortcut = "generate-shortcut";

	exports.accData = generateShortcut$1.accData;
	exports.ltr = generateShortcut$1.ltr;
	exports.default = generateShortcut;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
