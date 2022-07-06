sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/laptop', './v4/laptop'], function (exports, Theme, laptop$1, laptop$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? laptop$1.pathData : laptop$2.pathData;
	var laptop = "laptop";

	exports.accData = laptop$1.accData;
	exports.ltr = laptop$1.ltr;
	exports.default = laptop;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
