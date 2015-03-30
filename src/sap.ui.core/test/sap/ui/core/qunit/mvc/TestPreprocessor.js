/*!
* ${copyright}
*/

// Provides object TestPreprocessor
sap.ui.define(['jquery.sap.global', 'sap/ui/core/mvc/Preprocessor'],
	function(jQuery, Preprocessor) {
		'use strict';

		var TestPreprocessor = Preprocessor.extend("sap.ui.core.qunit.mvc.TestPreprocessor", {});

		TestPreprocessor.process = function(vSource, sCaller, mSettings) {
			jQuery.sap.log.debug("[TEST] " + mSettings.message, sCaller);
			mSettings.assert(true, "TestPreprocessor executed");
			return new Promise(function(resolve) {
				resolve(vSource);
				mSettings.start();
			});
		};

		return TestPreprocessor;

	}, /* bExport= */ true);
