sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/bullet-text', './v4/bullet-text'], function (exports, Theme, bulletText$1, bulletText$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? bulletText$1.pathData : bulletText$2.pathData;
	var bulletText = "bullet-text";

	exports.accData = bulletText$1.accData;
	exports.ltr = bulletText$1.ltr;
	exports.default = bulletText;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
