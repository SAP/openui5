sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/media-forward', './v4/media-forward'], function (exports, Theme, mediaForward$1, mediaForward$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? mediaForward$1.pathData : mediaForward$2.pathData;
	var mediaForward = "media-forward";

	exports.accData = mediaForward$1.accData;
	exports.ltr = mediaForward$1.ltr;
	exports.default = mediaForward;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
