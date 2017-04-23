sap.ui.define([
	], function () {
		"use strict";
		return {
			addClass: function (sValue) {
				switch (sValue) {
				case "1":
					return ("Class: 1");
				case "2":
					return ("Class: 2");
				case "3":
					return ("Class: 3");
				case "4":
					return ("Class: 4");
				case "5":
					return ("Class: 5");
				case "6":
					return ("Class: 6");
				default:
					return ("Class: 0");
				}
			}
		};

	}
);