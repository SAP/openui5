sap.ui.define(["sap/ui/integration/Extension"], function (Extension) {
	"use strict";

	/**
	 * The length of the Northwind specific OLE header inside images.
	 * Calculated in base64 encoded string.
	 * @const {int}
	 */
	var NORTHWIND_OLE_HEADER_LENGTH = 104;

	var NorthwindImageExtension = Extension.extend("card.explorer.extension.northwindImage.NorthwindImageExtension");

	NorthwindImageExtension.prototype.init = function () {
		Extension.prototype.init.apply(this, arguments);

		this.setFormatters({
			convertNorthwindImage: function (sImage) {
				// Northwind has a heritage of an old bitmap format
				// and contains an extra OLE header in their base64 pictures.
				var sTrimmedData = sImage.substring(NORTHWIND_OLE_HEADER_LENGTH); // removes the OLE header

				return "data:image/bmp;base64," + sTrimmedData;
			}
		});
	};

	return NorthwindImageExtension;
});
