sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/outbox', './v4/outbox'], function (Theme, outbox$2, outbox$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? outbox$1 : outbox$2;
	var outbox = { pathData };

	return outbox;

});
