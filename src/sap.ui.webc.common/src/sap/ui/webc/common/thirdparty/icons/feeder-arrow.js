sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/feeder-arrow', './v4/feeder-arrow'], function (Theme, feederArrow$2, feederArrow$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? feederArrow$1 : feederArrow$2;
	var feederArrow = { pathData };

	return feederArrow;

});
