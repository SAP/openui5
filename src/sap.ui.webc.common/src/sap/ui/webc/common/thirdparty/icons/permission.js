sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/permission', './v4/permission'], function (exports, Theme, permission$1, permission$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? permission$1.pathData : permission$2.pathData;
	var permission = "permission";

	exports.accData = permission$1.accData;
	exports.ltr = permission$1.ltr;
	exports.default = permission;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
