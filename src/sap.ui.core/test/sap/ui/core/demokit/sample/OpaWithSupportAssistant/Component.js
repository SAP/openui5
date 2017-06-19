sap.ui.define(['sap/ui/core/UIComponent'],
function (UIComponent) {
	'use strict';

	return UIComponent.extend('sap.ui.core.sample.OpaById.Component', {
		metadata: {
			dependencies: {
				libs: [
					'sap.m'
				]
			},
			config: {
				sample: {
					iframe: 'Opa.html?opaExecutionDelay=700',
					stretch: true,
					files: [
						'Opa.html',
						'Opa.js',
						'applicationUnderTest/view/Main.view.xml',
						'applicationUnderTest/view/Main.controller.js',
						'applicationUnderTest/index.html',
						'applicationUnderTest/Component.js'
					]
				}
			}
		}
	});
});