window['dependencies-without-mapping'] = window['dependencies-without-mapping'] || {};

sap.ui.define([], function() {
	var moduleExport = {
		name: 'module3'
	};

	window['dependencies-without-mapping'].module3 = moduleExport;
	return moduleExport;
});

window['dependencies-without-mapping'].afterDefineModule3 = {
	module1: sap.ui.require('modules/dependencies-without-mapping/module1'),
	module2: sap.ui.require('modules/dependencies-without-mapping/module2'),
	module3: sap.ui.require('modules/dependencies-without-mapping/module3'),
	module3Global: window['dependencies-without-mapping'].module3,
};