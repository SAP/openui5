sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/map', './v4/map'], function (exports, Theme, map$1, map$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? map$1.pathData : map$2.pathData;
	var map = "map";

	exports.accData = map$1.accData;
	exports.ltr = map$1.ltr;
	exports.default = map;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
