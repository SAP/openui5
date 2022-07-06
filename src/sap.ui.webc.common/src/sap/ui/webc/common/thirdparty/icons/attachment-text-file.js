sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/attachment-text-file', './v4/attachment-text-file'], function (exports, Theme, attachmentTextFile$1, attachmentTextFile$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? attachmentTextFile$1.pathData : attachmentTextFile$2.pathData;
	var attachmentTextFile = "attachment-text-file";

	exports.accData = attachmentTextFile$1.accData;
	exports.ltr = attachmentTextFile$1.ltr;
	exports.default = attachmentTextFile;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
