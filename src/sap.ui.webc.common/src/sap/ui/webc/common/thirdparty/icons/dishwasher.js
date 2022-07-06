sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/dishwasher', './v4/dishwasher'], function (exports, Theme, dishwasher$1, dishwasher$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? dishwasher$1.pathData : dishwasher$2.pathData;
	var dishwasher = "dishwasher";

	exports.accData = dishwasher$1.accData;
	exports.ltr = dishwasher$1.ltr;
	exports.default = dishwasher;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
