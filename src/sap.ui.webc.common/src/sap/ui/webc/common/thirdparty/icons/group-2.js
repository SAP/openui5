sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/group-2', './v4/group-2'], function (exports, Theme, group2$1, group2$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? group2$1.pathData : group2$2.pathData;
	var group2 = "group-2";

	exports.accData = group2$1.accData;
	exports.ltr = group2$1.ltr;
	exports.default = group2;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
