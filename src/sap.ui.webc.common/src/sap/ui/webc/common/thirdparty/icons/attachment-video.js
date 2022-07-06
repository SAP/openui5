sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/attachment-video', './v4/attachment-video'], function (exports, Theme, attachmentVideo$1, attachmentVideo$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? attachmentVideo$1.pathData : attachmentVideo$2.pathData;
	var attachmentVideo = "attachment-video";

	exports.accData = attachmentVideo$1.accData;
	exports.ltr = attachmentVideo$1.ltr;
	exports.default = attachmentVideo;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
