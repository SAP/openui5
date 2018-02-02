/*global QUnit,sinon*/

sap.ui.define([
	"jquery.sap.global",
	"sap/ui/core/Component",
	"sap/ui/core/ComponentContainer",
	"sap/ui/core/util/LibraryInfo",
	"sap/ui/model/odata/ODataModel",
	"sap/m/App",
	"sap/m/Page",
	"sap/ui/thirdparty/sinon",
	"sap/ui/thirdparty/sinon-qunit"
], function(jQuery, Component, ComponentContainer, LibraryInfo, ODataModel, App, Page) {

	"use strict";

	var oLog = jQuery.sap.log.getLogger("SampleTester");

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

			QUnit.test(sampleConfig.name + " (" + shorten(sampleConfig.id) + ")", function(assert) {

				// clear metadata cache
				ODataModel.mServiceData = {};

				// display the sample name
				oPage.setTitle(sampleConfig.name);

				var oComponent = sap.ui.component({
					name: sampleConfig.id
				});

				// spy on all resources loaded by the sample
				var oAsyncRequestSpy = sinon.spy(jQuery, "ajax");
				var oSyncRequestSpy = sinon.spy(jQuery.sap, "sjax");
				var aSampleRequests = [];

				// load and create content
				oPage.addContent(
					new ComponentContainer({
						component: oComponent
					})
				);

				// wait for the rendering
				var done = assert.async();
				setTimeout(function() {
					// evaluate all sync and async calls triggered by this component
					var sSampleUrl = jQuery.sap.getModulePath(sampleConfig.id) + "/";
					oAsyncRequestSpy.getCalls().concat(oSyncRequestSpy.getCalls()).forEach(function (oCall) {
						var sResourceUrl = (typeof oCall.args[0] === "string" ? oCall.args[0] : oCall.args[0].url),
							iIndex = sResourceUrl.indexOf(sSampleUrl);

						// only add requests from within the sample and no duplicates
						if (iIndex >= 0 && aSampleRequests.indexOf(sResourceUrl) < 0) {
							aSampleRequests.push(sResourceUrl);
						}
					});
					oAsyncRequestSpy.restore();
					oSyncRequestSpy.restore();

					// check if all files loaded by the sample are listed in the sample's component
					var oConfig = oComponent.getMetadata().getConfig();
					aSampleRequests.forEach(function (sResourceUrl) {
						// chop of ./ in the beginning
						sResourceUrl = (sResourceUrl.indexOf("./") === 0 ? sResourceUrl.substr(2) : sResourceUrl);

						// ignore local-specific i18n file names (like i18n_en_US.properties and i18n_en.properties)
						if (sResourceUrl.split("/").pop().indexOf("i18n_") === 0) {
							return;
						}

						// cross-check found files against the sample config
						var bFound = oConfig.sample.files.some(function (sFile) {
							var sFileUrl = jQuery.sap.getModulePath(sampleConfig.id, '/' + sFile);

							return sFileUrl === sResourceUrl;
						});

						// check if file is not existing
						if (!bFound) {
							jQuery.ajax({
								url: sResourceUrl,
								async: false,
								type: 'HEAD',
								error: function() {
									// file does not exist, ignore it
									bFound = true;
								}
							});
						}

						// extract the local filename
						var iIndex = sResourceUrl.indexOf(sSampleUrl),
							sLocalResource = sResourceUrl.substr(iIndex + sSampleUrl.length);

						assert.ok(bFound, "file used in sample '" + sLocalResource + "' should be listed in sample component");
					});

					done();
				}, iTimeout);

				// check if all files listed in the sample's component exist
				var oConfig = oComponent.getMetadata().getConfig();
				if ( oConfig && oConfig.sample && oConfig.sample.files ) {
					for (var i = 0; i < oConfig.sample.files.length; i++) {
						var sFile = oConfig.sample.files[i],
							sUrl = jQuery.sap.getModulePath(sampleConfig.id, '/' + sFile);

						assert.ok(jQuery.sap.syncHead(sUrl), "listed sample component file '" + sFile + "' should be downloadable");
					}
				}
			});

		}

		// register sample resources
		if (Array.isArray(oExploredIndex.samplesRef)) {
			// register an array of namespaces
			oExploredIndex.samplesRef.forEach(function (oItem) {
				jQuery.sap.registerModulePath(oItem.namespace, "" + oItem.ref);
			});
		} else if (oExploredIndex && oExploredIndex.samplesRef) {
			// register a single namespace
			jQuery.sap.registerModulePath(oExploredIndex.samplesRef.namespace, "" + oExploredIndex.samplesRef.ref);
		}

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
				jQuery.sap.byId(oUIArea.getId()).hide();
			}
		});

		// now QUnit can start processing the tests
		oLog.info("start tests");
		QUnit.start();

	};

	return SampleTester;

});