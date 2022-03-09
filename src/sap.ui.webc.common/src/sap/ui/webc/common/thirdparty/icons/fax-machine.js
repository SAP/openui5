sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/fax-machine', './v4/fax-machine'], function (Theme, faxMachine$2, faxMachine$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? faxMachine$1 : faxMachine$2;
	var faxMachine = { pathData };

	return faxMachine;

});
