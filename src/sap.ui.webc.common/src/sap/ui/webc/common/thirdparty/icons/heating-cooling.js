sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/heating-cooling', './v4/heating-cooling'], function (exports, Theme, heatingCooling$1, heatingCooling$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? heatingCooling$1.pathData : heatingCooling$2.pathData;
	var heatingCooling = "heating-cooling";

	exports.accData = heatingCooling$1.accData;
	exports.ltr = heatingCooling$1.ltr;
	exports.default = heatingCooling;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
