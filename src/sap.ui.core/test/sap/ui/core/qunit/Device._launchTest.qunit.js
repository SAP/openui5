/*global QUnit */
QUnit.config.autostart = false;
sap.ui.loader.config({
	paths: {
		'local': './'
	}
})
sap.ui.require(['local/Device.qunit'], function() {
	QUnit.start();
});
