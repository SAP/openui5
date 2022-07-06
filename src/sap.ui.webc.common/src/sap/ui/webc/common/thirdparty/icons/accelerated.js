sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/accelerated', './v4/accelerated'], function (exports, Theme, accelerated$1, accelerated$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? accelerated$1.pathData : accelerated$2.pathData;
	var accelerated = "accelerated";

	exports.accData = accelerated$1.accData;
	exports.ltr = accelerated$1.ltr;
	exports.default = accelerated;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
