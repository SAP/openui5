sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/media-reverse', './v4/media-reverse'], function (exports, Theme, mediaReverse$1, mediaReverse$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? mediaReverse$1.pathData : mediaReverse$2.pathData;
	var mediaReverse = "media-reverse";

	exports.accData = mediaReverse$1.accData;
	exports.ltr = mediaReverse$1.ltr;
	exports.default = mediaReverse;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
