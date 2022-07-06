sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/shield', './v4/shield'], function (exports, Theme, shield$1, shield$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? shield$1.pathData : shield$2.pathData;
	var shield = "shield";

	exports.accData = shield$1.accData;
	exports.ltr = shield$1.ltr;
	exports.default = shield;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
