sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/role', './v4/role'], function (exports, Theme, role$1, role$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? role$1.pathData : role$2.pathData;
	var role = "role";

	exports.accData = role$1.accData;
	exports.ltr = role$1.ltr;
	exports.default = role;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
