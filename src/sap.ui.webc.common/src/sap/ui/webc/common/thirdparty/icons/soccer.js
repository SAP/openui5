sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/soccer', './v4/soccer'], function (exports, Theme, soccer$1, soccer$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? soccer$1.pathData : soccer$2.pathData;
	var soccer = "soccer";

	exports.accData = soccer$1.accData;
	exports.ltr = soccer$1.ltr;
	exports.default = soccer;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
