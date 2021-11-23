sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/bus-public-transport', './v4/bus-public-transport'], function (Theme, busPublicTransport$2, busPublicTransport$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? busPublicTransport$1 : busPublicTransport$2;
	var busPublicTransport = { pathData };

	return busPublicTransport;

});
