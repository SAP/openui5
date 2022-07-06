sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/suitcase', './v4/suitcase'], function (exports, Theme, suitcase$1, suitcase$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? suitcase$1.pathData : suitcase$2.pathData;
	var suitcase = "suitcase";

	exports.accData = suitcase$1.accData;
	exports.ltr = suitcase$1.ltr;
	exports.default = suitcase;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
