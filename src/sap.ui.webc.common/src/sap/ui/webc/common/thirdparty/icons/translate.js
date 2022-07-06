sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/translate', './v4/translate'], function (exports, Theme, translate$1, translate$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? translate$1.pathData : translate$2.pathData;
	var translate = "translate";

	exports.accData = translate$1.accData;
	exports.ltr = translate$1.ltr;
	exports.default = translate;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
