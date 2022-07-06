sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/bold-text', './v4/bold-text'], function (exports, Theme, boldText$1, boldText$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? boldText$1.pathData : boldText$2.pathData;
	var boldText = "bold-text";

	exports.accData = boldText$1.accData;
	exports.ltr = boldText$1.ltr;
	exports.default = boldText;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
