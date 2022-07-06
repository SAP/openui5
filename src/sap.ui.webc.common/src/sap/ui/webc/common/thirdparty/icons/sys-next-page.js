sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/sys-next-page', './v4/sys-next-page'], function (exports, Theme, sysNextPage$1, sysNextPage$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? sysNextPage$1.pathData : sysNextPage$2.pathData;
	var sysNextPage = "sys-next-page";

	exports.accData = sysNextPage$1.accData;
	exports.ltr = sysNextPage$1.ltr;
	exports.default = sysNextPage;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
