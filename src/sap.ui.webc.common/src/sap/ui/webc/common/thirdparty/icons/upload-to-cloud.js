sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/upload-to-cloud', './v4/upload-to-cloud'], function (Theme, uploadToCloud$2, uploadToCloud$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? uploadToCloud$1 : uploadToCloud$2;
	var uploadToCloud = { pathData };

	return uploadToCloud;

});
