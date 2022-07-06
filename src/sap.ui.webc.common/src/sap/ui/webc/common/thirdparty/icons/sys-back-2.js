sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/sys-back-2', './v4/sys-back-2'], function (exports, Theme, sysBack2$1, sysBack2$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? sysBack2$1.pathData : sysBack2$2.pathData;
	var sysBack2 = "sys-back-2";

	exports.accData = sysBack2$1.accData;
	exports.ltr = sysBack2$1.ltr;
	exports.default = sysBack2;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
