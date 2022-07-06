sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/zoom-in', './v4/zoom-in'], function (exports, Theme, zoomIn$1, zoomIn$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? zoomIn$1.pathData : zoomIn$2.pathData;
	var zoomIn = "zoom-in";

	exports.accData = zoomIn$1.accData;
	exports.ltr = zoomIn$1.ltr;
	exports.default = zoomIn;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
