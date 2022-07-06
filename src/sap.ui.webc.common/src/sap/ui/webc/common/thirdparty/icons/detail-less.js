sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/detail-less', './v4/detail-less'], function (exports, Theme, detailLess$1, detailLess$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? detailLess$1.pathData : detailLess$2.pathData;
	var detailLess = "detail-less";

	exports.accData = detailLess$1.accData;
	exports.ltr = detailLess$1.ltr;
	exports.default = detailLess;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
