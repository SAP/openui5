/*!
* ${copyright}
*/

// Provides object TestPreprocessor
sap.ui.define(['sap/base/Log', 'sap/ui/base/Object'],
	function(Log, BaseObject) {
		'use strict';

		var TestPreprocessor = BaseObject.extend("sap.ui.core.qunit.mvc.TestPreprocessor", {});

		TestPreprocessor.process = function(vSource, sCaller, mSettings) {
			Log.debug("[TEST] " + mSettings.message, sCaller);
			mSettings.assert(true, "TestPreprocessor executed");
			if (mSettings.attach) {
				vSource.attachAfterInit(mSettings.attach);
			}
			return Promise.resolve(vSource);
		};

		TestPreprocessor.getCacheKey = function(oViewInfo) {
			return Promise.resolve("foo");
		};

		return TestPreprocessor;

	});
