sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/citizen-connect', './v4/citizen-connect'], function (exports, Theme, citizenConnect$1, citizenConnect$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? citizenConnect$1.pathData : citizenConnect$2.pathData;
	var citizenConnect = "citizen-connect";

	exports.accData = citizenConnect$1.accData;
	exports.ltr = citizenConnect$1.ltr;
	exports.default = citizenConnect;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
