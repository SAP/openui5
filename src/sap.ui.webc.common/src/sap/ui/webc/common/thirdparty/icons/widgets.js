sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/widgets', './v4/widgets'], function (exports, Theme, widgets$1, widgets$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? widgets$1.pathData : widgets$2.pathData;
	var widgets = "widgets";

	exports.accData = widgets$1.accData;
	exports.ltr = widgets$1.ltr;
	exports.default = widgets;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
