sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/open-folder', './v4/open-folder'], function (Theme, openFolder$2, openFolder$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? openFolder$1 : openFolder$2;
	var openFolder = { pathData };

	return openFolder;

});
