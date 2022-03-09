sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/jam', './v4/jam'], function (Theme, jam$2, jam$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? jam$1 : jam$2;
	var jam = { pathData };

	return jam;

});
