sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/download-from-cloud', './v4/download-from-cloud'], function (exports, Theme, downloadFromCloud$1, downloadFromCloud$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? downloadFromCloud$1.pathData : downloadFromCloud$2.pathData;
	var downloadFromCloud = "download-from-cloud";

	exports.accData = downloadFromCloud$1.accData;
	exports.ltr = downloadFromCloud$1.ltr;
	exports.default = downloadFromCloud;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
