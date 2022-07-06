sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/documents', './v4/documents'], function (exports, Theme, documents$1, documents$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? documents$1.pathData : documents$2.pathData;
	var documents = "documents";

	exports.accData = documents$1.accData;
	exports.ltr = documents$1.ltr;
	exports.default = documents;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
