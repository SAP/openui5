sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/curriculum', './v4/curriculum'], function (Theme, curriculum$2, curriculum$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? curriculum$1 : curriculum$2;
	var curriculum = { pathData };

	return curriculum;

});
