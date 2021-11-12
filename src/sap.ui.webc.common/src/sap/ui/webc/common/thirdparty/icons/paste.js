sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/paste', './v4/paste'], function (Theme, paste$2, paste$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? paste$1 : paste$2;
	var paste = { pathData };

	return paste;

});
