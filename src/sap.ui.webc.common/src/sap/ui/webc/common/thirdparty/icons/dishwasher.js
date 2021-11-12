sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/dishwasher', './v4/dishwasher'], function (Theme, dishwasher$2, dishwasher$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? dishwasher$1 : dishwasher$2;
	var dishwasher = { pathData };

	return dishwasher;

});
