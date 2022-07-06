sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/create-session', './v4/create-session'], function (exports, Theme, createSession$1, createSession$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? createSession$1.pathData : createSession$2.pathData;
	var createSession = "create-session";

	exports.accData = createSession$1.accData;
	exports.ltr = createSession$1.ltr;
	exports.default = createSession;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
