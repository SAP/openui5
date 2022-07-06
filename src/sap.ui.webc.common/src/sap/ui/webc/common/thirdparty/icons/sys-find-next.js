sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/sys-find-next', './v4/sys-find-next'], function (exports, Theme, sysFindNext$1, sysFindNext$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? sysFindNext$1.pathData : sysFindNext$2.pathData;
	var sysFindNext = "sys-find-next";

	exports.accData = sysFindNext$1.accData;
	exports.ltr = sysFindNext$1.ltr;
	exports.default = sysFindNext;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
