sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/bus-public-transport', './v4/bus-public-transport'], function (exports, Theme, busPublicTransport$1, busPublicTransport$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? busPublicTransport$1.pathData : busPublicTransport$2.pathData;
	var busPublicTransport = "bus-public-transport";

	exports.accData = busPublicTransport$1.accData;
	exports.ltr = busPublicTransport$1.ltr;
	exports.default = busPublicTransport;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
