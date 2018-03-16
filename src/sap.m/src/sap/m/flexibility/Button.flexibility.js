/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/changeHandler/BaseRename"
], function (BaseRename) {
	"use strict";

	return {
		"hideControl": {
			"changeHandler": "default",
			"layers": {
				"CUSTOMER": false
			}
		},
		"rename": BaseRename.createRenameChangeHandler({
			propertyName: "text",
			translationTextType: "XBUT"
		}),
		"unhideControl": {
			"changeHandler": "default",
			"layers": {
				"CUSTOMER": false
			}
		}
	};
}, /* bExport= */false);