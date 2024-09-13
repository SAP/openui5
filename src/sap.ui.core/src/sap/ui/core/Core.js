/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/config",
	"sap/base/util/Deferred",
	"sap/ui/Global",
	"sap/ui/core/boot/loadBootManifest"
], (
	config,
	Deferred,
	Global,
	loadBootManifest
) => {
	"use strict";

	// ready state
	const pReady = new Deferred();
	let bReady = false;
	let oBootManifest;

	/**
	 * The Core.
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @public
	 * @alias module:sap/ui/core/Core
	 * @namespace
	 */
	const Core = {
		/** Returns a Promise that resolves if the Core is initialized.
		 *
		 * @param {function():void} [fnReady] If the Core is ready the function will be called immediately, otherwise when the ready Promise resolves.
		 * @returns {Promise<undefined>} The ready promise
		 * @public
		 */
		ready: (fnReady) => {
			if (fnReady && bReady) {
				fnReady();
			} else {
				pReady.promise.then(fnReady);
			}
			return pReady.promise;
		},

		/**
		 * The Core version, e.g. '1.127.0'
		 * @name sap.ui.core.Core.version
		 * @final
		 * @type {string}
		 * @static
		 * @since 1.127
		 * @private
		 * @ui5-restricted sap.ui.core, sap.ui.test
		 */
		version: "${version}",

		/**
		 * The buildinfo.
		 * @typedef {object} sap.ui.core.Core.BuildInfo
		 * @property {string} buildtime the build timestamp, e.g. '20240625091308'
		 * @since 1.127
		 * @private
		 * @ui5-restricted sap.ui.core, sap.ui.test
		 */

		/**
		 * The buildinfo, containing a build timestamp.
		 * @name sap.ui.core.Core.buildinfo
		 * @final
		 * @type {sap.ui.core.Core.BuildInfo}
		 * @static
		 * @since 1.127
		 * @private
		 * @ui5-restricted sap.ui.core, sap.ui.test
		 */
		buildinfo: Object.assign({}, Global.buildinfo)
	};

	// freeze since it is exposed as a property on the Core and must not be changed at runtime
	Object.freeze(Core.buildinfo);

	//Helper for loading tasks from manifest
	function loadTasks(aTasks) {
		aTasks = aTasks || [];
		return new Promise((resolve, reject) => {
			sap.ui.require(aTasks, function() {
				resolve(Array.from(arguments));
			},reject);
		});
	}

	//Helper for executing boot tasks in correct order
	function executeTasks(aTasks, context) {
		return Promise.all(
			aTasks.map((task) => {
				return task.run(context);
			})
		);
	}

	// bootstrap sequence
	// load manifest
	loadBootManifest().then((oManifest) => {
		oBootManifest = oManifest;
		// load config providers
		return loadTasks(oBootManifest.config);
	}).then((aProvider) => {
		// add provider to config
		const aLoaded = [];
		for (const provider of aProvider) {
			config.registerProvider(provider);
			if (provider.loaded) {
				aLoaded.push(provider.loaded());
			}
		}
		/*
		 * ConfigurationProvider resource roots must be configured in global 'sap-ui-config' as we do for the boot manifest.
		 */
		return Promise.all(aLoaded).then(() => {
			config._.freeze();
			return loadTasks(["sap/ui/core/boot/config"]);
		});
	}).then(() => {
		return loadTasks(oBootManifest.preBoot);
	}).then((aTasks) => {
		// execute pre boot tasks
		return executeTasks(aTasks, config);
	}).then(() => {
		// load core boot tasks
		return loadTasks(oBootManifest.boot);
	}).then((aTasks) => {
		// execute core boot tasks
		return executeTasks(aTasks);
	}).then(() => {
		// load post boot tasks
		return loadTasks(oBootManifest.postBoot);
	}).then((aTasks) => {
		// execute post boot tasks
		return executeTasks(aTasks);
	}).then(() => {
		pReady.resolve();
		bReady = true;
	}).then(() => {
		return loadTasks(["sap/ui/core/boot/Init"]);
	}).then((aTasks) => {
		// execute init tasks
		return executeTasks(aTasks);
	}).catch((err) => {
		pReady.reject(err);
	});

	return Core;
});
