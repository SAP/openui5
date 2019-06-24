
/*!
 * ${copyright}
 */
sap.ui.define([
	'sap/ui/core/Control'
], function(Control) {
	"use strict";

	/**
	 * @class
	 * Custom BorrowedList control used to display multiple list in a borrowed methods or events
	 * @extends sap.ui.core.Control
	 * @private
	 * @ui5-restricted sdk
	 */
	return Control.extend("sap.ui.documentation.sdk.controls.BorrowedList", {
		metadata: {
			properties: {
				/**
				 * Array containing list of objects which have property name and link
				 */
				list: {type: "array"}
			}
		},
		renderer: {
			apiVersion: 2,

			render: function (oRm, oControl) {
			var aList = oControl.getList(),
				oItem,
				iLen,
				i;

			oRm.openStart("div", oControl);
			oRm.openEnd();

			// Render links
			for (i = 0, iLen = aList.length; i < iLen; i++) {
				oItem = aList[i];

				oRm.openStart("a");
				oRm.attr("href", oItem.link)
					.attr("role", "link")
					.attr("tabindex", "0")
					.class("sapMLnk")
					.class("sapMLnkMaxWidth")
					.class("sapUiTinyMargin")
					.openEnd()
					.text(oItem.name)
					.close("a");
			}

			oRm.close("div");
		}
	}});

});
