sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/pool', './v4/pool'], function (exports, Theme, pool$1, pool$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? pool$1.pathData : pool$2.pathData;
	var pool = "pool";

	exports.accData = pool$1.accData;
	exports.ltr = pool$1.ltr;
	exports.default = pool;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
