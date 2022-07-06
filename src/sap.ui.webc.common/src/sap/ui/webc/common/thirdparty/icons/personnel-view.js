sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/personnel-view', './v4/personnel-view'], function (exports, Theme, personnelView$1, personnelView$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? personnelView$1.pathData : personnelView$2.pathData;
	var personnelView = "personnel-view";

	exports.accData = personnelView$1.accData;
	exports.ltr = personnelView$1.ltr;
	exports.default = personnelView;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
