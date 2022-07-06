sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/card', './v4/card'], function (exports, Theme, card$1, card$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? card$1.pathData : card$2.pathData;
	var card = "card";

	exports.accData = card$1.accData;
	exports.ltr = card$1.ltr;
	exports.default = card;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
