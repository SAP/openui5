sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/add-document', './v4/add-document'], function (exports, Theme, addDocument$1, addDocument$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? addDocument$1.pathData : addDocument$2.pathData;
	var addDocument = "add-document";

	exports.accData = addDocument$1.accData;
	exports.ltr = addDocument$1.ltr;
	exports.default = addDocument;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
