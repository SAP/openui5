sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/Netweaver-business-client', './v4/Netweaver-business-client'], function (exports, Theme, NetweaverBusinessClient$1, NetweaverBusinessClient$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? NetweaverBusinessClient$1.pathData : NetweaverBusinessClient$2.pathData;
	var NetweaverBusinessClient = "Netweaver-business-client";

	exports.accData = NetweaverBusinessClient$1.accData;
	exports.ltr = NetweaverBusinessClient$1.ltr;
	exports.default = NetweaverBusinessClient;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
