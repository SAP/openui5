
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
		renderer: function (oRm, oControl) {
			var aList = oControl.getList(),
				oItem,
				iLen,
				i;

			oRm.write("<div");
			oRm.writeControlData(oControl);
			oRm.write(">");

			// Render links
			for (i = 0, iLen = aList.length; i < iLen; i++) {
				oItem = aList[i];
				oRm.write(['<a href="', oItem.link,
					'" role="link" tabindex="0" class="sapMLnk sapMLnkMaxWidth sapUiTinyMargin">' , oItem.name,
					'</a>'].join(""));
			}

			oRm.write("</div>");
		}
	});

});
