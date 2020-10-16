/*!
 * ${copyright}
 */

/**
 * This module was created by the BASEditor
 */
sap.ui.define(["sap/ui/integration/Designtime"], function (
	Designtime
) {
	"use strict";

	var Configuration = Designtime.extend("$$CARDID$$.Configuration");
	Configuration.prototype.create = function () {
		return {
			form: {
				items: {
				}
			},
			preview: {
				modes: "Abstract"
			}
		};
	};
	return Configuration;
});
