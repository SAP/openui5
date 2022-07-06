sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/expand-group', './v4/expand-group'], function (exports, Theme, expandGroup$1, expandGroup$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? expandGroup$1.pathData : expandGroup$2.pathData;
	var expandGroup = "expand-group";

	exports.accData = expandGroup$1.accData;
	exports.ltr = expandGroup$1.ltr;
	exports.default = expandGroup;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
