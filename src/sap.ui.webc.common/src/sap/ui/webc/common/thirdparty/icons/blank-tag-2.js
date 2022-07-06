sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/blank-tag-2', './v4/blank-tag-2'], function (exports, Theme, blankTag2$1, blankTag2$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? blankTag2$1.pathData : blankTag2$2.pathData;
	var blankTag2 = "blank-tag-2";

	exports.accData = blankTag2$1.accData;
	exports.ltr = blankTag2$1.ltr;
	exports.default = blankTag2;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
