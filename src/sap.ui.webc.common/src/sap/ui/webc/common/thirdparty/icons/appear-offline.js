sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/appear-offline', './v4/appear-offline'], function (exports, Theme, appearOffline$1, appearOffline$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? appearOffline$1.pathData : appearOffline$2.pathData;
	var appearOffline = "appear-offline";

	exports.accData = appearOffline$1.accData;
	exports.ltr = appearOffline$1.ltr;
	exports.default = appearOffline;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
