sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/blank-tag', './v4/blank-tag'], function (exports, Theme, blankTag$1, blankTag$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? blankTag$1.pathData : blankTag$2.pathData;
	var blankTag = "blank-tag";

	exports.accData = blankTag$1.accData;
	exports.ltr = blankTag$1.ltr;
	exports.default = blankTag;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
