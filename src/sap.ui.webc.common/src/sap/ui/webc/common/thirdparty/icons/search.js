sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/search', './v4/search'], function (exports, Theme, search$1, search$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? search$1.pathData : search$2.pathData;
	var search = "search";

	exports.accData = search$1.accData;
	exports.ltr = search$1.ltr;
	exports.default = search;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
