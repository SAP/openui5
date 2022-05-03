sap.ui.define(["poc/lib/UltraCore"], function() {


	sap.ui["define"]("sap/ui/core/LocaleData", [], function() { return undefined; });

	sap.ui.lazyRequire = function() {};

	var Core = {
		_aUIAreas: [],
		addInvalidatedUIArea: function() {
			setTimeout(function() {
				this._aUIAreas.forEach(function(oUIArea) {
					oUIArea.rerender();
				});
			}.bind(this));
		},
		oFocusHandler: {
			getControlFocusInfo: function() {
				return {};
			}
		},
		_handleControlEvent: function(oEvent) {
			if (oEvent["on" + oEvent.type]) {
				oEvent["on" + oEvent.type](oEvent);
			}
		},
		isLocked: function() {
			return false;
		},
		isInitialized: function() {
			return !!document.body;
		},
		getConfiguration: function() {
			return {
				getUIDPrefix: function() {
					return "__";
				},
				getRTL: function() {
					return false;
				},
				getAnimationMode: function() {
					return false;
				},
				getTheme: function() {
					return "sap_fiori_3";
				},
				getLanguage: function() {
					return "en";
				},
				getCalendarType: function() {
					return undefined;
				},
				getLocale: function() {
					return {
						hasPrivateUseSubtag: function() {return false;},
						getLanguage: function() {return false;},
						getScript: function() {return false;},
						getRegion: function() {return false;}
					};
				},
				getViewCache: function() {
					return undefined;
				},
				getDisableCustomizing: function() {
					return false;
				},
				getControllerCodeDeactivated: function() {
					return false;
				},
				getDesignMode: function() {
					return false;
				},
				getActiveTerminologies: function() {
					return [];
				},
				getComponentPreload: function() {
					return false;
				},
				getSAPParam: function() {
					return undefined;
				},
				getLanguageTag: function() {
					return undefined;
				},
				getDepCache: function() {
					return undefined;
				}
			}
		},
		attachInit: function(fn) {
			if (!document.body) {
				document.addEventListener("DOMContentLoaded", fn);
			} else {
				setTimeout(fn);
			}
		},
		aLoadedLibraries: [],
		initLibrary: function(mLibrary) {
			let obj = window;
			mLibrary.name.split(".").forEach(package => {
				obj[package] = obj[package] || {};
				obj = obj[package];
			});
			this.aLoadedLibraries.push(mLibrary);
		},
		getLoadedLibraries: function() {
			return this.aLoadedLibraries;
		},
		attachThemeChanged: function() {
			// noop
		},
		getLibraryResourceBundle: function() {
			return {getText: function(t) {return t;}}
		}
	};

	sap.ui.require([
		"sap/ui/core/Element", "sap/ui/core/UIArea", "sap/ui/core/RenderManager"
	], function(Element, UIArea, RenderManager) {
		Core.oRenderManager = new RenderManager();
		Core.createUIArea = function(ref) {
			var oUIArea = new UIArea(this, ref);
			this._aUIAreas.push(oUIArea);
			return oUIArea;
		};
		Core.byId = Element.registry.get;
	});

	if (typeof window.sap.ui.getCore !== "function") {
		sap.ui.getCore = function() {
			return Core;
		};
	}

	if (typeof window.sap.ui.getCore !== "function") {
		sap.ui.getCore = function() {
			return Core;
		};
	}

	sap.ui["define"]("sap/ui/core/Core", [], function() { return Core; });

	return Core;

});
