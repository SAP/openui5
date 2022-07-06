sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/comment', './v4/comment'], function (exports, Theme, comment$1, comment$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? comment$1.pathData : comment$2.pathData;
	var comment = "comment";

	exports.accData = comment$1.accData;
	exports.ltr = comment$1.ltr;
	exports.default = comment;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
