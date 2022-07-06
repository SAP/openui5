sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/write-new-document', './v4/write-new-document'], function (exports, Theme, writeNewDocument$1, writeNewDocument$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? writeNewDocument$1.pathData : writeNewDocument$2.pathData;
	var writeNewDocument = "write-new-document";

	exports.accData = writeNewDocument$1.accData;
	exports.ltr = writeNewDocument$1.ltr;
	exports.default = writeNewDocument;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
