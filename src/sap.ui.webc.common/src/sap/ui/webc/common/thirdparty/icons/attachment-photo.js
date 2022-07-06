sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/attachment-photo', './v4/attachment-photo'], function (exports, Theme, attachmentPhoto$1, attachmentPhoto$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? attachmentPhoto$1.pathData : attachmentPhoto$2.pathData;
	var attachmentPhoto = "attachment-photo";

	exports.accData = attachmentPhoto$1.accData;
	exports.ltr = attachmentPhoto$1.ltr;
	exports.default = attachmentPhoto;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
