sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/disconnected', './v4/disconnected'], function (exports, Theme, disconnected$1, disconnected$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? disconnected$1.pathData : disconnected$2.pathData;
	var disconnected = "disconnected";

	exports.accData = disconnected$1.accData;
	exports.ltr = disconnected$1.ltr;
	exports.default = disconnected;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
