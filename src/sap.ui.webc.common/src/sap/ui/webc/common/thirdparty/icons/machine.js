sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/machine', './v4/machine'], function (Theme, machine$2, machine$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? machine$1 : machine$2;
	var machine = { pathData };

	return machine;

});
