sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/insurance-car', './v4/insurance-car'], function (Theme, insuranceCar$2, insuranceCar$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? insuranceCar$1 : insuranceCar$2;
	var insuranceCar = { pathData };

	return insuranceCar;

});
