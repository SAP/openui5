sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/sys-prev-page', './v4/sys-prev-page'], function (exports, Theme, sysPrevPage$1, sysPrevPage$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? sysPrevPage$1.pathData : sysPrevPage$2.pathData;
	var sysPrevPage = "sys-prev-page";

	exports.accData = sysPrevPage$1.accData;
	exports.ltr = sysPrevPage$1.ltr;
	exports.default = sysPrevPage;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
