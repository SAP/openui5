sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/media-pause', './v4/media-pause'], function (exports, Theme, mediaPause$1, mediaPause$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? mediaPause$1.pathData : mediaPause$2.pathData;
	var mediaPause = "media-pause";

	exports.accData = mediaPause$1.accData;
	exports.ltr = mediaPause$1.ltr;
	exports.default = mediaPause;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
