sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/bookmark-2', './v4/bookmark-2'], function (exports, Theme, bookmark2$1, bookmark2$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? bookmark2$1.pathData : bookmark2$2.pathData;
	var bookmark2 = "bookmark-2";

	exports.accData = bookmark2$1.accData;
	exports.ltr = bookmark2$1.ltr;
	exports.default = bookmark2;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
