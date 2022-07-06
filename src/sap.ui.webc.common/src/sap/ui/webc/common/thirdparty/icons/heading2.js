sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/heading2', './v4/heading2'], function (exports, Theme, heading2$1, heading2$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? heading2$1.pathData : heading2$2.pathData;
	var heading2 = "heading2";

	exports.accData = heading2$1.accData;
	exports.ltr = heading2$1.ltr;
	exports.default = heading2;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
