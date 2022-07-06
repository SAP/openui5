sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/user-edit', './v4/user-edit'], function (exports, Theme, userEdit$1, userEdit$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? userEdit$1.pathData : userEdit$2.pathData;
	var userEdit = "user-edit";

	exports.accData = userEdit$1.accData;
	exports.ltr = userEdit$1.ltr;
	exports.default = userEdit;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
