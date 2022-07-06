sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/filter-fields', './v4/filter-fields'], function (exports, Theme, filterFields$1, filterFields$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? filterFields$1.pathData : filterFields$2.pathData;
	var filterFields = "filter-fields";

	exports.accData = filterFields$1.accData;
	exports.ltr = filterFields$1.ltr;
	exports.default = filterFields;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
