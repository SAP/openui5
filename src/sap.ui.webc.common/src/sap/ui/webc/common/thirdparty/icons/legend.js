sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/legend', './v4/legend'], function (Theme, legend$2, legend$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? legend$1 : legend$2;
	var legend = { pathData };

	return legend;

});
