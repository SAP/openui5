sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/taxi', './v4/taxi'], function (exports, Theme, taxi$1, taxi$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? taxi$1.pathData : taxi$2.pathData;
	var taxi = "taxi";

	exports.accData = taxi$1.accData;
	exports.ltr = taxi$1.ltr;
	exports.default = taxi;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
