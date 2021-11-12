sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/sap-logo-shape', './v4/sap-logo-shape'], function (Theme, sapLogoShape$2, sapLogoShape$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? sapLogoShape$1 : sapLogoShape$2;
	var sapLogoShape = { pathData };

	return sapLogoShape;

});
