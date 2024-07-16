window['sap-ui-config'].libs = 'sap.m, sap.ui.layout, sap.uxap, sap.ui.rta';
window['sap-ui-config'].resourceroots = {
	'sap.ui.rta.test.rtaOpenUI5Only': './'
};
window['sap-ui-config'].bindingSyntax = 'complex';
window['sap-ui-config'].flexibilityServices = '[{"connector": "LocalStorageConnector"}]';
window['sap-ui-config'].noConflict = 'true';
window['sap-ui-config'].async = 'true';
document.write('<script src="' + document.location.pathname.match(/(.*)\/test-resources\//)[1] + '/resources/sap-ui-core.js"><' + '/script>');

sap.ui.require([
	"sap/m/Shell",
	"sap/ui/core/ComponentContainer",
	"sap/ui/core/Component",
	"sap/ui/core/Core"
], function(Shell, ComponentContainer, Component, Core) {
	return Core.ready().then(() => {
		return Component.create({
			name: "sap.ui.rta.test.rtaOpenUI5Only",
			componentData: {
				"showAdaptButton" : true
			}
		});
	}).then((oComponent) => {
		return new ComponentContainer({
			height : "100%",
			component : oComponent,
			async: true
		})
	})
	.then((oComponentContainer) => {
		return new Shell({
			app: oComponentContainer
		}).placeAt("content");
	})
});