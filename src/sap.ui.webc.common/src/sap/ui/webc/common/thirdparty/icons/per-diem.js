sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/per-diem', './v4/per-diem'], function (Theme, perDiem$2, perDiem$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? perDiem$1 : perDiem$2;
	var perDiem = { pathData };

	return perDiem;

});
