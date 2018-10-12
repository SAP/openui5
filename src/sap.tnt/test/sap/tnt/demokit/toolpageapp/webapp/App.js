/*!
* ${copyright}
*/
sap.ui.define(["sap/ui/core/Core",
		"sap/ui/core/ComponentContainer"],
	function (Core,
			  ComponentContainer) {
		"use strict";

		Core.attachInit(function () {
			new ComponentContainer({
				name : "sap.ui.demo.toolpageapp",
				height : "100%",
				settings : {
					id : "toolpageapp"
				}
			}).placeAt("content");
		});
	});