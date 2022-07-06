sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/alphabetical-order', './v4/alphabetical-order'], function (exports, Theme, alphabeticalOrder$1, alphabeticalOrder$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? alphabeticalOrder$1.pathData : alphabeticalOrder$2.pathData;
	var alphabeticalOrder = "alphabetical-order";

	exports.accData = alphabeticalOrder$1.accData;
	exports.ltr = alphabeticalOrder$1.ltr;
	exports.default = alphabeticalOrder;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
