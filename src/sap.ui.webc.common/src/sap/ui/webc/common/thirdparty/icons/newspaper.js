sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/newspaper', './v4/newspaper'], function (exports, Theme, newspaper$1, newspaper$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? newspaper$1.pathData : newspaper$2.pathData;
	var newspaper = "newspaper";

	exports.accData = newspaper$1.accData;
	exports.ltr = newspaper$1.ltr;
	exports.default = newspaper;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
