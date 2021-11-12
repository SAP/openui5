sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/sales-quote', './v4/sales-quote'], function (Theme, salesQuote$2, salesQuote$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? salesQuote$1 : salesQuote$2;
	var salesQuote = { pathData };

	return salesQuote;

});
