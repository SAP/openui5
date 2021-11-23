sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/locked', './v4/locked'], function (Theme, locked$2, locked$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? locked$1 : locked$2;
	var locked = { pathData };

	return locked;

});
