sap.ui.define(function () { 'use strict';

	var getDesigntimePropertyAsArray = value => {
		const m = /\$([-a-z0-9A-Z._]+)(?::([^$]*))?\$/.exec(value);
		return m && m[2] ? m[2].split(/,/) : null;
	};

	return getDesigntimePropertyAsArray;

});
