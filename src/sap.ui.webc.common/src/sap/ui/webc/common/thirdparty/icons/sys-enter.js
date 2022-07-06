sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/sys-enter', './v4/sys-enter'], function (exports, Theme, sysEnter$1, sysEnter$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? sysEnter$1.pathData : sysEnter$2.pathData;
	var sysEnter = "sys-enter";

	exports.accData = sysEnter$1.accData;
	exports.ltr = sysEnter$1.ltr;
	exports.default = sysEnter;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
