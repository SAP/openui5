sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/notes', './v4/notes'], function (Theme, notes$2, notes$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? notes$1 : notes$2;
	var notes = { pathData };

	return notes;

});
