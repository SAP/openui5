sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/appear-offline', './v4/appear-offline'], function (Theme, appearOffline$2, appearOffline$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? appearOffline$1 : appearOffline$2;
	var appearOffline = { pathData };

	return appearOffline;

});
