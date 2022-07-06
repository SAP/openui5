sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/sys-cancel', './v4/sys-cancel'], function (exports, Theme, sysCancel$1, sysCancel$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? sysCancel$1.pathData : sysCancel$2.pathData;
	var sysCancel = "sys-cancel";

	exports.accData = sysCancel$1.accData;
	exports.ltr = sysCancel$1.ltr;
	exports.default = sysCancel;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
