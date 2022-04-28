/*!
 * ${copyright}
 */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"sap/base/Log",
		"sap/ui/core/cache/CacheManager",
		"sap/ui/core/sample/common/pages/Any",
		"sap/ui/core/sample/odata/v4/LateProperties/pages/Main",
		"sap/ui/test/opaQunit"
	], function (Log, CacheManager, Any, Main, opaTest) {
		var sDefaultLanguage = sap.ui.getCore().getConfiguration().getLanguage(),
			sKey = "sap.ui.model.odata.v4.optimisticBatch:smokeTest",
			oSkipPromise = new Promise(function (fnResolve) {
				// detect whether CachManager is supported in this enviroment
				CacheManager.set(sKey, {foo : "bar"}).then(function () {
					return CacheManager.has(sKey).then(function (bExists) {
						return fnResolve(!bExists);
					});
				});
			});

		QUnit.module("sap.ui.core.sample.odata.v4.LateProperties.optimisticBatch", {
			before : function () {
				sap.ui.getCore().getConfiguration().setLanguage("en-US");
			},
			after : function () {
				sap.ui.getCore().getConfiguration().setLanguage(sDefaultLanguage);
				CacheManager.del(sKey);
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
					title : "OptimisticBatchEnabler returns true, 4rd start, app changed, response "
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
