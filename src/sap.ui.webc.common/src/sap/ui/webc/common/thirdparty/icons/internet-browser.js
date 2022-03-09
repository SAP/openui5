sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/internet-browser', './v4/internet-browser'], function (Theme, internetBrowser$2, internetBrowser$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? internetBrowser$1 : internetBrowser$2;
	var internetBrowser = { pathData };

	return internetBrowser;

});
