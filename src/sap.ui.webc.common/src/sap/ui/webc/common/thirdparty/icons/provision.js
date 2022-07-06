sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/provision', './v4/provision'], function (exports, Theme, provision$1, provision$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? provision$1.pathData : provision$2.pathData;
	var provision = "provision";

	exports.accData = provision$1.accData;
	exports.ltr = provision$1.ltr;
	exports.default = provision;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
