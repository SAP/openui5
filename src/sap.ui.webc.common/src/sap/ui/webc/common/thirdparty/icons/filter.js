sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/filter', './v4/filter'], function (exports, Theme, filter$1, filter$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? filter$1.pathData : filter$2.pathData;
	var filter = "filter";

	exports.accData = filter$1.accData;
	exports.ltr = filter$1.ltr;
	exports.default = filter;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
