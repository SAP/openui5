sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/group', './v4/group'], function (exports, Theme, group$1, group$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? group$1.pathData : group$2.pathData;
	var group = "group";

	exports.accData = group$1.accData;
	exports.ltr = group$1.ltr;
	exports.default = group;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
