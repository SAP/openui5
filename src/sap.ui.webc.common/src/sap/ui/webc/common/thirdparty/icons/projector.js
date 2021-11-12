sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/projector', './v4/projector'], function (Theme, projector$2, projector$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? projector$1 : projector$2;
	var projector = { pathData };

	return projector;

});
