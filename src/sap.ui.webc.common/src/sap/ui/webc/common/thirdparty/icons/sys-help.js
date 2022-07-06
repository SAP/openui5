sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/sys-help', './v4/sys-help'], function (exports, Theme, sysHelp$1, sysHelp$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? sysHelp$1.pathData : sysHelp$2.pathData;
	var sysHelp = "sys-help";

	exports.accData = sysHelp$1.accData;
	exports.ltr = sysHelp$1.ltr;
	exports.default = sysHelp;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
