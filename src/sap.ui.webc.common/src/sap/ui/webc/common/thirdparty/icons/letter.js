sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/letter', './v4/letter'], function (exports, Theme, letter$1, letter$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? letter$1.pathData : letter$2.pathData;
	var letter = "letter";

	exports.accData = letter$1.accData;
	exports.ltr = letter$1.ltr;
	exports.default = letter;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
