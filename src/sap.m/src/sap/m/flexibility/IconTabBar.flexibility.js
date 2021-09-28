/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/m/changeHandler/SelectIconTabBarFilter"
], function (SelectIconTabBarFilter) {
	"use strict";

	return {
		"moveControls": "default",
		"selectIconTabBarFilter": {
			"changeHandler": SelectIconTabBarFilter,
			"layers": {
				"USER": true
			}
		}
	};
});