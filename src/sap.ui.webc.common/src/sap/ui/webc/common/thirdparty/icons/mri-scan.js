sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/mri-scan', './v4/mri-scan'], function (exports, Theme, mriScan$1, mriScan$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? mriScan$1.pathData : mriScan$2.pathData;
	var mriScan = "mri-scan";

	exports.accData = mriScan$1.accData;
	exports.ltr = mriScan$1.ltr;
	exports.default = mriScan;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
