sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/lab', './v4/lab'], function (Theme, lab$2, lab$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? lab$1 : lab$2;
	var lab = { pathData };

	return lab;

});
