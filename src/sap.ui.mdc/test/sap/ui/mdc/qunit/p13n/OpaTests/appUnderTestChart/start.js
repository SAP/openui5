sap.ui.require([
	'sap/ui/core/ComponentContainer'
], function(
	ComponentContainer
) {
	'use strict';

	new ComponentContainer({
		name: 'appUnderTestChart',
		height: "100%",
		manifest: true
	}).placeAt('content');
});
