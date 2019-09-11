/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/m/changeHandler/ChangeLinkTarget"
], function (ChangeLinkTarget) {
	"use strict";

	return {
		"hideControl": "default",
		"unhideControl": "default",
		"changeLinkTarget": {
			"changeHandler": ChangeLinkTarget,
			"layers": {
				"CUSTOMER": false
			}
		}
	};
});