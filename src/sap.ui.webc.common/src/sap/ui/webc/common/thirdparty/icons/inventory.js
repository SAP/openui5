sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/inventory', './v4/inventory'], function (Theme, inventory$2, inventory$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? inventory$1 : inventory$2;
	var inventory = { pathData };

	return inventory;

});
