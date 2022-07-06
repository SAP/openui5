sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/hint', './v4/hint'], function (exports, Theme, hint$1, hint$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? hint$1.pathData : hint$2.pathData;
	var hint = "hint";

	exports.accData = hint$1.accData;
	exports.ltr = hint$1.ltr;
	exports.default = hint;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
