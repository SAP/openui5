sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/shortcut', './v4/shortcut'], function (exports, Theme, shortcut$1, shortcut$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? shortcut$1.pathData : shortcut$2.pathData;
	var shortcut = "shortcut";

	exports.accData = shortcut$1.accData;
	exports.ltr = shortcut$1.ltr;
	exports.default = shortcut;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
