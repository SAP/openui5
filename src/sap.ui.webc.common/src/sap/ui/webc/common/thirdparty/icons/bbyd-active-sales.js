sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/bbyd-active-sales', './v4/bbyd-active-sales'], function (exports, Theme, bbydActiveSales$1, bbydActiveSales$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? bbydActiveSales$1.pathData : bbydActiveSales$2.pathData;
	var bbydActiveSales = "bbyd-active-sales";

	exports.accData = bbydActiveSales$1.accData;
	exports.ltr = bbydActiveSales$1.ltr;
	exports.default = bbydActiveSales;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
