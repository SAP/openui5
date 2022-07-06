sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/upload-to-cloud', './v4/upload-to-cloud'], function (exports, Theme, uploadToCloud$1, uploadToCloud$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? uploadToCloud$1.pathData : uploadToCloud$2.pathData;
	var uploadToCloud = "upload-to-cloud";

	exports.accData = uploadToCloud$1.accData;
	exports.ltr = uploadToCloud$1.ltr;
	exports.default = uploadToCloud;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
