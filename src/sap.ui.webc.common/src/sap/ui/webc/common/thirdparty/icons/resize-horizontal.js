sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/resize-horizontal', './v4/resize-horizontal'], function (exports, Theme, resizeHorizontal$1, resizeHorizontal$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? resizeHorizontal$1.pathData : resizeHorizontal$2.pathData;
	var resizeHorizontal = "resize-horizontal";

	exports.accData = resizeHorizontal$1.accData;
	exports.ltr = resizeHorizontal$1.ltr;
	exports.default = resizeHorizontal;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
