sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/media-rewind', './v4/media-rewind'], function (exports, Theme, mediaRewind$1, mediaRewind$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? mediaRewind$1.pathData : mediaRewind$2.pathData;
	var mediaRewind = "media-rewind";

	exports.accData = mediaRewind$1.accData;
	exports.ltr = mediaRewind$1.ltr;
	exports.default = mediaRewind;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
