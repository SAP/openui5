sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/heading3', './v4/heading3'], function (exports, Theme, heading3$1, heading3$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? heading3$1.pathData : heading3$2.pathData;
	var heading3 = "heading3";

	exports.accData = heading3$1.accData;
	exports.ltr = heading3$1.ltr;
	exports.default = heading3;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
