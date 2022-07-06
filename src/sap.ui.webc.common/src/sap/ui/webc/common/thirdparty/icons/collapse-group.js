sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/collapse-group', './v4/collapse-group'], function (exports, Theme, collapseGroup$1, collapseGroup$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? collapseGroup$1.pathData : collapseGroup$2.pathData;
	var collapseGroup = "collapse-group";

	exports.accData = collapseGroup$1.accData;
	exports.ltr = collapseGroup$1.ltr;
	exports.default = collapseGroup;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
