sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/tags', './v4/tags'], function (exports, Theme, tags$1, tags$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? tags$1.pathData : tags$2.pathData;
	var tags = "tags";

	exports.accData = tags$1.accData;
	exports.ltr = tags$1.ltr;
	exports.default = tags;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
