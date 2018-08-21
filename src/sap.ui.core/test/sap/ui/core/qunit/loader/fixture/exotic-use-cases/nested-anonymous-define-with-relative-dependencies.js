sap.ui.define(['./deferred', './dependency1', 'require', 'module'], function(deferred, dependency1, outerRequire, outerModule) {
	"use strict";

	/*
	 * This is a nested, anonymous sap.ui.define call.
	 *
	 * Standard AMD loaders can't handle such a call as they can't determine an ID without a require call.
	 * The legacy UI5 implementation of sap.ui.define unintentionally handled such calls by reusing the ID
	 * of the outer module. This even allowed to use relative module IDs in the nested call which then
	 * have been resolved in the context of the outer module.
	 *
	 * For compatibility reasons, ui5loader.js supports this broken use case with the means of 'anonymous' module IDs.
	 */
	sap.ui.define([
		'./dependency2', // tests resolution of relative module IDs
		'require',
		'module'
	], function(dependency2, innerRequire, innerModule) {
		deferred.resolve({
			dependency1: dependency1,
			dependency2: dependency2,
			outerModule: outerModule,
			outerUrl: outerRequire.toUrl('./data.json'),
			innerModule: innerModule,
			innerUrl: outerRequire.toUrl('./data.json')
		});
	});

	return "main";
});