sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/grid', './v4/grid'], function (exports, Theme, grid$1, grid$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? grid$1.pathData : grid$2.pathData;
	var grid = "grid";

	exports.accData = grid$1.accData;
	exports.ltr = grid$1.ltr;
	exports.default = grid;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
