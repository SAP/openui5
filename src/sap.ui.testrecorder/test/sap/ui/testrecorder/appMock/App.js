/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/Core",
	"sap/ui/core/ComponentContainer",
	"sap/m/Shell"
], function (Core, ComponentContainer, Shell) {
	"use strict";

	Core.attachInit(function () {
		new Shell('Shell', {
			title: 'Mocked Application for testing Test Recorder tool',
			app: new ComponentContainer({
				name: 'appMock'
			})
		}).placeAt('content');
	});
});
