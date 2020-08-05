window['cyclic-dependency-without-mapping'] = window['cyclic-dependency-without-mapping'] || {};

sap.ui.define(['./module2'], function(module2) {
	"use strict";

	var moduleExport = {
		name: 'module1',
		module2: module2
	};

	window['cyclic-dependency-without-mapping'].module1 = moduleExport;
	return moduleExport;
});

window['cyclic-dependency-without-mapping'].afterDefineModule1 = {
	module1: sap.ui.require('fixture/cyclic-dependency-without-mapping/module1'),
	module1Global: window['cyclic-dependency-without-mapping'].module1,
	module2: sap.ui.require('fixture/cyclic-dependency-without-mapping/module2'),
	module3: sap.ui.require('fixture/cyclic-dependency-without-mapping/module3')
};