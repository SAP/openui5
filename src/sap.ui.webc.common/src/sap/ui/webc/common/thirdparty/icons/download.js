sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/download', './v4/download'], function (Theme, download$2, download$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? download$1 : download$2;
	var download = { pathData };

	return download;

});
