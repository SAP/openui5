sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/thing-type', './v4/thing-type'], function (Theme, thingType$2, thingType$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? thingType$1 : thingType$2;
	var thingType = { pathData };

	return thingType;

});
