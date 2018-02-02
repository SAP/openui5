window['cyclic-dependency-without-mapping'] = window['cyclic-dependency-without-mapping'] || {};

sap.ui.define(['./module1'], function(module1) {
	var moduleExport = {
		name: 'module3',
		module1: module1
	};
	window['cyclic-dependency-without-mapping'].module3 = moduleExport;
	return moduleExport;
});

window['cyclic-dependency-without-mapping'].afterDefineModule3 = {
	module1: sap.ui.require('modules/cyclic-dependency-without-mapping/module1'),
	module2: sap.ui.require('modules/cyclic-dependency-without-mapping/module2'),
	module3: sap.ui.require('modules/cyclic-dependency-without-mapping/module3'),
	module3Global: window['cyclic-dependency-without-mapping'].module3,
};