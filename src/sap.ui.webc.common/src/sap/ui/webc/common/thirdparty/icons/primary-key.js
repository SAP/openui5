sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/primary-key', './v4/primary-key'], function (exports, Theme, primaryKey$1, primaryKey$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? primaryKey$1.pathData : primaryKey$2.pathData;
	var primaryKey = "primary-key";

	exports.accData = primaryKey$1.accData;
	exports.ltr = primaryKey$1.ltr;
	exports.default = primaryKey;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
