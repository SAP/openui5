sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	'use strict';

	var Component = UIComponent.extend('sap.tnt.sample.SideNavigation.Component', {
		metadata : {
			rootView : 'sap.tnt.sample.SideNavigation.V',
			dependencies : {
				libs : [
					'sap.tnt',
					'sap.m'
				]
			},
			includes : [ "style.css" ],
			config : {
				sample : {
					stretch : true,
					files : [
						'V.view.xml'
					]
				}
			}
		}
	});

	return Component;

});
