sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/folder', './v4/folder'], function (Theme, folder$2, folder$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? folder$1 : folder$2;
	var folder = { pathData };

	return folder;

});
