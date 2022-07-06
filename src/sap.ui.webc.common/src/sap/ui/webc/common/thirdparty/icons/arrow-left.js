sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/arrow-left', './v4/arrow-left'], function (exports, Theme, arrowLeft$1, arrowLeft$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? arrowLeft$1.pathData : arrowLeft$2.pathData;
	var arrowLeft = "arrow-left";

	exports.accData = arrowLeft$1.accData;
	exports.ltr = arrowLeft$1.ltr;
	exports.default = arrowLeft;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
