sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/status-negative', './v4/status-negative'], function (Theme, statusNegative$2, statusNegative$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? statusNegative$1 : statusNegative$2;
	var statusNegative = { pathData };

	return statusNegative;

});
