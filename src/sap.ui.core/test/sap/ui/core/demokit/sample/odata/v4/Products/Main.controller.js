/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/sample/common/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("sap.ui.core.sample.odata.v4.Products.Main", {
		onInit : function () {
			this.initMessagePopover("messagesButton");
		}
	});
});