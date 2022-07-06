sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/favorite-list', './v4/favorite-list'], function (exports, Theme, favoriteList$1, favoriteList$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? favoriteList$1.pathData : favoriteList$2.pathData;
	var favoriteList = "favorite-list";

	exports.accData = favoriteList$1.accData;
	exports.ltr = favoriteList$1.ltr;
	exports.default = favoriteList;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
