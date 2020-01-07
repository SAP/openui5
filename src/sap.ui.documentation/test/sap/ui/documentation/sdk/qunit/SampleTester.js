/*global QUnit */

sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/Component",
	"sap/ui/core/ComponentContainer",
	"sap/ui/core/util/LibraryInfo",
	"sap/ui/model/odata/ODataModel",
	"sap/m/App",
	"sap/m/Page",
	"sap/ui/thirdparty/jquery",
	"sap/ui/thirdparty/URI",
	"sap/ui/thirdparty/sinon",
	"sap/ui/thirdparty/sinon-qunit"
], function(Log, Component, ComponentContainer, LibraryInfo, ODataModel, App, Page, jQuery, URI) {

	"use strict";

	var oLog = Log.getLogger("SampleTester");

	function wait(iDelay) {
		return new Promise(function(resolve) {
			setTimeout(function() {
				resolve();
			}, iDelay);
		});
	}

	function fetchHEAD(url) {
		return Promise.resolve(
			jQuery.ajax({
				url: url,
				type: 'HEAD'
			})
		).then(function() {
			return true;
		}, function() {
			return false;
		});
	}

	/* converts a global name to a resource (module) name */
	function toResourceName(name) {
		return name.replace(/\./g, "/");
	}

	function isLocaleSpecificResource(sResource) {
		// check for a locale-like name suffix and the extension .properties
		return /_[a-zA-Z]{2}(?:_[^/]+)?\.properties$/.test(sResource);
	}

	function RequestCollector(sandbox, baseUrl) {
		var oRequireLoadSpy = sandbox.spy(sap.ui.require, "load");
		var oAsyncRequestSpy = sandbox.spy(jQuery, "ajax");

		this.resources = function() {
			var aResources = [].concat(
					oAsyncRequestSpy.getCalls().map(function(oCall) {
						return typeof oCall.args[0] === "string" ? oCall.args[0] : oCall.args[0].url;
					}),
					oRequireLoadSpy.getCalls().map(function(oCall) {
						return oCall.args[1];
					})
				);

			var aSampleRequests = [];
			aResources.forEach(function(sResourceUrl) {
				sResourceUrl = new URI(sResourceUrl, document.baseURI).search("").hash("").toString();
				// only add requests from within the sample and no duplicates
				if ( sResourceUrl.startsWith(baseUrl) ) {
					sResourceUrl = sResourceUrl.slice(baseUrl.length);
					if ( aSampleRequests.indexOf(sResourceUrl) < 0 && sResourceUrl !== "Component.js" ) {
						aSampleRequests.push(sResourceUrl);
					}
				}
			});

			return aSampleRequests;
		};
	}

	var SampleTester = function(sLibraryName, aExcludes) {
		this._sLibraryName = sLibraryName;
		this._aExcludes = aExcludes || [];
		this._iTimeout = 200;

		this._oApp = new App({
			initialPage: "page",
			pages: [
				this._oPage = new Page("page", {
					title: "Page under Test"
				})
			]
		});

		var oLibInfo = new LibraryInfo();
		oLibInfo._getDocuIndex(sLibraryName, function(oData) {

			// wait with test creation until all libs are loaded
			sap.ui.getCore().attachInit(function() {
				this._createTests(oData && oData.explored);
			}.bind(this));

		}.bind(this));

	};

	SampleTester.prototype.setTimeout = function(iTimeout) {
		this._iTimeout = iTimeout;
		return this;
	};

	SampleTester.prototype.placeAt = function(sId) {
		this._oApp.placeAt(sId);
		return this;
	};

	SampleTester.prototype._createTests = function(oExploredIndex) {

		var iTimeout = this._iTimeout;
		var oApp = this._oApp;
		var oPage = this._oPage;
		var sLibraryName = this._sLibraryName;

		oLog.info("starting to define tests for the samples of '" + this._sLibraryName + "'");

		QUnit.module(this._sLibraryName, {
			beforeEach: function() {
				// clear metadata cache
				ODataModel.mServiceData = {};
			},
			afterEach : function(assert) {
				if (window.Flexie) {
					oLog.info("destroy flexie instances");
					window.Flexie.destroyInstance();
				}
				// empty the page after each test, even in case of failures
				oPage.setTitle("---");
				oPage.destroyContent();
			}
		});

		function shorten(id) {
			return id.replace(sLibraryName + ".", "");
		}

		function makeTest(sampleConfig) {

			QUnit.test("Launch " + sampleConfig.name + " (" + shorten(sampleConfig.id) + ")", function(assert) {

				// display the sample name
				oPage.setTitle(sampleConfig.name);

				var sComponentBaseUrl = new URI(sap.ui.require.toUrl(toResourceName(sampleConfig.id)) + "/", document.baseURI).toString();
				var oCollector = new RequestCollector(this, sComponentBaseUrl);
				var done = assert.async();

				Component.create({
					name: sampleConfig.id,
					manifest: false
				}).then(function(oComponent) {
					// if root control is a view, wait for it being loaded
					if ( oComponent.getRootControl() && typeof oComponent.getRootControl().loaded === "function" ) {
						return oComponent.getRootControl().loaded().then(function() {
							return oComponent;
						});
					}
					return oComponent;
				}).then(function(oComponent) {

					// load and create content
					oPage.addContent(
						new ComponentContainer({
							component: oComponent
						})
					);

					// wait for the rendering
					return wait(iTimeout).then(function() {
						return oComponent;
					});

				}).then(function(oComponent) {

					var oConfig = oComponent.getMetadata().getConfig();
					var aListedResources = oConfig && oConfig.sample && Array.isArray(oConfig.sample.files) ? oConfig.sample.files : [];
					var aRequestedResources = oCollector.resources();

					// check whether all files listed in the sample's component really exist
					var pListed = Promise.all(
						aListedResources.map(function(sResource) {
							return fetchHEAD(sComponentBaseUrl + sResource).then(function(exists) {
								assert.ok(exists, "listed resource '" + sResource + "' should be downloadable");
							});
						})
					);

					// check further constraints
					//assert.ok(aListedResources.indexOf("Component.js") < 0, "'Component.js' should not be listed as resource, it is added automatically");
					assert.ok(aListedResources.indexOf("index.html") < 0, "'index.html' should not be listed as resource, it is added automatically");

					// check whether all files loaded by the sample are listed in the sample's component
					var pRequested = Promise.all(
						aRequestedResources.map(function(sResource) {

							// ignore locale-specific i18n file names (like i18n_en_US.properties and i18n_en.properties)
							if ( isLocaleSpecificResource(sResource) ) {
								return;
							}

							var p;
							// cross-check requested resources against the listed resources
							if ( aListedResources.indexOf(sResource) >= 0 ) {
								p = Promise.resolve(false);
							} else {
								p = fetchHEAD(sComponentBaseUrl + sResource);
							}

							// check if resource exists, but is not listed
							return p.then(function(existsButNotListed) {
								assert.ok(!existsButNotListed, "requested resource '" + sResource + "' should be listed");
							});
						})
					);

					return Promise.all([pListed, pRequested]);

				}).catch(function(err) {
					// if an error occurred during component loading or creation, report it and let test fail
					assert.pushResult({
						result: false,
						actual: err,
						expected: null,
						message: "no error should have occurred during component loading and creation"
					});
				}).finally(done);  // do not rely on QUnit's promise handling to be able to run with QUnit 1
			});

		}

		// register sample resources
		var oPaths = {};
		if (Array.isArray(oExploredIndex.samplesRef)) {
			// register an array of namespaces
			oExploredIndex.samplesRef.forEach(function (oItem) {
				oPaths[toResourceName(oItem.namespace)] = String(oItem.ref);
			});
		} else if (oExploredIndex && oExploredIndex.samplesRef) {
			// register a single namespace
			oPaths[toResourceName(oExploredIndex.samplesRef.namespace)] = String(oExploredIndex.samplesRef.ref);
		}
		sap.ui.loader.config({
			paths: oPaths
		});

		// add step based samples (tutorials and others, comment this out if the run-time is getting too long)
		oExploredIndex.entities.forEach(function (oEnt) {
			var fnPrependZero,
				oStep,
				i = 0;

			if (oEnt.samplesAsSteps) {
				// helper function to add a leading 0 for all samples (folders will start with 01)
				fnPrependZero = function (iNumber) {
					if (iNumber.toString().length === 1) {
						return "0" + iNumber;
					}
					return iNumber;
				};

				for (; i < oEnt.samplesAsSteps.length; i++) {
					oStep = {
						"id": oEnt.id + "." + fnPrependZero(i + 1),
						"name": oEnt.name + " - Step " + (i + 1) + " - " + oEnt.samplesAsSteps[i]
					};
					oExploredIndex.samples.push(oStep);
				}
			}
		});

		var aSamples = oExploredIndex && oExploredIndex.samples;

		var nTests;
		if (aSamples) {
			nTests = 0;
			for (var i = 0; i < aSamples.length; i++ ) {
				if ( this._aExcludes.indexOf(aSamples[i].id) < 0 ) {
					oLog.info("adding test for sample '" + aSamples[i].name + "'");
					makeTest(aSamples[i]);
					nTests++;
				} else {
					oLog.info("ignoring sample '" + aSamples[i].name + "'");
				}
			}

		}

		if (nTests === 0) {
			oLog.info("no samples found, adding dummy test");
			QUnit.test("Dummy", function(assert) {
				assert.ok(true);
			});
		}

		// hide content area after all tests
		QUnit.done(function() {
			var oUIArea = oApp.getUIArea();
			if (oUIArea) {
				jQuery(oUIArea.getRootNode()).hide();
			}
		});

		// now QUnit can start processing the tests
		oLog.info("start tests");
		QUnit.start();

	};

	return SampleTester;

});