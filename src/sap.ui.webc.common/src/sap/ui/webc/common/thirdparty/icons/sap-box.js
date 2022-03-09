sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/sap-box', './v4/sap-box'], function (Theme, sapBox$2, sapBox$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? sapBox$1 : sapBox$2;
	var sapBox = { pathData };

	return sapBox;

});
