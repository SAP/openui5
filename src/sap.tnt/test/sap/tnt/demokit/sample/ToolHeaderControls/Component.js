sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	'use strict';

	var Component = UIComponent.extend('sap.tnt.sample.ToolHeaderControls.Component', {
		metadata : {
			rootView : 'sap.tnt.sample.ToolHeaderControls.V',
			dependencies : {
				libs : [
					'sap.tnt',
					'sap.m'
				]
			},
			config : {
				sample : {
					stretch : true,
					files : [
						'V.view.xml',
						"V.controller.js"
					]
				}
			}
		}
	});

	return Component;

});
