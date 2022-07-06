sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/web-cam', './v4/web-cam'], function (exports, Theme, webCam$1, webCam$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? webCam$1.pathData : webCam$2.pathData;
	var webCam = "web-cam";

	exports.accData = webCam$1.accData;
	exports.ltr = webCam$1.ltr;
	exports.default = webCam;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
