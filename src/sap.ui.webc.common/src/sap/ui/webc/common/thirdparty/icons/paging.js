sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/paging', './v4/paging'], function (exports, Theme, paging$1, paging$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? paging$1.pathData : paging$2.pathData;
	var paging = "paging";

	exports.accData = paging$1.accData;
	exports.ltr = paging$1.ltr;
	exports.default = paging;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
