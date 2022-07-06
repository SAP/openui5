sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/video', './v4/video'], function (exports, Theme, video$1, video$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? video$1.pathData : video$2.pathData;
	var video = "video";

	exports.accData = video$1.accData;
	exports.ltr = video$1.ltr;
	exports.default = video;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
