sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/syringe', './v4/syringe'], function (Theme, syringe$2, syringe$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? syringe$1 : syringe$2;
	var syringe = { pathData };

	return syringe;

});
