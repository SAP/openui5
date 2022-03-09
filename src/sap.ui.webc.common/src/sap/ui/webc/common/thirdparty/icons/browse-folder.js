sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/browse-folder', './v4/browse-folder'], function (Theme, browseFolder$2, browseFolder$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? browseFolder$1 : browseFolder$2;
	var browseFolder = { pathData };

	return browseFolder;

});
