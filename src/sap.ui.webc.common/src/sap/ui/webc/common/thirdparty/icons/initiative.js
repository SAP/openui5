sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/initiative', './v4/initiative'], function (exports, Theme, initiative$1, initiative$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? initiative$1.pathData : initiative$2.pathData;
	var initiative = "initiative";

	exports.accData = initiative$1.accData;
	exports.ltr = initiative$1.ltr;
	exports.default = initiative;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
