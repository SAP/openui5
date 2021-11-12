sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/mri-scan', './v4/mri-scan'], function (Theme, mriScan$2, mriScan$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? mriScan$1 : mriScan$2;
	var mriScan = { pathData };

	return mriScan;

});
