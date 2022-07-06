sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/jam', './v4/jam'], function (exports, Theme, jam$1, jam$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? jam$1.pathData : jam$2.pathData;
	var jam = "jam";

	exports.accData = jam$1.accData;
	exports.ltr = jam$1.ltr;
	exports.default = jam;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
