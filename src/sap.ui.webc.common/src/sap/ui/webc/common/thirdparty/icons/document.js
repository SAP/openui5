sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/document', './v4/document'], function (exports, Theme, document$1, document$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? document$1.pathData : document$2.pathData;
	var document = "document";

	exports.accData = document$1.accData;
	exports.ltr = document$1.ltr;
	exports.default = document;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
