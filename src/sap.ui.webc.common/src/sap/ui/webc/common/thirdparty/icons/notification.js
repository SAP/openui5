sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/notification', './v4/notification'], function (exports, Theme, notification$1, notification$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? notification$1.pathData : notification$2.pathData;
	var notification = "notification";

	exports.accData = notification$1.accData;
	exports.ltr = notification$1.ltr;
	exports.default = notification;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
