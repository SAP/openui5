sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/vds-file', './v4/vds-file'], function (Theme, vdsFile$2, vdsFile$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? vdsFile$1 : vdsFile$2;
	var vdsFile = { pathData };

	return vdsFile;

});
