sap.ui.require([
	'sap/ui/fl/FakeLrepConnectorLocalStorage', 'sap/ui/core/ComponentContainer', 'sap/m/Shell'

], function(FakeLrepConnectorLocalStorage, ComponentContainer, Shell) {
	'use strict';

	// Init LRep (we have to fake the connection to LRep in order to be independent from backend)
	FakeLrepConnectorLocalStorage.enableFakeConnector();
	FakeLrepConnectorLocalStorage.forTesting.synchronous.clearAll();

	new Shell("Shell", {
		title: "Application under test",
		app: new ComponentContainer({
			name: 'appUnderTestContactAnnotation',
			settings: {
				id: "appUnderTestContactAnnotation"
			},
			manifest: true
		})
	}).placeAt('content');
});
