sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/megamenu', './v4/megamenu'], function (exports, Theme, megamenu$1, megamenu$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? megamenu$1.pathData : megamenu$2.pathData;
	var megamenu = "megamenu";

	exports.accData = megamenu$1.accData;
	exports.ltr = megamenu$1.ltr;
	exports.default = megamenu;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
