sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	'use strict';

	var Component = UIComponent.extend('sap.tnt.sample.ToolHeaderIconTabHeader.Component', {
		metadata : {
			rootView : 'sap.tnt.sample.ToolHeaderIconTabHeader.V',
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
