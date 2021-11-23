sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/command-line-interfaces', './v4/command-line-interfaces'], function (Theme, commandLineInterfaces$2, commandLineInterfaces$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? commandLineInterfaces$1 : commandLineInterfaces$2;
	var commandLineInterfaces = { pathData };

	return commandLineInterfaces;

});
