sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/resize', './v4/resize'], function (exports, Theme, resize$1, resize$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? resize$1.pathData : resize$2.pathData;
	var resize = "resize";

	exports.accData = resize$1.accData;
	exports.ltr = resize$1.ltr;
	exports.default = resize;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
