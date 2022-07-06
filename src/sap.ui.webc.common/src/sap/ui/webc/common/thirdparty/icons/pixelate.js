sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/pixelate', './v4/pixelate'], function (exports, Theme, pixelate$1, pixelate$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? pixelate$1.pathData : pixelate$2.pathData;
	var pixelate = "pixelate";

	exports.accData = pixelate$1.accData;
	exports.ltr = pixelate$1.ltr;
	exports.default = pixelate;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
