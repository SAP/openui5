sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/simulate', './v4/simulate'], function (Theme, simulate$2, simulate$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? simulate$1 : simulate$2;
	var simulate = { pathData };

	return simulate;

});
