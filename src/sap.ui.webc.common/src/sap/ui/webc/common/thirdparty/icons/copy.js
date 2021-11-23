sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/copy', './v4/copy'], function (Theme, copy$2, copy$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? copy$1 : copy$2;
	var copy = { pathData };

	return copy;

});
