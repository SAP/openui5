sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/create', './v4/create'], function (exports, Theme, create$1, create$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? create$1.pathData : create$2.pathData;
	var create = "create";

	exports.accData = create$1.accData;
	exports.ltr = create$1.ltr;
	exports.default = create;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
