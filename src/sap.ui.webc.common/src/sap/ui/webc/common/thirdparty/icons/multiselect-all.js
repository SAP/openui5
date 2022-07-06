sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/multiselect-all', './v4/multiselect-all'], function (exports, Theme, multiselectAll$1, multiselectAll$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? multiselectAll$1.pathData : multiselectAll$2.pathData;
	var multiselectAll = "multiselect-all";

	exports.accData = multiselectAll$1.accData;
	exports.ltr = multiselectAll$1.ltr;
	exports.default = multiselectAll;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
