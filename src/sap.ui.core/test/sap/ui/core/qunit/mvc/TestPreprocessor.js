/*!
* ${copyright}
*/

// Provides object TestPreprocessor
sap.ui.define(['jquery.sap.global', 'sap/ui/base/Object'],
	function(jQuery, BaseObject) {
		'use strict';

		var TestPreprocessor = BaseObject.extend("sap.ui.core.qunit.mvc.TestPreprocessor", {});

		TestPreprocessor.process = function(vSource, sCaller, mSettings) {
			jQuery.sap.log.debug("[TEST] " + mSettings.message, sCaller);
			mSettings.assert(true, "TestPreprocessor executed");
			if(mSettings.attach) {
				vSource.attachAfterInit(mSettings.attach);
			}
			return Promise.resolve(vSource);
		};

		return TestPreprocessor;

	}, /* bExport= */ true);
