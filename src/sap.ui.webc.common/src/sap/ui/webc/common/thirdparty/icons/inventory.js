sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/inventory', './v4/inventory'], function (exports, Theme, inventory$1, inventory$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? inventory$1.pathData : inventory$2.pathData;
	var inventory = "inventory";

	exports.accData = inventory$1.accData;
	exports.ltr = inventory$1.ltr;
	exports.default = inventory;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
