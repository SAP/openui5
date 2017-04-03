sap.ui.define([
	], function () {
		"use strict";
		return {
			addClass: function (sValue) {
				switch (sValue) {
				case "1":
					return ("Class: 1");
					break;
				case "2":
					return ("Class: 2");
					break;
				case "3":
					return("Class: 3");
					break;
				case "4":
					return("Class: 4");
					break;
				case "5":
					return("Class: 5");
					break;
				case "6":
					return("Class: 6");
					break;
				default:
					return ("Class: 0");
				break;
				}
				return("");
			}
		};

	}
);