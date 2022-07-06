sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/indent', './v4/indent'], function (exports, Theme, indent$1, indent$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? indent$1.pathData : indent$2.pathData;
	var indent = "indent";

	exports.accData = indent$1.accData;
	exports.ltr = indent$1.ltr;
	exports.default = indent;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
