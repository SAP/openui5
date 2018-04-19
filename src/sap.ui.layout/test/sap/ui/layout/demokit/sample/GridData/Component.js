sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
		'use strict';

		return UIComponent.extend('sap.ui.layout.sample.GridData.Component', {
			metadata: {
				rootView: {
					'viewName': 'sap.ui.layout.sample.GridData.GridData',
					'type': 'XML',
					'async': true
				},
				includes: [
					'resources/styles.css'
				],
				dependencies: [
					'sap.m',
					'sap.ui.layout'
				],
				config: {
					sample: {
						files: [
							'GridData.view.xml',
							'GridData.controller.js'
						]
					}
				}
			}
		});
	});
