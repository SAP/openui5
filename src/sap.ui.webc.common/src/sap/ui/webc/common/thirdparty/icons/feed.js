sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/feed', './v4/feed'], function (exports, Theme, feed$1, feed$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? feed$1.pathData : feed$2.pathData;
	var feed = "feed";

	exports.accData = feed$1.accData;
	exports.ltr = feed$1.ltr;
	exports.default = feed;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
