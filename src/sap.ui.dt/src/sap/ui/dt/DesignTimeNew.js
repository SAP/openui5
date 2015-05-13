/*!
 * ${copyright}
 */

// Provides class sap.ui.dt.DesignTimeNew.
sap.ui.define([
	'sap/ui/base/ManagedObject',
	'sap/ui/dt/Overlay',
	'sap/ui/dt/OverlayRegistry',
	'sap/ui/dt/Selection',
	'sap/ui/dt/ElementUtil',
	'./library'
],
function(ManagedObject, Overlay, OverlayRegistry, Selection, ElementUtil) {
	"use strict";

	/**
	 * Constructor for a new DesignTimeNew.
	 *
	 * @param {string} [sId] id for the new object, generated automatically if no id is given 
	 * @param {object} [mSettings] initial settings for the new object
	 *
	 * @class
	 * The DesignTimeNew allows to create a set of Overlays above the root elements and
	 * theire public children and manage their events.
	 * @extends sap.ui.core.ManagedObject
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.30
	 * @alias sap.ui.dt.DesignTimeNew
	 * @experimental Since 1.30. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */
	var DesignTimeNew = ManagedObject.extend("sap.ui.dt.DesignTimeNew", /** @lends sap.ui.dt.DesignTimeNew.prototype */ {
		metadata : {
			// ---- object ----

			// ---- control specific ----
			library : "sap.ui.dt",
			properties : {	
				"selectionMode" : {
					type : "sap.ui.dt.SelectionMode",
					defaultValue : sap.ui.dt.SelectionMode.Single
				}
			},
			associations : {
				rootElements : {
					type : "sap.ui.core.Element",
					multiple : true
				}
			},
			aggregations : {
				plugins : {
					type : "sap.ui.dt.Plugin",
					multiple : true
				}
			},
			events : {
				"overlayCreated" : {
					overlay : "sap.ui.dt.Overlay"
				},
				"selectionChange" : {
					type : "sap.ui.dt.Overlay[]"
				}
			}
		}
	});

	/*
	 * Initialization of DesignTime
	 * @private
	 */
	DesignTimeNew.prototype.init = function() {
		this._oSelection = this.createSelection();
		this._oSelection.attachEvent("change", this.fireSelectionChange, this);
	};

	/*
	 * @private
	 */
	DesignTimeNew.prototype.exit = function() {
		this._destroyAllOverlays();
		this._oSelection.destroy();
	};

	/*
	 * @protected
	 */
	DesignTimeNew.prototype.createSelection = function() {
		return new Selection();
	};

	/*
	 * @private
	 */
	DesignTimeNew.prototype._createAllOverlays = function() {
		var that = this;

		this._iterateRootElements(function(oRootElement) {
			that._createOverlaysForRootElement(oRootElement);
		});
	};

	/** 
	 * @protected
	 */
	DesignTimeNew.prototype.setSelectionMode = function(sMode) {
		this._oSelection.setMode(sMode);

		return this;
	};	

	/** 
	 * @protected
	 */
	DesignTimeNew.prototype.getPlugins = function() {
		return this.getAggregation("plugins") || [];
	};

	/** 
	 * @protected
	 */
	DesignTimeNew.prototype.addPlugin = function(oPlugin) {
		oPlugin.setDesignTime(this);

		this.addAggregation("plugins", oPlugin);

		return this;		
	};

	/** 
	 * @protected
	 */
	DesignTimeNew.prototype.removePlugin = function(oPlugin) {
		this.getPlugins().forEach(function(oCurrentPlugin) {
			if (oCurrentPlugin === oPlugin) {
				oPlugin.setDesignTime(null);
				return;
			}
		});

		this.removeAggregation("plugins", oPlugin);

		return this;		
	};

	/** 
	 * @protected
	 */
	DesignTimeNew.prototype.removeAllPlugins = function() {
		this.getPlugins().forEach(function(oPlugin) {
			oPlugin.setDesignTime(null);
		});

		this.removeAllAggregation("plugins");

		return this;
	};

	/** 
	 * @protected
	 */
	DesignTimeNew.prototype.insertPlugin = function(oPlugin, iIndex) {
		oPlugin.setDesignTime(this);

		this.insertAggregation("plugins", oPlugin, iIndex);

		return this;
	};

	/*
	 * @public
	 */
	DesignTimeNew.prototype.getOverlays = function() {
		var aOverlays = [];

		this._iterateAllElements(function(oElement) {
			var oOverlay = OverlayRegistry.getOverlay(oElement);
			if (oOverlay) {
				aOverlays.push(oOverlay);
			}
		});

		return aOverlays;
	};

	/*
	 * @public
	 * @param {String|sap.ui.core.Element} element or elemet's id
	 */
	DesignTimeNew.prototype.addRootElement = function(vRootElement) {
		this.addAssociation("rootElements", vRootElement);

		this._createOverlaysForRootElement(ElementUtil.getElementInstance(vRootElement));
	};

	/*
	 * @public
	 * @param {String|sap.ui.core.Element} element or elemet's id
	 */
	DesignTimeNew.prototype.removeRootElement = function(vRootElement) {
		this.removeAssociation("rootElements", vRootElement);

		this._destroyOverlaysForRootElement(ElementUtil.getElementInstance(vRootElement));
	}; 	

	/*
	 * @public
	 * @param {String|sap.ui.core.Element} element or elemet's id
	 */
	DesignTimeNew.prototype.removeAllRootElement = function(vRootElement) {
		this.removeAssociation("rootElements", vRootElement);

		this._destroyAllOverlays();
	}; 	

	/*
	 * @public
	 */
	DesignTimeNew.prototype._destroyAllOverlays = function() {
		var that = this;

		this._iterateRootElements(function(oRootElement) {
			that._destroyOverlaysForRootElement(oRootElement);			
		});
	};

	/*
	 * @private
	 * @param {String|sap.ui.core.Element} element
	 */
	DesignTimeNew.prototype._createOverlaysForRootElement = function(oRootElement) {
		var that = this;

		this._iterateRootElementPublicChildren(oRootElement, function(oElement) {
			that._createOverlay(oElement);
		}); 
	};

	/*
	 * @private
	 * @param {String|sap.ui.core.Element} element
	 */
	DesignTimeNew.prototype._destroyOverlaysForRootElement = function(oRootElement) {
		this._iterateRootElementPublicChildren(oRootElement, function(oElement) {
			var oOverlay = OverlayRegistry.getOverlay(oElement);
			if (oOverlay) {
				oOverlay.destroy();
			}			
		});
	};	

	/*
	 * @private
	 * @param {String|sap.ui.core.Element} element
	 */
	DesignTimeNew.prototype._createOverlay = function(oElement) {
		// Filter
		//if (this.fireBeforeCreateOverlay())

		var oOverlay = this.createOverlay(oElement);
		oOverlay.attachEvent("elementModified", this._onElementModified, this);
		oOverlay.attachEvent("destroyed", this._onOverlayDestroyed, this);
		oOverlay.attachEvent("selectionChange", this._onOverlaySelectionChange, this);

		this.fireOverlayCreated({overlay : oOverlay});
	};

	/** 
	 * @private
	 * @param {sap.ui.baseEvent} event object
	*/
	DesignTimeNew.prototype._onOverlayDestroyed = function(oEvent) {
		var oOverlay = oEvent.getSource();

		this._oSelection.remove(oOverlay);
	};

	/*
	 * @private
	 * @param {sap.ui.baseEvent} event object
	 */
	DesignTimeNew.prototype._onOverlaySelectionChange = function(oEvent) {
		var oOverlay = oEvent.getSource();
		var bSelected = oEvent.getParameter("selected");

		this._oSelection.set(oOverlay, bSelected);
	};	

	/**
	 * @protected
	 * @param {String|sap.ui.core.Element} oElement to create overlay for
	 * @return {sap.ui.dt.Overlay} created overlay
	 */
	DesignTimeNew.prototype.createOverlay = function(oElement) {
		return new Overlay({
			element : oElement
		});
	};

	/**
	 * @public
	 * @return {sap.ui.dt.Overlay[]} selected overlays
	 */
	DesignTimeNew.prototype.getSelection = function() {
		return this._oSelection.getSelection();
	};

	/*
	 * @private
	 * @param {sap.ui.baseEvent} event object
	 */
	DesignTimeNew.prototype._onElementModified = function(oEvent) {
		var oParams = oEvent.getParameters();
		if (oParams.type === "addAggregation" || oParams.type === "insertAggregation") {
			this._onOverlayElementAddAggregation(oParams.value);
		} else if (oParams.type === "setParent") {
			this._onOverlayElementSetParent(oParams.target, oParams.value);
		}
	};

	/*
	 * @private
	 * @param {sap.ui.core.Element} 
	 */
	DesignTimeNew.prototype._onOverlayElementAddAggregation = function(oElement) {
		var oOverlay = OverlayRegistry.getOverlay(oElement);
		if (!oOverlay) {
			this._createOverlay(oElement);
		}
	};

	/*
	 * @private
	 * @param {sap.ui.core.Element}
	 * @param {sap.ui.core.Element}
	 */
	DesignTimeNew.prototype._onOverlayElementSetParent = function(oElement, oParent) {
		var oOverlay = OverlayRegistry.getOverlay(oElement);
		if (oOverlay && !this._isElementInRootElements(oElement)) {
			oOverlay.destroy();
		}
	};	

	/*
	 * @private
	 * @param {sap.ui.core.Element}
	 */
	DesignTimeNew.prototype._isElementInRootElements = function(oElement) {
		var bFoundAncestor = false;

		this._iterateRootElements(function(oRootElement) {
			if (ElementUtil.hasAncestor(oElement, oRootElement)) {
				bFoundAncestor = true;
				return false;
			}
		});

		return bFoundAncestor;
	};

	DesignTimeNew.prototype.getRootElements = function() {
		return this.getAssociation("rootElements") || [];
	};	

	/*
	 * @private
	 */
	DesignTimeNew.prototype._iterateRootElements = function(fnStep) {
		var aRootElements = this.getRootElements();
		aRootElements.forEach(function(sRootElementId) {
			var oRootElement = ElementUtil.getElementInstance(sRootElementId);
			fnStep(oRootElement);
		});
	};

	/*
	 * @private
	 */
	DesignTimeNew.prototype._iterateRootElementPublicChildren = function(oRootElement, fnStep) {
		var aAllPublicElements = ElementUtil.findAllPublicElements(oRootElement);
		aAllPublicElements.forEach(function(oElement) {
			fnStep(oElement);
		});
	};

	/*
	 * @private
	 */
	DesignTimeNew.prototype._iterateAllElements = function(fnStep) {
		var that = this;

		this._iterateRootElements(function(oRootElement) {
			that._iterateRootElementPublicChildren(oRootElement, fnStep);
		});
	};	

	return DesignTimeNew;
}, /* bExport= */ true);