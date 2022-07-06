sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/sys-first-page', './v4/sys-first-page'], function (exports, Theme, sysFirstPage$1, sysFirstPage$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? sysFirstPage$1.pathData : sysFirstPage$2.pathData;
	var sysFirstPage = "sys-first-page";

	exports.accData = sysFirstPage$1.accData;
	exports.ltr = sysFirstPage$1.ltr;
	exports.default = sysFirstPage;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
