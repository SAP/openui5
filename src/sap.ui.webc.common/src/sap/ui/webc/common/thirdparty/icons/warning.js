sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/warning', './v4/warning'], function (exports, Theme, warning$1, warning$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? warning$1.pathData : warning$2.pathData;
	var warning = "warning";

	exports.accData = warning$1.accData;
	exports.ltr = warning$1.ltr;
	exports.default = warning;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
