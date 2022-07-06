sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/paste', './v4/paste'], function (exports, Theme, paste$1, paste$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? paste$1.pathData : paste$2.pathData;
	var paste = "paste";

	exports.accData = paste$1.accData;
	exports.ltr = paste$1.ltr;
	exports.default = paste;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
