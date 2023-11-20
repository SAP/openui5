sap.ui.define(['sap/ui/core/mvc/Controller', 'sap/m/MessageToast'],
	function(Controller) {
	"use strict";

	var complexsyntaxController = Controller.extend("testdata.complexsyntax", {

		formatter: {
			date: function(iDay, iMonth, iYear) {
				return iDay + "/" + iMonth + "/" + iYear;
			},
			name: function (sName) {
				return sName.toUpperCase();
			},
			gender: function (sGender) {
				var sValue = 'Mr.';
				if (sGender === "female") {
					sValue = 'Mrs.';
				}
				return sValue;
			}
		}
	});

	return complexsyntaxController;

});
