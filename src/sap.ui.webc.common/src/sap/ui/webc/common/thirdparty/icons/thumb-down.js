sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/thumb-down', './v4/thumb-down'], function (exports, Theme, thumbDown$1, thumbDown$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? thumbDown$1.pathData : thumbDown$2.pathData;
	var thumbDown = "thumb-down";

	exports.accData = thumbDown$1.accData;
	exports.ltr = thumbDown$1.ltr;
	exports.default = thumbDown;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
