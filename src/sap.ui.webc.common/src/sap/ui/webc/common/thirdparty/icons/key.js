sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/key', './v4/key'], function (exports, Theme, key$1, key$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? key$1.pathData : key$2.pathData;
	var key = "key";

	exports.accData = key$1.accData;
	exports.ltr = key$1.ltr;
	exports.default = key;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
