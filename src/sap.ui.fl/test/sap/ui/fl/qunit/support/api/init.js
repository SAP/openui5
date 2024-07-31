(() => {
	"use strict";

	document.write(`
		<script
			src="${document.location.pathname.match(/(.*)\/test-resources\//)[1]}/resources/sap-ui-core.js"
			id="sap-ui-bootstrap"
			data-sap-ui-theme="sap_horizon"
			data-sap-ui-language="en"
			data-sap-ui-noConflict="true"
			data-sap-ui-async="true"
			data-sap-ui-libs="sap.m"
			data-sap-ui-xx-bindingSyntax="complex"
			data-sap-ui-resourceroots='{"local": "./"}'
			data-sap-ui-onInit="module:local/initApp"
		></script>`
	);
})();