window['dependencies-without-mapping'] = window['dependencies-without-mapping'] || {};

sap.ui.define(['./module2'], function(module2) {
	"use strict";
	var moduleExport = {
		name: 'module1',
		module2: module2
	};
	window['dependencies-without-mapping'].module1 = moduleExport;
	return moduleExport;
});

window['dependencies-without-mapping'].afterDefineModule1 = {
	module1: sap.ui.require('fixture/dependencies-without-mapping/module1'),
	module1Global: window['dependencies-without-mapping'].module,
	module2: sap.ui.require('fixture/dependencies-without-mapping/module2'),
	module3: sap.ui.require('fixture/dependencies-without-mapping/module3')
};