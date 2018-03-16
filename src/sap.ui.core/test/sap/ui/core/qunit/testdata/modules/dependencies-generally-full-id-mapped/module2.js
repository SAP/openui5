sap.ui.define([
	'modules/dependencies-generally-full-id-mapped/module-alias1',
	'modules/dependencies-generally-full-id-mapped/module1',
	'./module1'
], function(module1Alias, module1FullName, module1RelativeName) {
	return {
		name: 'module2',
		module1Alias: module1Alias,
		module1FullName: module1FullName,
		module1RelativeName: module1RelativeName
	};
});
