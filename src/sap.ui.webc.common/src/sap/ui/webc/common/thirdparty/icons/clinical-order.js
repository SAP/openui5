sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/clinical-order', './v4/clinical-order'], function (Theme, clinicalOrder$2, clinicalOrder$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? clinicalOrder$1 : clinicalOrder$2;
	var clinicalOrder = { pathData };

	return clinicalOrder;

});
