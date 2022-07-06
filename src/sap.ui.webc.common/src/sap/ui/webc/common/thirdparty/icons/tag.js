sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/tag', './v4/tag'], function (exports, Theme, tag$1, tag$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? tag$1.pathData : tag$2.pathData;
	var tag = "tag";

	exports.accData = tag$1.accData;
	exports.ltr = tag$1.ltr;
	exports.default = tag;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
