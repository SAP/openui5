sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/combine', './v4/combine'], function (exports, Theme, combine$1, combine$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? combine$1.pathData : combine$2.pathData;
	var combine = "combine";

	exports.accData = combine$1.accData;
	exports.ltr = combine$1.ltr;
	exports.default = combine;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
