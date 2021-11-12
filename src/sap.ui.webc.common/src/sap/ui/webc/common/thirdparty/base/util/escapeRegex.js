sap.ui.define(function () { 'use strict';

	function escapeRegex(text) {
		return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	}

	return escapeRegex;

});
