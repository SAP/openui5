sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/popup-window', './v4/popup-window'], function (exports, Theme, popupWindow$1, popupWindow$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? popupWindow$1.pathData : popupWindow$2.pathData;
	var popupWindow = "popup-window";

	exports.accData = popupWindow$1.accData;
	exports.ltr = popupWindow$1.ltr;
	exports.default = popupWindow;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
