sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/sort', './v4/sort'], function (exports, Theme, sort$1, sort$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? sort$1.pathData : sort$2.pathData;
	var sort = "sort";

	exports.accData = sort$1.accData;
	exports.ltr = sort$1.ltr;
	exports.default = sort;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
