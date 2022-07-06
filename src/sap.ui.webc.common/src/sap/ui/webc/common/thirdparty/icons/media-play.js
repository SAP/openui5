sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/media-play', './v4/media-play'], function (exports, Theme, mediaPlay$1, mediaPlay$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? mediaPlay$1.pathData : mediaPlay$2.pathData;
	var mediaPlay = "media-play";

	exports.accData = mediaPlay$1.accData;
	exports.ltr = mediaPlay$1.ltr;
	exports.default = mediaPlay;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
