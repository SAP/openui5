sap.ui.define(["require"], function(require) {
	"use strict";
	return {
		resolvePath: function(sPath) {
			// Relative to application root
			return require.toUrl("../") + sPath;
		}
	};
});
