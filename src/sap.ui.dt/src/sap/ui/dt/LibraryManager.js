/*!
 * ${copyright}
 */
 

// Provides class sap.ui.dt.LibraryManager.
sap.ui.define([
	'jquery.sap.global',
	'sap/ui/base/Object',
	'sap/ui/dt/Widget',
	'sap/ui/dt/Utils'
],

function(jQuery, BaseObject, Widget, Utils) {
	"use strict";

	/**
	 * Constructor for a new LibraryManager.
	 *
	 * @param {sap.ui.dt.DesignTime} oDesignTime The design time object
	 *
	 * @class
	 * The Library Manager 
	 * <ul>
	 * <li>triggers the registration of supported controls by requiring the adapter.js. 
	 * All controls which are in the currently loaded ui5 libraries, but are not registered will 
	 * be decorated with design time options that mark them as unsupported.</li>
	 * <li>for each control in the UI Area a Widget is created and ensured that 
	 * also it's future children will have a widget representation</li>
	 * </ul>
	 * 
	 * @extends sap.ui.base.BaseObject
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.30
	 * @alias sap.ui.dt.LibraryManager
	 * @experimental Since 1.30. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */

	var LibraryManager = BaseObject.extend("sap.ui.dt.LibraryManager", /** @lends sap.ui.dt.LibraryManager.prototype */ {

		constructor : function(oDesignTime) {
			this.oScope = oDesignTime.getScope();
			this.eventBus = oDesignTime.oEventBus;
			this.oDesignTime = oDesignTime;
			this.aLoadedControls = [];
			this._mPatchedOnBeforeRenderingControls = {};
		}

	});

	LibraryManager.prototype.initialize = function() {
		this.rollbackPatching();
		this._mPatchedOnBeforeRenderingControls = {};
		
		var mResult = this._decorateControlDefinitions();
		
		var oRootControl = this.oDesignTime.getRootControl();
		if (oRootControl) {
			this.setRootControl(oRootControl);
		}
		
		return mResult;
	};
	
	LibraryManager.prototype.setRootControl = function(oRootControl) {
		var aAccessableControls = this.findAllAccessableControls(oRootControl);
		this.redecorateControls(aAccessableControls);
		this.oScope.revealIframe();
	};
	
	LibraryManager.prototype.rollbackPatching = function() {
		for (var sControl in this._mPatchedOnBeforeRenderingControls) {
			var mEntry = this._mPatchedOnBeforeRenderingControls[sControl];
			mEntry.control.prototype.onBeforeRendering = mEntry.origFunc;
		}
	};
	
	LibraryManager.prototype.destroy = function() {
		delete this.oScope;
		delete this.eventBus;
		delete this.oDesignTime;
		delete this.aLoadedControls;
		
		this.rollbackPatching();
		delete this._mPatchedOnBeforeRenderingControls;
	};

	/*
	 * @private
	 */
	LibraryManager.prototype._decorateControlDefinitions = function() {

		var that = this;
		
		// TODO This should be done in the W5G Control
		this.oScope.coverUpIframe();

		var aLibrary;
		this.aLoadedControls = [];
		//var aAllLoadedLibraries = this.oScope.getLoadedLibraries();
		var aLibrary = this.oScope.getWindow().sap.ui.dt.adapter.getLoadedControls();
//		for ( var sLibrary in aAllLoadedLibraries) {
//			aLibrary = aAllLoadedLibraries["sap.m"].controls;
//			aLibrary = aLibrary.concat( aAllLoadedLibraries["sap.m"].elements);
			for (var i = 0; i < aLibrary.length; i++) {
				var controlDef = that.oScope.getWindow().jQuery.sap.getObject(aLibrary[i]);
				try {
					var designTimeOptions = controlDef.getMetadata().__designTimeOptions;
					// skip all controls which are not inheriting from sap.ui.core.Control
					if (!designTimeOptions
							&& Utils.isTypeOf(controlDef.getMetadata().getParent(), [ "sap.ui.core.Element" ])) {
						that.oScope.getWindow().sap.ui.dt.adapter.registerUnsupported(aLibrary[i]);
						designTimeOptions = controlDef.getMetadata().__designTimeOptions;
					}
					
				} catch (e) {
					jQuery.sap.log.warning("[LibraryManger.js] Failed to register control " + aLibrary[i] + " : ", e.message);
					continue;
				}
				
				if (designTimeOptions) {
					if (designTimeOptions.display) {
						var sClassName = aLibrary[i];
						that.aLoadedControls.push({
							name : sClassName,
							title : designTimeOptions.name
									|| sClassName.substring(sClassName.lastIndexOf(".") + 1).replace(/([a-z])([A-Z])/g, '$1 $2'),
							icon : designTimeOptions.icon,
							description : designTimeOptions.description,
							keywords : designTimeOptions.keywords,
							categories : designTimeOptions.categories
						});
					}
					that._mergeSingleControl(controlDef);
				}
			}
//		}
		return {
			success : true,
			"aControls" : that.aLoadedControls
		};
	};


	/**
	 * Gets all controls in the canvas area and redecorate them for design time
	 */
	LibraryManager.prototype.redecorateControls = function(aAllControls) {
		var that = this;
		aAllControls.forEach(function(oSingleControl) {
			that.createWYSIWYGControl(oSingleControl);
		});
	};

	//TODO : Move them to sap.ui.dt.LibraryManager
	LibraryManager.prototype.findAllAccessableControls = function(oControl) {
		var aAllControls = [];
		if (oControl.length && oControl.length > 0) {
			oControl.forEach(function(oSingleControl) {
				aAllControls = aAllControls.concat(this._findAllAccessableControls(oSingleControl));
			}, this);
		} else {
			aAllControls = aAllControls.concat(this._findAllAccessableControls(oControl));
		}
		return aAllControls;
	};

	//TODO move patching overall to a better place
	/*
	 * @private
	 */
	LibraryManager.prototype._patchOnBeforeRendering = function(oControl) {
		var that = this;
		var fnOrigFunc = oControl.prototype.onBeforeRendering;
		return function() {
			that.onBeforeRenderingControl(this);
			if (fnOrigFunc) {
				fnOrigFunc.apply(this, arguments);
			}
			this.__patchedOnBeforeRendering = false;
		};
	};

	/*
	 * @protected
	 * @override
	 */
	LibraryManager.prototype.onBeforeRenderingControl = function(oControl) {
		if (!oControl.__patchedOnBeforeRendering) {
			if (!oControl.__patchedOnBeforeRendering) {
				oControl.__patchedOnBeforeRendering = true;
				if (oControl.__widget) {
					var aChildren = Utils.findAllPublicElements(oControl, this.oScope.getWindow().sap.ui.core);
					for (var i = aChildren.length - 1; i >= 0; i--) {
						if (!aChildren[i].__widget) {
							this.createWYSIWYGControl(aChildren[i]);
						}
					}
					
					return;
				}
				if (Utils.isControlPublic(oControl, this.oScope.getWindow().sap.ui.core)) {
					this.createWYSIWYGControl(oControl);
				}
			}
			oControl.__patchedOnBeforeRendering = false;
		}
	};

	LibraryManager.prototype.createWYSIWYGControl = function(oControl) {
		return new sap.ui.dt.Widget(oControl, this.oDesignTime);
	};

	/*
	 * @private
	 */
	LibraryManager.prototype._findAllAccessableControls = function(oControl) {
		return Utils.findAllPublicElements(oControl, this.oScope.getWindow().sap.ui.core);
	};

	/*
	 * @private
	 */
	LibraryManager.prototype._mergeSingleControl = function(oControl) {
		var that = this;
		var eventBus = this.eventBus;
		var sName = oControl.getMetadata().getName();
		if (this._mPatchedOnBeforeRenderingControls[sName]) {
			return;
		}

		var fnOrigFunc = oControl.prototype.onBeforeRendering;
		
		this._mPatchedOnBeforeRenderingControls[sName] = {
			control : oControl,
			origFunc : fnOrigFunc
		};


		// We need to manually load them!
		oControl.getMetadata().getJSONKeys();
		__loadDesignTimeCSS(oControl);
		oControl.prototype.onBeforeRendering = this._patchOnBeforeRendering(oControl);
		
		//TODO why is this done here and not in the widget?
		function __loadDesignTimeCSS(oControl) {
			var sCSSFileName = oControl.getMetadata().__designTimeOptions.css;
			if (sCSSFileName && sCSSFileName.match(/.css$/)) {
				var oWindow = that.oScope.getWindow();
				var sHref = oWindow.sap.ui.resource("sap.ui.dt.style", sCSSFileName);
				jQuery.sap.log.info("Loading CSS from: " + sHref);
				
			    var head = oWindow.document.getElementsByTagName('head')[0];
			    var link = oWindow.document.createElement('link');
					 
				link.type = "text/css";
				link.rel = "stylesheet";
				link.href = sHref;
				link.onload = function() {
					eventBus.publish("dom.changed");
				};
				 
				head.appendChild(link);
			}
		}
	};

	return LibraryManager;
}, /* bExport= */ true);
