sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/inbox', './v4/inbox'], function (Theme, inbox$2, inbox$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? inbox$1 : inbox$2;
	var inbox = { pathData };

	return inbox;

});
