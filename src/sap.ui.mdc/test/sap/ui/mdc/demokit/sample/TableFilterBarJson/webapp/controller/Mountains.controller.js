sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/format/NumberFormat"
],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
	function (Controller, JSONModel, NumberFormat) {
		"use strict";

		return Controller.extend("sap.ui.mdc.demokit.sample.TableFilterBarJson.webapp.controller.Mountains", {

			onInit: function () {
				// initialization
			},

			formatHeight: function(iHeight) {
				var oFormat = NumberFormat.getIntegerInstance({
					"groupingEnabled": true,  // grouping is enabled
					"groupingSeparator": '.', // grouping separator is '.'
					"groupingSize": 3         // the amount of digits to be grouped (here: thousand)
				});

				return oFormat.format(iHeight) + " m";
			}

		});
	});
