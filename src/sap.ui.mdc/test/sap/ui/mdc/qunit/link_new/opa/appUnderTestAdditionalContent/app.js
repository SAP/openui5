sap.ui.require([
	'sap/ui/fl/FakeLrepConnectorLocalStorage', 'sap/ui/core/ComponentContainer', 'sap/m/Shell'
], function(FakeLrepConnectorLocalStorage, ComponentContainer, Shell) {
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
