sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/map-3', './v4/map-3'], function (exports, Theme, map3$1, map3$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? map3$1.pathData : map3$2.pathData;
	var map3 = "map-3";

	exports.accData = map3$1.accData;
	exports.ltr = map3$1.ltr;
	exports.default = map3;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
