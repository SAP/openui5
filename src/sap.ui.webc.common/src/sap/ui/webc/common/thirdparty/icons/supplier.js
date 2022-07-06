sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/supplier', './v4/supplier'], function (exports, Theme, supplier$1, supplier$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? supplier$1.pathData : supplier$2.pathData;
	var supplier = "supplier";

	exports.accData = supplier$1.accData;
	exports.ltr = supplier$1.ltr;
	exports.default = supplier;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
