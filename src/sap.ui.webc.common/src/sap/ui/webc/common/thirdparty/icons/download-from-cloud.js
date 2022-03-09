sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/download-from-cloud', './v4/download-from-cloud'], function (Theme, downloadFromCloud$2, downloadFromCloud$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? downloadFromCloud$1 : downloadFromCloud$2;
	var downloadFromCloud = { pathData };

	return downloadFromCloud;

});
