sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/collapse', './v4/collapse'], function (exports, Theme, collapse$1, collapse$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? collapse$1.pathData : collapse$2.pathData;
	var collapse = "collapse";

	exports.accData = collapse$1.accData;
	exports.ltr = collapse$1.ltr;
	exports.default = collapse;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
