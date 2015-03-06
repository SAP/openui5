/*!
 * ${copyright}
 */

// Provides class sap.ui.dt.DesignTime.
sap.ui.define([
	'jquery.sap.global',
	'sap/ui/base/ManagedObject',
	'sap/ui/dt/EventBus',
	'sap/ui/dt/Scope',
	'sap/ui/dt/Widgets',
	'sap/ui/dt/LibraryManager',
	'sap/ui/dt/DragManager',
	'sap/ui/dt/ShortKeys',
	'sap/ui/dt/GestureRecognizer'
],
function(jQuery, ManagedObject, EventBus, Scope, Widgets, LibraryManager, DragManager, ShortKeys, GestureRecognizer) {
	"use strict";


	/**
	 * Constructor for a new DesignTime.
	 *
	 * @param {string} [sId] id for the new object, generated automatically if no id is given 
	 * @param {object} [mSettings] initial settings for the new object
	 *
	 * @class
	 * The UI5 DesignTime allows an user to change a UI5 UI via drag and drop.
	 * This is done by creating overlays for each control, which intercept the browser events
	 * and delegates changes to the real control (e.g. movement from one container into another).
	 * @extends sap.ui.base.ManagedObject
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.30
	 * @alias sap.ui.dt.DesignTime
	 * @experimental Since 1.30. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */
	var DesignTime = ManagedObject.extend("sap.ui.dt.DesignTime", /** @lends sap.ui.dt.DesignTime.prototype */ {
		metadata : {

			// ---- object ----

			// ---- control specific ----
			library : "sap.ui.dt",
			properties : {
				"keybinding" : {
					type : "boolean",
					group : "misc",
					defaultValue : false
				}
			},
			associations : {
				"rootControl" : {
					"type" : "sap.ui.core.Control"
				}
			},
			events : {
				"controlCreated" : {},
				"controlSelected" : {},
				"controlChanged" : {},
				"controlDragStarted" : {},
				"controlDragEnded" : {},
				"controlRemoved" : {},
				"controlDeselected" : {},
				"controlDestroyed" : {},
				"controlResized" : {},
				"canvasLoading" : {},
				"canvasLoaded" : {},
				"viewHasChanged" : {},
				"focus" : {},
				"designTimeReady" : {},
				"DOMChanged" : {}
			}
		}
	});

	DesignTime.M_EVENTS = {
		'controlCreated' : 'controlCreated',
		'controlSelected' : 'controlSelected',
		'controlDeselected' : 'controlDeselected',
		'controlDestroyed' : 'controlDestroyed',
		'controlResized' : 'controlResized',
		'controlDragStarted' : 'controlDragStarted',
		'controlDragEnded' : 'controlDragEnded',
		'controlRemoved' : 'controlRemoved',
		'canvasLoading' : 'canvasLoading',
		'canvasLoaded' : 'canvasLoaded',
		'viewHasChanged' : 'viewHasChanged',
		'designTimeReady' : 'designTimeReady',
		'DOMChanged' : 'DOMChanged'
	};


	/*
	 * @private
	 */
	DesignTime.prototype.init = function() {

		this._loadedThemes = [];
		this.oScope = null;
		this._oRootControl = null;

		// TODO All members should be private
		this.oEventBus = new EventBus();
		this.oScope = new Scope(this);
		this.oWidgets = new Widgets(this);
		this.oLibraryManager = new LibraryManager(this);
		this.oShortKeys = new ShortKeys(this);
		this._oGestureRecognizer = new GestureRecognizer(this);
		this._oGestureRecognizer.init();

		this.oEventBus.subscribe("control.created", function(channel, path, data) {
			this.fireControlCreated(data);
		}, this).subscribe("control.selected", function(channel, path, data) {
			this.fireControlSelected(data);
		}, this).subscribe("control.deselected", function(channel, path, data) {
			this.fireControlDeselected(data);
		}, this).subscribe("control.resized", function(channel, path, data) {
			this.fireControlResized(data);
			this.fireViewHasChanged(data);
		}, this).subscribe("drag.started", function(channel, path, data) {
			this.fireControlDragStarted(data);
		}, this).subscribe("drag.ended", function(channel, path, data) {
			this.fireControlDragEnded(data);
		}, this).subscribe("control.remove", function(channel, path, data) {
			this.fireControlRemoved(data);
		}, this).subscribe("control.destroyed", function(channel, path, data) {
			this.fireControlDestroyed(data);
			this.fireViewHasChanged(data);
		}, this).subscribe("control.changed", function(channel, path, data) {
			this.fireControlChanged(data);
			this.fireViewHasChanged(data);
		}, this).subscribe("drag.ended", function(channel, path, data) {
			// TODO Overlay handling should be centralized
			this.oScope.showOverlayContainer();
			this.fireFocus();
			this.fireViewHasChanged(data);
		}, this).subscribe("canvas.ready", function(channel, path, data) {
			//TODO : rethink this.fireCanvasReady();
		}, this).subscribe("dom.changed", function(channel, path, data) {
			this.fireDOMChanged();
		}, this);
	};

	DesignTime.prototype.getGestureRecognizer = function() {
		return this._oGestureRecognizer;
	};

	DesignTime.prototype.setRootControl = function(oRootControl) {
		this._bCanvasIsLoaded = false;
		
		// TODO This is a workaround to destroy the loosely coupled objects (later, when we removed the event bus, all objects will be destroyed)
		this.oEventBus.publish("destroy", {fromSetRootControl : true});

		this._removeOnAfterRenderingDelegate();

		this._oRootControl = oRootControl;

		this._destroyMutationObserver();
		this._oDelegate = {
				onAfterRendering: this._onAfterRendering
		};
		if (this._oRootControl.getDomRef()) {
			this._onAfterRendering();
		} else {
			oRootControl.addEventDelegate(this._oDelegate, this);	
		}
	};

	DesignTime.prototype.getRootControl = function() {
		return this._oRootControl;
	};


	/*
	 * @private
	 */
	DesignTime.prototype._removeOnAfterRenderingDelegate = function() {
		if (this._oRootControl) {
			this._oRootControl.removeDelegate(this._oDelegate, this);
		}
	};

	/*
	 * @private
	 */
	DesignTime.prototype._onAfterRendering = function() {
		var that = this;
		var oRootControl = this._oRootControl;
		this.getScope().setElement(oRootControl.getDomRef(), function() {			
			// TODO Scope / Library Manager / Mutation Observer Object should be destroyed and a new one should be created ?
			var oWindow = that.getScope().getWindow();
			that.oLibraryManager.initialize();
			if (that._oCurrentWindow !== oWindow) {
				that._oCurrentWindow = oWindow;
				that._oMutationObserver = that._createMutationObserver();
				that._loadedThemes.push(that.getScope().getCore().getConfiguration().getTheme());
				that.getScope().getCore().attachThemeChanged(that._onThemeChanged, that);
			}
			// TODO initialization fires canvas ready -> this should be changed (loaded = ready?)
			// TODO perhaps we can rename this to "rootControlChanged" / "ready" / "overlaysCreated"
			that._bCanvasIsLoaded = true;

			//TODO:
			that.fireDesignTimeReady({
				oControl : that
			});
			that._removeOnAfterRenderingDelegate();
		});
	};

	DesignTime.prototype.ensureLoadedThen = function(fn) {
		if (this._bCanvasIsLoaded) {
			fn();
		} else {
			this.attachEvent("designTimeReady", fn);
		}
	};

	/*
	 * @private
	 */
	DesignTime.prototype.exit = function() {
		delete this._bCanvasIsLoaded;
		
		// TODO This is a workaround to destroy the loosely coupled objects (later, when we removed the event bus, all objects will be destroyed)
		this.oEventBus.publish("destroy");
		
		this._destroyMutationObserver();
		
		delete this._oCurrentWindow;
		this.oScope.destroy();
		delete this.oScope;
		this.oEventBus.destroy();
		delete this.oEventBus;
		
		clearTimeout(this._iThemeTimeout);

		this.oLibraryManager.destroy();
		delete this.oLibraryManager;
		
		this._oGestureRecognizer.destroy();
		delete this._oGestureRecognizer;
		
		this._removeOnAfterRenderingDelegate();
		
		delete this._oRootControl;
	};

	DesignTime.prototype.getGestureRecognizer = function() {
		return this._oGestureRecognizer;
	};

	/*
	 * @private
	 */
	DesignTime.prototype._destroyMutationObserver = function() {
		if (this._oMutationObserver) {
			this._oMutationObserver.disconnect();
			clearTimeout(this._iMutationTimeout);
			this._oMutationObserver = undefined;
		}
	};

	DesignTime.prototype.removeControl = function(oControl) {
		this.oEventBus.publish("control.remove", {
			oControl : oControl
		});
		return this;
	};

	DesignTime.prototype.selectControl = function(oControl) {
		// Show first and then select
		this.oEventBus.publish("control.show", {
			oControl : oControl
		});
		this.oEventBus.publish("control.select", {
			oControl : oControl
		});
		return this;
	};

	DesignTime.prototype.deselectControl = function(oControl) {
		this.oEventBus.publish("control.deselect", {
			oControl : oControl
		});
		return this;
	};

	DesignTime.prototype.highlightControl = function(oControl) {
		this.oEventBus.publish("control.highlight", {
			oControl : oControl
		});
		return this;
	};

	DesignTime.prototype.downplayControl = function(oControl) {
		this.oEventBus.publish("control.downplay", {
			oControl : oControl
		});
		return this;
	};

	DesignTime.prototype.changeControl = function(sAction) {
		this.oEventBus.publish("control.changeSelection", {
			action: sAction
		});
		return this;
	};

	/**
	 * Move a control in a direction
	 * @param  {object} oControl The control to move
	 * @param  {string} sDirection The direction to move in
	 * @return {this}
	 */
	DesignTime.prototype.moveControl = function(oControl, sDirection) {
		this.oEventBus.publish("control.movePosition", {
			oControl: oControl,
			sDirection: sDirection
		});
		return this;
	};

	DesignTime.prototype.showControl = function(oControl) {
		this.oEventBus.publish("control.show", {
			oControl : oControl
		});
		return this;
	};

	DesignTime.prototype.getScope = function() {
		return this.oScope;
	};

	DesignTime.prototype.getLoadedControlTypes = function() {
		return this.oLibraryManager.aLoadedControls;
	};


	DesignTime.prototype.makeDraggable = function(sControlName, oControl) {
		jQuery.sap.require("sap.ui.dt.PartsDragManager");
		var aLoadedControls = this.getLoadedControlTypes();
		var oControlObject = null;
		for (var i = 0; i < aLoadedControls.length; i++) {
			if (aLoadedControls[i].name === sControlName) {
				oControlObject = this.getScope().getObject(sControlName);
				break;
			}
		}
		if (!oControlObject) {
			jQuery.sap.log.error("No DT control can be found for " + sControlName);
			return;
		}
		var oPD = new sap.ui.dt.PartsDragManager(oControlObject, this);
		return oPD.set(oControl.$());
	};


	/*
	 * @private
	 */
	DesignTime.prototype._createMutationObserver = function() {
		var that = this;
		var toTriggerEvent = false;
		var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
		var oMutationObserver = new MutationObserver(function(aMutations) {
			// TODO: This logic needs serious rework

			var bReturn = false;
			for (var i = 0; i < aMutations.length; i++) {
				var oMutation = aMutations[i];
				// ignore body and overlays mutations
				if (oMutation.target === that.getScope().getBodyElement() || jQuery(oMutation.target).closest("#overlay-container").length) {
					bReturn = true;
				} else {
					bReturn = false;
					break;
				}
			}

			if (bReturn) {
				return;
			}

			toTriggerEvent = true;
			if (that._iMutationTimeout) {
				clearTimeout(that._iMutationTimeout);
			}
			that._iMutationTimeout = setTimeout(function() {
				if (toTriggerEvent) { 	// TODO  && that.isActive()
					that.oEventBus.publish("dom.changed");
					toTriggerEvent = false;
				}
			}, 50);
		});
		oMutationObserver.observe(this.oScope.getBodyElement(), {
			childList : true,
			subtree : true,
			attributes : true
		});
		return oMutationObserver;
	};

	/*
	 * @private
	 */
	DesignTime.prototype._onThemeChanged = function(oEvent) {
		var sThemeName = oEvent.getParameter("theme");
		// TODO Why not only fire "dom.changed" when the theme has changed? Why is this complex logic needed?
		var that = this;
		if (this._loadedThemes.indexOf(sThemeName) === -1) {
			this._loadedThemes.push(sThemeName);
			clearTimeout(this._iThemeTimeout);
			// _onThemeChanged is not firing at the right time....
			this._iThemeTimeout = setTimeout(function() {
				// TODO: Refactor and move all event buses to the init
				that.oEventBus.publish("dom.changed");
			}, 500);
		} else {
			// TODO: Refactor and move all event buses to the init
			that.oEventBus.publish("dom.changed");
		}

	};

	return DesignTime;
}, /* bExport= */ true);