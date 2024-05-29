/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/core/mvc/Controller", "sap/ui/documentation/sdk/model/formatter"], function (Controller, formatter) {
	"use strict";

	return Controller.extend("sap.ui.documentation.sdk.blocks.IndexEntry", {
		formatText: function() {
			return formatter.formatIndexByVersionEntry.apply(formatter, arguments);
		}
	});
});