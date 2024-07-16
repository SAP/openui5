/*!
 * ${copyright}
 */

/**
 * Boot UI5
 *
 * @private
 * @ui5-restricted sap.ui.core
 */
sap.ui.define([
	"sap/base/Log",
	"sap/base/config/_Configuration",
	"sap/base/config/GlobalConfigurationProvider",
	"sap/base/util/Deferred",
	"sap/ui/core/boot/initDOM",
	"sap/ui/core/boot/loadManifest",
	"sap/ui/core/boot/onInit"
], function(
	Log,
	_Configuration,
	GlobalConfigurationProvider,
	Deferred,
	initDOM,
	loadManifest
	/* onInit --> register app resources early */
) {
	"use strict";

	// increase log level to ensure the warning will be locked
	var iLogLevel = Log.getLevel();
	Log.setLevel(Log.Level.WARNING);
	Log.warning("sap-ui-boot.js: This is a private module, its API must not be used in production and is subject to change!");
	// reset log level to old value
	Log.setLevel(iLogLevel);

	// ready state
	var bReady = false;
	var pReady = new Deferred();
	var oBootManifest;

	// create boot facade
	var boot = {
		/** Returns a Promise that resolves if the Core is initialized.
		 *
		 * @param {function():void} [fnReady] If the Core is ready the function will be called immediately, otherwise when the ready Promise resolves.
		 * @returns {Promise<undefined>} The ready promise
		 * @private
		 */
		ready: function(fnReady) {
			if (fnReady && bReady) {
				fnReady();
			} else {
				pReady.promise.then(fnReady);
			}
			return pReady.promise;
		}
	};

	// run initDOM for early paint
	var pInitDOM = initDOM.run(boot);

	//Helper for loading tasks from manifest
	function loadTasks(aTasks) {
		aTasks = aTasks || [];
		var pLoaded = new Promise(function(resolve, reject) {
			sap.ui.require(aTasks, function() {
				resolve(Array.from(arguments));
			},reject);
		});
		return pLoaded;
	}

	//Helper for executing boot tasks in correct order
	function executeTasks(aTasks, context) {
		return Promise.all(aTasks.map(function(task) {
			return task.run(context);
		}));
	}

	// bootstrap sequence
	// load manifest
	loadManifest().then(function(oManifest) {
		oBootManifest = oManifest;
		// load pre boot tasks
		return loadTasks(oBootManifest.preBoot);
	}).then(function(aTasks) {
		// execute pre boot tasks
		return executeTasks(aTasks);
	}).then(function() {
		GlobalConfigurationProvider.freeze();
		// load core boot tasks
		return loadTasks(oBootManifest.boot);
	}).then(function(aTasks) {
		// execute core boot tasks
		return executeTasks(aTasks, boot);
	}).then(function() {
		// load post boot tasks
		return loadTasks(oBootManifest.postBoot);
	}).then(function(aTasks) {
		// execute post boot tasks and weait for DOM ready
		return Promise.all([executeTasks(aTasks), pInitDOM]);
	}).then(function() {
		pReady.resolve();
		bReady = true;
	}).catch(pReady.reject);

	return boot;
});