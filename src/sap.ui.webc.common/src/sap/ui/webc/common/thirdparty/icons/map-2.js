sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/map-2', './v4/map-2'], function (exports, Theme, map2$1, map2$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? map2$1.pathData : map2$2.pathData;
	var map2 = "map-2";

	exports.accData = map2$1.accData;
	exports.ltr = map2$1.ltr;
	exports.default = map2;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
