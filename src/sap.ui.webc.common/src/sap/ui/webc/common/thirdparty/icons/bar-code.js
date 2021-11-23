sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/bar-code', './v4/bar-code'], function (Theme, barCode$2, barCode$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? barCode$1 : barCode$2;
	var barCode = { pathData };

	return barCode;

});
