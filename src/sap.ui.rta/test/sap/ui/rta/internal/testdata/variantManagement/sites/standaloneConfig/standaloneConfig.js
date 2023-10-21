(() => {
	"use strict";
	document.write(`\
		<script \
			id="sap-ui-bootstrap" \
			data-sap-ui-theme="sap_horizon" \
			data-sap-ui-language="en" \
			data-sap-ui-noConflict="true" \
			data-sap-ui-async="true" \
			data-sap-ui-resourceroots='{"sap.ui.rta.test.variantManagement": "../"}'\
			data-sap-ui-libs="sap.m, sap.ui.layout, sap.ui.comp, sap.ui.rta" \
			data-sap-ui-xx-bindingSyntax="complex" \
			data-sap-ui-flexibilityServices='[{"connector": "LocalStorageConnector"}]' \
			src="${
	document.location.pathname.match(/(.*)\/test-resources\//)[1]}/resources/sap-ui-core.js" \
		><` + `/script>`
	);
})();