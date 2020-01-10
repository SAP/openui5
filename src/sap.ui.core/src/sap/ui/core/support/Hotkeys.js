/*!
 * ${copyright}
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */
sap.ui.define(["sap/base/Log"], function(Log) {
	"use strict";

	/**
	 * Provides hotkey functionality for the TechnicalInfo and Support Dialog.
	 *
	 * @namespace
	 * @since 1.58
	 * @alias module:sap/ui/core/support/Hotkeys
	 * @private
	 * @ui5-restricted sap.ui.core
	 */
	var oHotkeys = {

		/**
		 * Initializes hotkeys for TechnicalInfo and Support Dialog.
		 *
		 * @private
		 * @static
		 * @param {Object} getModuleSystemInfo Function, which should retrieve modules and prefixes.
		 * @param {Object} oCfgData Configuration object of the project.
		 */
		init: function(getModuleSystemInfo, oCfgData) {
			// Check whether the left 'alt' key is used
			// The TechnicalInfo should be shown only when left 'alt' key is used
			// because the right 'alt' key is mapped to 'alt' + 'ctrl' on windows
			// in some languages for example German or Polish which makes right
			// 'alt' + 'shift' + S open the TechnicalInfo
			var bLeftAlt = false;

			document.addEventListener('keydown', function(e) {
				try {
					if (e.keyCode === 18) { // 'alt' Key
						bLeftAlt = (typeof e.location !== "number" /* location isn't supported */ || e.location === 1 /* left */);
						return;
					}

					if ( e.shiftKey && e.altKey && e.ctrlKey && bLeftAlt ) {
						// invariant: when e.altKey is true, there must have been a preceding keydown with keyCode === 18, so bLeftAlt is always up-to-date
						if ( e.keyCode === 80 ) { // 'P'
							sap.ui.require(['sap/ui/core/support/techinfo/TechnicalInfo'], function(TechnicalInfo) {
								TechnicalInfo.open(function() {
									var oInfo = getModuleSystemInfo();
									return { modules : oInfo.modules, prefixes : oInfo.prefixes, config: oCfgData };
								});
							}, function (oError) {
								Log.error("Could not load module 'sap/ui/core/support/techinfo/TechnicalInfo':", oError);
							});
						} else if ( e.keyCode === 83 ) { // 'S'
							sap.ui.require(['sap/ui/core/support/Support'], function(Support) {
								var oSupport = Support.getStub();
								if (oSupport.getType() != Support.StubType.APPLICATION) {
									return;
								}
								oSupport.openSupportTool();
							}, function (oError) {
								Log.error("Could not load module 'sap/ui/core/support/Support':", oError);
							});
						}
					}
				} catch (err) {
					// ignore any errors
				}
			});
		}
	};

	return oHotkeys;
});
