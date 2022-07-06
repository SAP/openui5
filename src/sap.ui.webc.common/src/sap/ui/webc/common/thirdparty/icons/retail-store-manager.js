sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/retail-store-manager', './v4/retail-store-manager'], function (exports, Theme, retailStoreManager$1, retailStoreManager$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? retailStoreManager$1.pathData : retailStoreManager$2.pathData;
	var retailStoreManager = "retail-store-manager";

	exports.accData = retailStoreManager$1.accData;
	exports.ltr = retailStoreManager$1.ltr;
	exports.default = retailStoreManager;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
