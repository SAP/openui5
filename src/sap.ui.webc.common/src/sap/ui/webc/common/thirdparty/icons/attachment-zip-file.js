sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/attachment-zip-file', './v4/attachment-zip-file'], function (exports, Theme, attachmentZipFile$1, attachmentZipFile$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? attachmentZipFile$1.pathData : attachmentZipFile$2.pathData;
	var attachmentZipFile = "attachment-zip-file";

	exports.accData = attachmentZipFile$1.accData;
	exports.ltr = attachmentZipFile$1.ltr;
	exports.default = attachmentZipFile;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
