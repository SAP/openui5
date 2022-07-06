sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/unfavorite', './v4/unfavorite'], function (exports, Theme, unfavorite$1, unfavorite$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? unfavorite$1.pathData : unfavorite$2.pathData;
	var unfavorite = "unfavorite";

	exports.accData = unfavorite$1.accData;
	exports.ltr = unfavorite$1.ltr;
	exports.default = unfavorite;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
