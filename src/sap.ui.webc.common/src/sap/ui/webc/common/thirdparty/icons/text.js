sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/text', './v4/text'], function (exports, Theme, text$1, text$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? text$1.pathData : text$2.pathData;
	var text = "text";

	exports.accData = text$1.accData;
	exports.ltr = text$1.ltr;
	exports.default = text;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
