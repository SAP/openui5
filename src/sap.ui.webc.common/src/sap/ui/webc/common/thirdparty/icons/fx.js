sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/fx', './v4/fx'], function (exports, Theme, fx$1, fx$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? fx$1.pathData : fx$2.pathData;
	var fx = "fx";

	exports.accData = fx$1.accData;
	exports.ltr = fx$1.ltr;
	exports.default = fx;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
