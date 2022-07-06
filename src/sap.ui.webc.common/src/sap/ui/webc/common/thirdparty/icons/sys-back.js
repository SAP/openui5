sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/sys-back', './v4/sys-back'], function (exports, Theme, sysBack$1, sysBack$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? sysBack$1.pathData : sysBack$2.pathData;
	var sysBack = "sys-back";

	exports.accData = sysBack$1.accData;
	exports.ltr = sysBack$1.ltr;
	exports.default = sysBack;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
