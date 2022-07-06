sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/picture', './v4/picture'], function (exports, Theme, picture$1, picture$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? picture$1.pathData : picture$2.pathData;
	var picture = "picture";

	exports.accData = picture$1.accData;
	exports.ltr = picture$1.ltr;
	exports.default = picture;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
