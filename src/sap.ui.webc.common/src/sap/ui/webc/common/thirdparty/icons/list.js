sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/list', './v4/list'], function (exports, Theme, list$1, list$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? list$1.pathData : list$2.pathData;
	var list = "list";

	exports.accData = list$1.accData;
	exports.ltr = list$1.ltr;
	exports.default = list;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
