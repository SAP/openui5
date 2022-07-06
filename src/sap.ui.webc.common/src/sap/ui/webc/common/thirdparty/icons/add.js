sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/add', './v4/add'], function (exports, Theme, add$1, add$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? add$1.pathData : add$2.pathData;
	var add = "add";

	exports.accData = add$1.accData;
	exports.ltr = add$1.ltr;
	exports.default = add;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
