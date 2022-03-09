sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/sales-document', './v4/sales-document'], function (Theme, salesDocument$2, salesDocument$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? salesDocument$1 : salesDocument$2;
	var salesDocument = { pathData };

	return salesDocument;

});
