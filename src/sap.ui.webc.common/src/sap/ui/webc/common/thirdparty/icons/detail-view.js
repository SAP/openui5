sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/detail-view', './v4/detail-view'], function (exports, Theme, detailView$1, detailView$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? detailView$1.pathData : detailView$2.pathData;
	var detailView = "detail-view";

	exports.accData = detailView$1.accData;
	exports.ltr = detailView$1.ltr;
	exports.default = detailView;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
