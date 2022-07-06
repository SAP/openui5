sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/broken-link', './v4/broken-link'], function (exports, Theme, brokenLink$1, brokenLink$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? brokenLink$1.pathData : brokenLink$2.pathData;
	var brokenLink = "broken-link";

	exports.accData = brokenLink$1.accData;
	exports.ltr = brokenLink$1.ltr;
	exports.default = brokenLink;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
