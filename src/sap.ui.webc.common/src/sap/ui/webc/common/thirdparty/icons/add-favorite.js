sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/add-favorite', './v4/add-favorite'], function (exports, Theme, addFavorite$1, addFavorite$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? addFavorite$1.pathData : addFavorite$2.pathData;
	var addFavorite = "add-favorite";

	exports.accData = addFavorite$1.accData;
	exports.ltr = addFavorite$1.ltr;
	exports.default = addFavorite;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
