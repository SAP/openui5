sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/customize', './v4/customize'], function (exports, Theme, customize$1, customize$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? customize$1.pathData : customize$2.pathData;
	var customize = "customize";

	exports.accData = customize$1.accData;
	exports.ltr = customize$1.ltr;
	exports.default = customize;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
