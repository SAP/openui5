sap.ui.define(['sap/ui/core/UIComponent'],
	function (UIComponent) {
		'use strict';

		return UIComponent.extend('sap.ui.layout.sample.GridProperties.Component', {

			metadata: {
				rootView: {
					'viewName': 'sap.ui.layout.sample.GridProperties.GridProperties',
					'type': 'XML',
					'async': true
				},
				includes: [
					"resources/styles.css"
				],
				dependencies: {
					libs: [
						'sap.m',
						'sap.ui.layout'
					]
				},
				config: {
					sample: {
						files: [
							'GridProperties.view.xml',
							'GridProperties.controller.js'
						]
					}
				}
			}
		});
	});