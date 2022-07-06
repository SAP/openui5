sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/inbox', './v4/inbox'], function (exports, Theme, inbox$1, inbox$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? inbox$1.pathData : inbox$2.pathData;
	var inbox = "inbox";

	exports.accData = inbox$1.accData;
	exports.ltr = inbox$1.ltr;
	exports.default = inbox;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
