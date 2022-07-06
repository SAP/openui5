sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/open-command-field', './v4/open-command-field'], function (exports, Theme, openCommandField$1, openCommandField$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? openCommandField$1.pathData : openCommandField$2.pathData;
	var openCommandField = "open-command-field";

	exports.accData = openCommandField$1.accData;
	exports.ltr = openCommandField$1.ltr;
	exports.default = openCommandField;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
