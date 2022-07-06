sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/functional-location', './v4/functional-location'], function (exports, Theme, functionalLocation$1, functionalLocation$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? functionalLocation$1.pathData : functionalLocation$2.pathData;
	var functionalLocation = "functional-location";

	exports.accData = functionalLocation$1.accData;
	exports.ltr = functionalLocation$1.ltr;
	exports.default = functionalLocation;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
