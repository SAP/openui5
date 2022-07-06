sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/less', './v4/less'], function (exports, Theme, less$1, less$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? less$1.pathData : less$2.pathData;
	var less = "less";

	exports.accData = less$1.accData;
	exports.ltr = less$1.ltr;
	exports.default = less;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
