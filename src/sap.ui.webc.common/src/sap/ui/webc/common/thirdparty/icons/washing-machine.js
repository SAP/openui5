sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/washing-machine', './v4/washing-machine'], function (Theme, washingMachine$2, washingMachine$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? washingMachine$1 : washingMachine$2;
	var washingMachine = { pathData };

	return washingMachine;

});
