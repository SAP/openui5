sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/Netweaver-business-client', './v4/Netweaver-business-client'], function (Theme, NetweaverBusinessClient$2, NetweaverBusinessClient$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? NetweaverBusinessClient$1 : NetweaverBusinessClient$2;
	var NetweaverBusinessClient = { pathData };

	return NetweaverBusinessClient;

});
