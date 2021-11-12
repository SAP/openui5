sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/education', './v4/education'], function (Theme, education$2, education$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? education$1 : education$2;
	var education = { pathData };

	return education;

});
