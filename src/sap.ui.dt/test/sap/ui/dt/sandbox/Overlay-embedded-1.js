window['sap-ui-config'].libs = 'sap.m, sap.ui.dt, sap.ui.layout';
window['sap-ui-config'].noConflict = true;
document.write('<script src="' + document.location.pathname.match(/(.+)\/test-resources\//)[1] + '/resources/sap-ui-core.js"><' + '/script>');