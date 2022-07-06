sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/heart-2', './v4/heart-2'], function (exports, Theme, heart2$1, heart2$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? heart2$1.pathData : heart2$2.pathData;
	var heart2 = "heart-2";

	exports.accData = heart2$1.accData;
	exports.ltr = heart2$1.ltr;
	exports.default = heart2;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
