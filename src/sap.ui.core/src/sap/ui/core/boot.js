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
	"sap/base/config/_Configuration",
	"sap/base/util/Deferred",
	"sap/ui/core/boot/initDOM",
	"sap/ui/core/boot/loadManifest",
	"sap/ui/core/boot/onInit"
], function(
	_Configuration,
	Deferred,
	initDOM,
	loadManifest
	/* onInit --> register app resources early */
) {
	"use strict";

	// ready state
	var bReady = false;
	var pReady = new Deferred();
	var oBootManifest;

	// create boot facade
	var boot = {
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

	// create writable config instance for preBoot tasks
	var config = _Configuration.getWritableBootInstance();
	// burn after reading
	delete _Configuration.getWritableBootInstance;

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
		return executeTasks(aTasks, config);
	}).then(function() {
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
}, true);