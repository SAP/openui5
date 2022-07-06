sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/favorite', './v4/favorite'], function (exports, Theme, favorite$1, favorite$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? favorite$1.pathData : favorite$2.pathData;
	var favorite = "favorite";

	exports.accData = favorite$1.accData;
	exports.ltr = favorite$1.ltr;
	exports.default = favorite;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
