sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/collections-management', './v4/collections-management'], function (exports, Theme, collectionsManagement$1, collectionsManagement$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? collectionsManagement$1.pathData : collectionsManagement$2.pathData;
	var collectionsManagement = "collections-management";

	exports.accData = collectionsManagement$1.accData;
	exports.ltr = collectionsManagement$1.ltr;
	exports.default = collectionsManagement;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
