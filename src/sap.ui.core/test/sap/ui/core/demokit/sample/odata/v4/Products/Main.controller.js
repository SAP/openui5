/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/sample/common/Controller",
	"sap/ui/util/XMLHelper"
], function (Controller, XMLHelper) {
	"use strict";

	return Controller.extend("sap.ui.core.sample.odata.v4.Products.Main", {
		onInit : function () {
			this.initMessagePopover("messagesButton");
		},

		onSourceCode : function (oEvent) {
			var oView = this.getView(),
				bVisible = oEvent.getSource().getPressed(),
				sSource;

			oView.getModel("ui").setProperty("/bCodeVisible", bVisible);
			if (bVisible && !oView.getModel("ui").getProperty("/sCode")) {
				sSource = XMLHelper.serialize(oView._xContent)
					.replace(/\{\s*/g, "{") // remove unnecessary whitespaces in complex binding
					.replace(/,\s*/g, ", ") // remove unnecessary whitespaces in complex binding
					.replace(/&gt;/g, ">") // decode >
					.replace(/\t/g, "  ") // indent by just 2 spaces
					.replace(/\n\s*\n/g, "\n"); // remove empty lines

				oView.getModel("ui").setProperty("/sCode", sSource);
			}
		}
	});
});