sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
		'use strict';

		return UIComponent.extend('sap.ui.layout.sample.GridData.Component', {
			metadata: {
			    dependencies: [
					'sap.m',
					'sap.ui.layout'
				],

			    manifest: "json"
			}
		});
	});
