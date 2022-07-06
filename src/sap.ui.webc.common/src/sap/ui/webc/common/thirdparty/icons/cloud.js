sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/cloud', './v4/cloud'], function (exports, Theme, cloud$1, cloud$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? cloud$1.pathData : cloud$2.pathData;
	var cloud = "cloud";

	exports.accData = cloud$1.accData;
	exports.ltr = cloud$1.ltr;
	exports.default = cloud;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
