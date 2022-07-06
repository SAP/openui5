sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/responsive', './v4/responsive'], function (exports, Theme, responsive$1, responsive$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? responsive$1.pathData : responsive$2.pathData;
	var responsive = "responsive";

	exports.accData = responsive$1.accData;
	exports.ltr = responsive$1.ltr;
	exports.default = responsive;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
