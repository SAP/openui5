sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/chevron-phase', './v4/chevron-phase'], function (Theme, chevronPhase$2, chevronPhase$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? chevronPhase$1 : chevronPhase$2;
	var chevronPhase = { pathData };

	return chevronPhase;

});
