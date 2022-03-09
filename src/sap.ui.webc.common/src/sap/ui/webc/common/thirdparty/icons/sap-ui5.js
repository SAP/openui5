sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/sap-ui5', './v4/sap-ui5'], function (Theme, sapUi5$2, sapUi5$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? sapUi5$1 : sapUi5$2;
	var sapUi5 = { pathData };

	return sapUi5;

});
