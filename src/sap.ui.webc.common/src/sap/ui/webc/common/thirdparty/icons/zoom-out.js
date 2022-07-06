sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/zoom-out', './v4/zoom-out'], function (exports, Theme, zoomOut$1, zoomOut$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? zoomOut$1.pathData : zoomOut$2.pathData;
	var zoomOut = "zoom-out";

	exports.accData = zoomOut$1.accData;
	exports.ltr = zoomOut$1.ltr;
	exports.default = zoomOut;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
