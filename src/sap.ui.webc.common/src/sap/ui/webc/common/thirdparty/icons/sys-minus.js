sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/sys-minus', './v4/sys-minus'], function (Theme, sysMinus$2, sysMinus$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? sysMinus$1 : sysMinus$2;
	var sysMinus = { pathData };

	return sysMinus;

});
