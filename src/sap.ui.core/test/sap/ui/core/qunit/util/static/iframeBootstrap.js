if (window.location.search.indexOf('loadframework') !== -1) {
	// TODO: Rethink this document.write
	document.write('<script src="' + document.location.pathname.match(/(.*)\/test-resources\//)[1] + '/resources/sap-ui-core.js"><' + '/script>');
}