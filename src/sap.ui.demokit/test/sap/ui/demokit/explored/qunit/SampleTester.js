sap.ui.define([
		'sap/ui/core/Component',
		'sap/ui/core/ComponentContainer',
		'sap/ui/core/util/LibraryInfo',
		'sap/ui/model/odata/ODataModel',
		'sap/m/App',
		'sap/m/Page'
	], function(Component, ComponentContainer, LibraryInfo, ODataModel, App, Page) {

	"use strict";

	// global QUnit
	
	var SampleTester = function(sLibraryName, aExcludes) {

		var that = this;
		
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
			
			// wait with text creation until all libs are loaded
			sap.ui.getCore().attachInit(function() {
				that._createTests(oData && oData.explored);
			});
			
		});

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

		QUnit.module(this._sLibraryName, {
			afterEach : function(assert) {
				// empty the page after each test, even in case of failures
				oPage.setTitle("---");
				oPage.destroyContent();
			}
		});

		function makeTest(sampleConfig) {

			QUnit.test(sampleConfig.name, function(assert) {
				
				// clear metadata cache
				ODataModel.mServiceData = {};

				// display the sample name
				oPage.setTitle(sampleConfig.name);
				
				// load and create content
				oPage.addContent(
					new ComponentContainer({
						component: sap.ui.component({
							name: sampleConfig.id
						})
					})
				);

				// wait for the rendering
				var done = assert.async();
				setTimeout(function() {
					assert.ok(true, sampleConfig.description || "sample " + sampleConfig.name);
					
					done();
				}, iTimeout);

			});
			
		}

		var oSamplesRef = oExploredIndex && oExploredIndex.samplesRef;
		if ( oSamplesRef ) {
			jQuery.sap.registerModulePath(oSamplesRef.namespace, oSamplesRef.ref);
		}

		var aSamples = oExploredIndex && oExploredIndex.samples;
		if ( aSamples ) {
			
			var nTests = 0;
			for (var i = 0; i < aSamples.length; i++ ) {
				if ( this._aExcludes.indexOf(aSamples[i].id) < 0 ) {
					makeTest(aSamples[i]);
					nTests++;
				}
			}
			
		}

		if ( nTests == 0 ) {
			QUnit.test("Dummy", function(assert) {
				assert.ok(true);
			});
		}

		// hide content area after all tests
		QUnit.done(function() {
			var oUIArea = oApp.getUIArea();
			if ( oUIArea ) { 
				jQuery.sap.byId(oUIArea.getId()).hide();
			}
		});

	};

	return SampleTester;

});