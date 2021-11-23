sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/collision', './v4/collision'], function (Theme, collision$2, collision$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? collision$1 : collision$2;
	var collision = { pathData };

	return collision;

});
