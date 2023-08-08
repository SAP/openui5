/*!
 * ${copyright}
 */
QUnit.config.autostart = false;

sap.ui.require([
	"sap/base/Log",
	"sap/ui/core/Core",
	"sap/ui/core/cache/CacheManager",
	"sap/ui/core/sample/common/pages/Any",
	"sap/ui/core/sample/odata/v4/LateProperties/pages/Main",
	"sap/ui/model/odata/v4/ODataModel",
	"sap/ui/test/opaQunit",
	"sap/ui/core/sample/odata/v4/LateProperties/SandboxModel" // preload only
], function (Log, Core, CacheManager, Any, Main, ODataModel, opaTest) {
	"use strict";

	Core.ready().then(function () {
		var sDefaultLanguage = sap.ui.getCore().getConfiguration().getLanguage(),
			oSkipPromise = new Promise(function (fnResolve) {
				var sKey = "sap.ui.model.odata.v4.optimisticBatch:smokeTest";

				// detect whether CacheManager is supported in this enviroment
				CacheManager.set(sKey, {foo : "bar"}).then(function () {
					return CacheManager.has(sKey).then(function (bExists) {
						return fnResolve(!bExists);
					});
				});
			});

		QUnit.module("sap.ui.core.sample.odata.v4.LateProperties.optimisticBatch", {
			before : function () {
				sap.ui.getCore().getConfiguration().setLanguage("en-US");
				ODataModel.cleanUpOptimisticBatch();
			},
			after : function () {
				sap.ui.getCore().getConfiguration().setLanguage(sDefaultLanguage);
				ODataModel.cleanUpOptimisticBatch();
			}
		});

		oSkipPromise.then(function (bUnsupported) {
			if (bUnsupported) {
				QUnit.test("Test within unsupported CacheManager environment", function (assert) {
					// OPA below works only in supported environments, but each test module has to
					// provide at least one test result
					assert.ok(true);
				});
				QUnit.start();

				return;
			}

			//*****************************************************************************
			opaTest("Test optimistic batch behavior:", function (Given, When, Then) {
				When.onAnyPage.applyOptimisticBatchObserver({
					deleteCache : true,
					enablerResult : undefined,
					isFirstAppStart : true,
					title : "Standard, w/o OptimisticBatchEnabler"
				});
				Given.iStartMyUIComponent({
					autoWait : true,
					componentConfig : {
						name : "sap.ui.core.sample.odata.v4.LateProperties"
					}
				});
				Then.onAnyPage.checkOptimisticBatch();
				Then.onAnyPage.checkLog();
				Then.iTeardownMyUIComponent();

				//*****************************************************************************
				When.onAnyPage.applyOptimisticBatchObserver({
					enablerResult : false,
					isFirstAppStart : true,
					title : "OptimisticBatchEnabler returns false"
				});
				Given.iStartMyUIComponent({
					autoWait : true,
					componentConfig : {
						name : "sap.ui.core.sample.odata.v4.LateProperties"
					}
				});
				Then.onAnyPage.checkOptimisticBatch();
				Then.onAnyPage.checkLog();
				Then.iTeardownMyUIComponent();

				//*****************************************************************************
				When.onAnyPage.applyOptimisticBatchObserver({
					enablerResult : true,
					isFirstAppStart : true,
					title : "OptimisticBatchEnabler returns true, 1st app start"
				});
				Given.iStartMyUIComponent({
					autoWait : true,
					componentConfig : {
						name : "sap.ui.core.sample.odata.v4.LateProperties"
					}
				});
				Then.onAnyPage.checkOptimisticBatch();
				Then.onAnyPage.checkLog();
				Then.iTeardownMyUIComponent();

				//*****************************************************************************
				When.onAnyPage.applyOptimisticBatchObserver({
					isFirstAppStart : false,
					enablerResult : true,
					title : "OptimisticBatchEnabler returns true, 2nd app start"
				});
				Given.iStartMyUIComponent({
					autoWait : true,
					componentConfig : {
						name : "sap.ui.core.sample.odata.v4.LateProperties"
					}
				});
				Then.onAnyPage.checkOptimisticBatch();
				Then.onAnyPage.checkLog();
				Then.iTeardownMyUIComponent();

				//*****************************************************************************
				When.onAnyPage.applyOptimisticBatchObserver({
					appChanged : true,
					enablerResult : true,
					isFirstAppStart : false,
					sendRequestCallCount : 2,
					title : "OptimisticBatchEnabler returns true, 3rd start, app changed, response "
						+ "skipped"
				});
				Given.iStartMyUIComponent({
					autoWait : true,
					componentConfig : {
						name : "sap.ui.core.sample.odata.v4.LateProperties"
					}
				});
				Then.onAnyPage.checkOptimisticBatch();
				Then.onAnyPage.checkLog([{
					component : "sap.ui.model.odata.v4.lib._Requestor",
					level : Log.Level.WARNING,
					message : "optimistic batch: mismatch, response skipped"
				}]);
				Then.iTeardownMyUIComponent();

				//*****************************************************************************
				When.onAnyPage.applyOptimisticBatchObserver({
					appChanged : true,
					enablerResult : true,
					isFirstAppStart : false,
					title : "OptimisticBatchEnabler returns true, 4th start, app changed, response "
						+ "consumed"
				});
				Given.iStartMyUIComponent({
					autoWait : true,
					componentConfig : {
						name : "sap.ui.core.sample.odata.v4.LateProperties"
					}
				});
				Then.onAnyPage.checkOptimisticBatch(true/*cleanUp*/);
				Then.onAnyPage.checkLog();
				Then.iTeardownMyUIComponent();
			});

			QUnit.start();
		});
	});
});
