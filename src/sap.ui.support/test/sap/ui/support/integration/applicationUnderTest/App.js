/*!
 * ${copyright}
 */
sap.ui.define(["sap/ui/core/Core",
		"sap/ui/core/ComponentContainer",
		"sap/m/Shell"],
	function (Core,
			  ComponentContainer,
			  Shell) {
		"use strict";

		Core.ready(function () {
			new Shell('Shell', {
				title: 'Application under test',
				app: new ComponentContainer({
					name: 'appUnderTest',
					async: true,
					manifest: true
				})
			}).placeAt('content');
		});
	});
