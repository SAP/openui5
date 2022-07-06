sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/sap-box', './v4/sap-box'], function (exports, Theme, sapBox$1, sapBox$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? sapBox$1.pathData : sapBox$2.pathData;
	var sapBox = "sap-box";

	exports.accData = sapBox$1.accData;
	exports.ltr = sapBox$1.ltr;
	exports.default = sapBox;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
