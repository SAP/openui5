sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/address-book', './v4/address-book'], function (Theme, addressBook$2, addressBook$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? addressBook$1 : addressBook$2;
	var addressBook = { pathData };

	return addressBook;

});
