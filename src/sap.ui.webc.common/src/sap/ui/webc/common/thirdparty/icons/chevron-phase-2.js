sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/chevron-phase-2', './v4/chevron-phase-2'], function (Theme, chevronPhase2$2, chevronPhase2$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? chevronPhase2$1 : chevronPhase2$2;
	var chevronPhase2 = { pathData };

	return chevronPhase2;

});
