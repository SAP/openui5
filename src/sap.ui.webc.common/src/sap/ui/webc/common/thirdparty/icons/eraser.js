sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/eraser', './v4/eraser'], function (exports, Theme, eraser$1, eraser$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? eraser$1.pathData : eraser$2.pathData;
	var eraser = "eraser";

	exports.accData = eraser$1.accData;
	exports.ltr = eraser$1.ltr;
	exports.default = eraser;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
