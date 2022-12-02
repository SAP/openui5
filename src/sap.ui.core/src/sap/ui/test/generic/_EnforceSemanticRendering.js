/*!
 * ${copyright}
 */

/* global QUnit */
sap.ui.define([], function() {
	"use strict";

	/**
	 * @namespace
	 * @private
	 * @ui5-restricted SAPUI5 Distribution Layer Libraries
	 */
	var _EnforceSemanticRendering = {
		/**
		 * @param {object} mLibInfo Info object containing the library name and an array with excludes
		 * @param {string} mLibInfo.library The library name in dot notation, e.g. "sap.ui.core"
		 * @param {string[]} mLibInfo.exlcudes An array of control names in dot notation, which are NOT migrated and should be excluded from the test
		 * @returns {Promise<undefined>} Returns resovled Promise after all tests are executed
		 *
		 * @private
		 * @ui5-restricted SAPUI5 Distribution Layer Libraries
		 */
		run : function(mLibInfo) {
			var sLib = mLibInfo.library;
			var aExcludes = mLibInfo.excludes || [];

			return new Promise(function(res, rej) {
				sap.ui.getCore().loadLibrary(sLib, { async: true }).then(function(library) {
					var aControls = (library && library.controls) || [];
					var aPromises = [];

					aControls.forEach(function(sClass) {
						// Generate QUnit test for all controls
						aPromises.push(new Promise(function(res, rej) {
							var oInfo = {
								control: sClass
							};

							var sControlClass = sClass.replace(/\./g, "/");
							sap.ui.require([sControlClass], function(ControlClass) {
								try {
									var oRenderer = ControlClass.getMetadata().getRenderer();

									if (oRenderer) {
										oInfo.version = Object.prototype.hasOwnProperty.call(oRenderer, "apiVersion") ? oRenderer.apiVersion : 1;

										if (aExcludes.includes(sClass)) {
											if (oInfo.version == 2) {
												oInfo.wrongExclude = true;
												oInfo.description = "defined in the excludes";
											} else { // version 1
												oInfo.skip = true;
											}
										}
									} else {
										oInfo.description = "No Renderer Class available";
										oInfo.skip = true;
									}

								} catch (e) {
									oInfo.description = "No Renderer Class available";
									oInfo.skip = true;
								}

								res(oInfo);
							}, function() {
								oInfo.description = "Control Class could not be loaded";

								if (aExcludes.includes(sClass)) {
									oInfo.skip = true;
								} // else don't skip if control class is not maintained in excludes

								res(oInfo);
							});
						}));
					});

					res(aPromises);
				});
			}).then(function(aPromises) {
				// Add tests
				return new Promise(function(res, rej) {
					Promise.all(aPromises).then(function(aInfo) {
						QUnit.module("EnforceSemanticRendering Tests: " + mLibInfo.library);

						QUnit.test("library controls loaded", function(assert) {
							assert.ok(aInfo, aInfo.length + " controls loaded");
						});

						aInfo.forEach(function(oInfo) {
							QUnit[oInfo.skip ? "skip" : "test"](oInfo.control + " " + (oInfo.description || ""), function(assert) {
								if (oInfo.wrongExclude) {
									assert.ok(false, "The control '" + oInfo.control + "' is maintained in the exclude configuration, but its renderer is configured with apiVersion 2.");
								} else {
									assert.equal(oInfo.version, 2, "Semantic Rendering enabled.");
								}
							});
						});

						res();
					});
				});
			});
		}
	};

	return _EnforceSemanticRendering;
});
