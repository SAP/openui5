sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/sys-help-2', './v4/sys-help-2'], function (Theme, sysHelp2$2, sysHelp2$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? sysHelp2$1 : sysHelp2$2;
	var sysHelp2 = { pathData };

	return sysHelp2;

});
