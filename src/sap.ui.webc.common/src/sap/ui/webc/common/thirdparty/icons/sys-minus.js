sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/sys-minus', './v4/sys-minus'], function (exports, Theme, sysMinus$1, sysMinus$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? sysMinus$1.pathData : sysMinus$2.pathData;
	var sysMinus = "sys-minus";

	exports.accData = sysMinus$1.accData;
	exports.ltr = sysMinus$1.ltr;
	exports.default = sysMinus;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
