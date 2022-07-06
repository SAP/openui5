sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/lab', './v4/lab'], function (exports, Theme, lab$1, lab$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? lab$1.pathData : lab$2.pathData;
	var lab = "lab";

	exports.accData = lab$1.accData;
	exports.ltr = lab$1.ltr;
	exports.default = lab;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
