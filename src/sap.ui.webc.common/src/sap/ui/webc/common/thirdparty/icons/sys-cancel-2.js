sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/sys-cancel-2', './v4/sys-cancel-2'], function (exports, Theme, sysCancel2$1, sysCancel2$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? sysCancel2$1.pathData : sysCancel2$2.pathData;
	var sysCancel2 = "sys-cancel-2";

	exports.accData = sysCancel2$1.accData;
	exports.ltr = sysCancel2$1.ltr;
	exports.default = sysCancel2;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
