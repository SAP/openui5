sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/retail-store', './v4/retail-store'], function (exports, Theme, retailStore$1, retailStore$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? retailStore$1.pathData : retailStore$2.pathData;
	var retailStore = "retail-store";

	exports.accData = retailStore$1.accData;
	exports.ltr = retailStore$1.ltr;
	exports.default = retailStore;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
