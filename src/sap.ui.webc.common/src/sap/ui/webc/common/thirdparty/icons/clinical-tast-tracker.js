sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/clinical-tast-tracker', './v4/clinical-tast-tracker'], function (Theme, clinicalTastTracker$2, clinicalTastTracker$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? clinicalTastTracker$1 : clinicalTastTracker$2;
	var clinicalTastTracker = { pathData };

	return clinicalTastTracker;

});
