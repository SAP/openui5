sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/bookmark', './v4/bookmark'], function (exports, Theme, bookmark$1, bookmark$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? bookmark$1.pathData : bookmark$2.pathData;
	var bookmark = "bookmark";

	exports.accData = bookmark$1.accData;
	exports.ltr = bookmark$1.ltr;
	exports.default = bookmark;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
