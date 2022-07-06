sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/addresses', './v4/addresses'], function (exports, Theme, addresses$1, addresses$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? addresses$1.pathData : addresses$2.pathData;
	var addresses = "addresses";

	exports.accData = addresses$1.accData;
	exports.ltr = addresses$1.ltr;
	exports.default = addresses;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
