sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/sys-add', './v4/sys-add'], function (Theme, sysAdd$2, sysAdd$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? sysAdd$1 : sysAdd$2;
	var sysAdd = { pathData };

	return sysAdd;

});
