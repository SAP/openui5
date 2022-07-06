sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/heart', './v4/heart'], function (exports, Theme, heart$1, heart$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? heart$1.pathData : heart$2.pathData;
	var heart = "heart";

	exports.accData = heart$1.accData;
	exports.ltr = heart$1.ltr;
	exports.default = heart;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
