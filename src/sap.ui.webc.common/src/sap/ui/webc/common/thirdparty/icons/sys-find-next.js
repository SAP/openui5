sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/sys-find-next', './v4/sys-find-next'], function (Theme, sysFindNext$2, sysFindNext$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? sysFindNext$1 : sysFindNext$2;
	var sysFindNext = { pathData };

	return sysFindNext;

});
