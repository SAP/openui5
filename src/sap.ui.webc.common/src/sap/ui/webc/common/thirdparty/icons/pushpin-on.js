sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/pushpin-on', './v4/pushpin-on'], function (Theme, pushpinOn$2, pushpinOn$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? pushpinOn$1 : pushpinOn$2;
	var pushpinOn = { pathData };

	return pushpinOn;

});
