sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/theater', './v4/theater'], function (exports, Theme, theater$1, theater$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? theater$1.pathData : theater$2.pathData;
	var theater = "theater";

	exports.accData = theater$1.accData;
	exports.ltr = theater$1.ltr;
	exports.default = theater;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
