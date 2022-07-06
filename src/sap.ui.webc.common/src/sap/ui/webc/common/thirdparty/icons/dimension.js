sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/dimension', './v4/dimension'], function (exports, Theme, dimension$1, dimension$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? dimension$1.pathData : dimension$2.pathData;
	var dimension = "dimension";

	exports.accData = dimension$1.accData;
	exports.ltr = dimension$1.ltr;
	exports.default = dimension;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
