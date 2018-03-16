/*!
 * ${copyright}
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */
sap.ui.define([], function() {

	"use strict";

	//evo-todo: require module system info here instead
	return function(getModuleSystemInfo, oCfgData) {
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
						});
					} else if ( e.keyCode === 83 ) { // 'S'
						sap.ui.require(['sap/ui/core/support/Support'], function(Support) {
							var oSupport = Support.getStub();
							if (oSupport.getType() != Support.StubType.APPLICATION) {
								return;
							}
							oSupport.openSupportTool();
						});
					}
				}
			} catch (err) {
				// ignore any errors
			}
		});
	};

});
