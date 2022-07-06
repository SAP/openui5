sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/image-viewer', './v4/image-viewer'], function (exports, Theme, imageViewer$1, imageViewer$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? imageViewer$1.pathData : imageViewer$2.pathData;
	var imageViewer = "image-viewer";

	exports.accData = imageViewer$1.accData;
	exports.ltr = imageViewer$1.ltr;
	exports.default = imageViewer;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
