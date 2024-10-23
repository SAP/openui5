function main() {
	"use strict";

	sap.ui.require([
		"sap/m/Shell",
		"sap/ui/core/ComponentContainer"
	], function(Shell, ComponentContainer) {
		new Shell('Shell', {
			title: 'Application under test',
			app: new ComponentContainer({
				name: 'appUnderTest',
				settings : {
					id : "appUnderTest"
				},
				manifest: true
			})
		}).placeAt('content');
	});
}