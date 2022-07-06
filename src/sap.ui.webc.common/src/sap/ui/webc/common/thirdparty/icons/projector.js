sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/projector', './v4/projector'], function (exports, Theme, projector$1, projector$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? projector$1.pathData : projector$2.pathData;
	var projector = "projector";

	exports.accData = projector$1.accData;
	exports.ltr = projector$1.ltr;
	exports.default = projector;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
