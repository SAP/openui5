sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/capital-projects', './v4/capital-projects'], function (Theme, capitalProjects$2, capitalProjects$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? capitalProjects$1 : capitalProjects$2;
	var capitalProjects = { pathData };

	return capitalProjects;

});
