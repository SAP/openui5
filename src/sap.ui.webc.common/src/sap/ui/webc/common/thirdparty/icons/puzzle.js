sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/puzzle', './v4/puzzle'], function (exports, Theme, puzzle$1, puzzle$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? puzzle$1.pathData : puzzle$2.pathData;
	var puzzle = "puzzle";

	exports.accData = puzzle$1.accData;
	exports.ltr = puzzle$1.ltr;
	exports.default = puzzle;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
