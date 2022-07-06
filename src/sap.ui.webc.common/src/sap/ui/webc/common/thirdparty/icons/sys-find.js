sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/sys-find', './v4/sys-find'], function (exports, Theme, sysFind$1, sysFind$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? sysFind$1.pathData : sysFind$2.pathData;
	var sysFind = "sys-find";

	exports.accData = sysFind$1.accData;
	exports.ltr = sysFind$1.ltr;
	exports.default = sysFind;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
