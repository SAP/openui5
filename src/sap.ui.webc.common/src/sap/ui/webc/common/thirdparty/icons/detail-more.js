sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/detail-more', './v4/detail-more'], function (exports, Theme, detailMore$1, detailMore$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? detailMore$1.pathData : detailMore$2.pathData;
	var detailMore = "detail-more";

	exports.accData = detailMore$1.accData;
	exports.ltr = detailMore$1.ltr;
	exports.default = detailMore;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
