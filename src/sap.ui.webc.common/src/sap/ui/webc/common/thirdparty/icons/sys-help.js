sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/sys-help', './v4/sys-help'], function (Theme, sysHelp$2, sysHelp$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? sysHelp$1 : sysHelp$2;
	var sysHelp = { pathData };

	return sysHelp;

});
