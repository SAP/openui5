sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/official-service', './v4/official-service'], function (exports, Theme, officialService$1, officialService$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? officialService$1.pathData : officialService$2.pathData;
	var officialService = "official-service";

	exports.accData = officialService$1.accData;
	exports.ltr = officialService$1.ltr;
	exports.default = officialService;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
