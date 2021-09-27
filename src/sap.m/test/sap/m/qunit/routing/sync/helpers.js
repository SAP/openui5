sap.ui.define([
	"sap/ui/core/mvc/Controller", // provides sap.ui.controller
	"sap/ui/core/mvc/JSView" // provides sap.ui.jsview
], function () {
		"use strict";

		return {
			createViewAndController: function (sName) {
				sap.ui.controller(sName, {});
				sap.ui.jsview(sName, {
					createContent: function () {
					},
					getController: function () {
						return sap.ui.controller(sName);
					}
				});

				return sap.ui.jsview(sName);

			}
		};

	});
