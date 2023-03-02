sap.ui.require([
	'sap/ui/core/ComponentContainer', 'sap/m/Shell'
], function(ComponentContainer, Shell) {
	'use strict';

	new Shell("Shell", {
		title: "Application under test contact annotation",
		app: new ComponentContainer({
			name: 'appUnderTestAdditionalContent',
			settings: {
				id: "appUnderTestAdditionalContent"
			},
			manifest: true
		})
	}).placeAt('content');
});
