sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/electronic-medical-record', './v4/electronic-medical-record'], function (Theme, electronicMedicalRecord$2, electronicMedicalRecord$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? electronicMedicalRecord$1 : electronicMedicalRecord$2;
	var electronicMedicalRecord = { pathData };

	return electronicMedicalRecord;

});
