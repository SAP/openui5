sap.ui.define(function(require, exports, module) {
	'use strict';

	var info = {
		"old.module.exports": module.exports,
		"old.exports": exports
	};
	module.exports = info["new.module.exports"] = info;
});