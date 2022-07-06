sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/factory', './v4/factory'], function (exports, Theme, factory$1, factory$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? factory$1.pathData : factory$2.pathData;
	var factory = "factory";

	exports.accData = factory$1.accData;
	exports.ltr = factory$1.ltr;
	exports.default = factory;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
