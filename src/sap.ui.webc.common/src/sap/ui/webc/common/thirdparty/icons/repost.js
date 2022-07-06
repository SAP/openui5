sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/repost', './v4/repost'], function (exports, Theme, repost$1, repost$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? repost$1.pathData : repost$2.pathData;
	var repost = "repost";

	exports.accData = repost$1.accData;
	exports.ltr = repost$1.ltr;
	exports.default = repost;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
