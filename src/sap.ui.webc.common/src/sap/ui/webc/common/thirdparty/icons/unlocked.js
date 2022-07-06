sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/unlocked', './v4/unlocked'], function (exports, Theme, unlocked$1, unlocked$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? unlocked$1.pathData : unlocked$2.pathData;
	var unlocked = "unlocked";

	exports.accData = unlocked$1.accData;
	exports.ltr = unlocked$1.ltr;
	exports.default = unlocked;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
