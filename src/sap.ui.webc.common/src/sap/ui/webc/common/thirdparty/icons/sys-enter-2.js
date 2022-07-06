sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/sys-enter-2', './v4/sys-enter-2'], function (exports, Theme, sysEnter2$1, sysEnter2$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? sysEnter2$1.pathData : sysEnter2$2.pathData;
	var sysEnter2 = "sys-enter-2";

	exports.accData = sysEnter2$1.accData;
	exports.ltr = sysEnter2$1.ltr;
	exports.default = sysEnter2;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
