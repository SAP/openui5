sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/collections-insight', './v4/collections-insight'], function (exports, Theme, collectionsInsight$1, collectionsInsight$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? collectionsInsight$1.pathData : collectionsInsight$2.pathData;
	var collectionsInsight = "collections-insight";

	exports.accData = collectionsInsight$1.accData;
	exports.ltr = collectionsInsight$1.ltr;
	exports.default = collectionsInsight;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
