sap.ui.define(['sap/ui/core/UIComponent'],
function(UIComponent) {
	'use strict';

	return UIComponent.extend('appMock.Component', {
		metadata: {
			'rootView': 'appMock.view.Main'
		}
	});
});