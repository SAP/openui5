sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/building', './v4/building'], function (exports, Theme, building$1, building$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? building$1.pathData : building$2.pathData;
	var building = "building";

	exports.accData = building$1.accData;
	exports.ltr = building$1.ltr;
	exports.default = building;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
