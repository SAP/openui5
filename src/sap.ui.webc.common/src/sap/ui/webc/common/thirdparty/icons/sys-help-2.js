sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/sys-help-2', './v4/sys-help-2'], function (exports, Theme, sysHelp2$1, sysHelp2$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? sysHelp2$1.pathData : sysHelp2$2.pathData;
	var sysHelp2 = "sys-help-2";

	exports.accData = sysHelp2$1.accData;
	exports.ltr = sysHelp2$1.ltr;
	exports.default = sysHelp2;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
