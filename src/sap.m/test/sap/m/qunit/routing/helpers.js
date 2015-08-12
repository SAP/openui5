sap.ui.define(
	[],
	function () {
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
