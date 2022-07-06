sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/post', './v4/post'], function (exports, Theme, post$1, post$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? post$1.pathData : post$2.pathData;
	var post = "post";

	exports.accData = post$1.accData;
	exports.ltr = post$1.ltr;
	exports.default = post;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
