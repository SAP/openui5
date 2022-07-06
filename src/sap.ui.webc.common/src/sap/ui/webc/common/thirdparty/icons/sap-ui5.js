sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/sap-ui5', './v4/sap-ui5'], function (exports, Theme, sapUi5$1, sapUi5$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? sapUi5$1.pathData : sapUi5$2.pathData;
	var sapUi5 = "sap-ui5";

	exports.accData = sapUi5$1.accData;
	exports.ltr = sapUi5$1.ltr;
	exports.default = sapUi5;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
