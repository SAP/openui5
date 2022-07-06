sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/resize-vertical', './v4/resize-vertical'], function (exports, Theme, resizeVertical$1, resizeVertical$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? resizeVertical$1.pathData : resizeVertical$2.pathData;
	var resizeVertical = "resize-vertical";

	exports.accData = resizeVertical$1.accData;
	exports.ltr = resizeVertical$1.ltr;
	exports.default = resizeVertical;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
