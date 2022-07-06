sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/instance', './v4/instance'], function (exports, Theme, instance$1, instance$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? instance$1.pathData : instance$2.pathData;
	var instance = "instance";

	exports.accData = instance$1.accData;
	exports.ltr = instance$1.ltr;
	exports.default = instance;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
