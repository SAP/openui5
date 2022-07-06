sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/sys-last-page', './v4/sys-last-page'], function (exports, Theme, sysLastPage$1, sysLastPage$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? sysLastPage$1.pathData : sysLastPage$2.pathData;
	var sysLastPage = "sys-last-page";

	exports.accData = sysLastPage$1.accData;
	exports.ltr = sysLastPage$1.ltr;
	exports.default = sysLastPage;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
