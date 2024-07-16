document.write('\
<script \
	id="sap-ui-bootstrap" \
	data-sap-ui-async="true" \
	\
	data-sap-ui-language="en" \
	data-sap-ui-resourceroots=\'{"sap.ui.rta.test": "testdata/rta/"}\'\
	data-sap-ui-libs="sap.m, sap.ui.layout, sap.ui.comp, sap.ui.rta" \
	data-sap-ui-xx-bindingSyntax="complex" \
	data-sap-ui-flexibilityServices=\'[{"connector": "LocalStorageConnector"}]\'\
	src="' +
	document.location.pathname.match(/(.*)\/test-resources\//)[1] + '/resources/sap-ui-core.js" \
><' + '/script>'
);

sap.ui.require([
	"sap/ui/core/ComponentContainer",
	"sap/ui/core/Component",
	"sap/ui/core/Core"
], function(ComponentContainer, Component, Core) {
	return Core.ready().then(() => {
		return Component.create({
			name: "sap.ui.rta.test",
			id: "Comp1",
			componentData: {
				"showAdaptButton": true
			}
		});
	}).then((oComponent) => {
		return new ComponentContainer("CompCont1", {
			component: oComponent,
			async: true
		});
	})
	.then((oComponentContainer) => {
		oComponentContainer.placeAt("content");
	});
});