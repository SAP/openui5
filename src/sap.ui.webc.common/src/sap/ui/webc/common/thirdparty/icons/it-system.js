sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/it-system', './v4/it-system'], function (exports, Theme, itSystem$1, itSystem$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? itSystem$1.pathData : itSystem$2.pathData;
	var itSystem = "it-system";

	exports.accData = itSystem$1.accData;
	exports.ltr = itSystem$1.ltr;
	exports.default = itSystem;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
