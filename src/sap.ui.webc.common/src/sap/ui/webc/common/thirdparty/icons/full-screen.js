sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/full-screen', './v4/full-screen'], function (exports, Theme, fullScreen$1, fullScreen$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? fullScreen$1.pathData : fullScreen$2.pathData;
	var fullScreen = "full-screen";

	exports.accData = fullScreen$1.accData;
	exports.ltr = fullScreen$1.ltr;
	exports.default = fullScreen;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
