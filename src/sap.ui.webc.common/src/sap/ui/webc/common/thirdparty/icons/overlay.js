sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/overlay', './v4/overlay'], function (exports, Theme, overlay$1, overlay$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? overlay$1.pathData : overlay$2.pathData;
	var overlay = "overlay";

	exports.accData = overlay$1.accData;
	exports.ltr = overlay$1.ltr;
	exports.default = overlay;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
