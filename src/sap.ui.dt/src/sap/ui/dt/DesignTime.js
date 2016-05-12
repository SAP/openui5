/*!
 * ${copyright}
 */

// Provides class sap.ui.dt.DesignTime.
sap.ui.define([
	'sap/ui/base/ManagedObject',
	'sap/ui/dt/ElementOverlay',
	'sap/ui/dt/OverlayRegistry',
	'sap/ui/dt/Selection',
	'sap/ui/dt/ElementDesignTimeMetadata',
	'sap/ui/dt/ElementUtil',
	'sap/ui/dt/OverlayUtil',
	'./library'
],
function(ManagedObject, ElementOverlay, OverlayRegistry, Selection, ElementDesignTimeMetadata, ElementUtil, OverlayUtil) {
	"use strict";

	/**
	 * Constructor for a new DesignTime.
	 *
	 * @param {string} [sId] id for the new object, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new object
	 *
	 * @class
	 * The DesignTime allows to create a set of Overlays above the root elements and
	 * their public children and manage theire events.
	 * @extends sap.ui.core.ManagedObject
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
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
				/**
				 * Selection mode which should be used for overlays selection
				 */
				selectionMode : {
					type : "sap.ui.dt.SelectionMode",
					defaultValue : sap.ui.dt.SelectionMode.Single
				},

				/**
				 * DesignTime metadata for classses to use with overlays (will overwrite default DTMetadata fields)
				 * should have a map structure { "sClassName" : oDesignTimeMetadata, ... }
				 */
				 designTimeMetadata : {
					type : "object"
				 }
			},
			associations : {
				/**
				 * Root elements to create overlays for
				 */
				rootElements : {
					type : "sap.ui.core.Element",
					multiple : true
				}
			},
			aggregations : {
				/**
				 * Plugins to use with a design time
				 */
				plugins : {
					type : "sap.ui.dt.Plugin",
					multiple : true
				}
			},
			events : {
				/**
				 * Event fired when an ElementOverlay is created and its designTimeMetadata is loaded
				 */
				elementOverlayCreated : {
					parameters : {
						elementOverlay : { type : "sap.ui.dt.ElementOverlay" }
					}
				},
				/**
				 * Event fired when an ElementOverlay is destroyed
				 */
				elementOverlayDestroyed : {
					parameters : {
						elementOverlay : { type : "sap.ui.dt.ElementOverlay" }
					}
				},
				/**
				 * Event fired when an overlays selection is changed
				 */
				selectionChange : {
					parameters : {
						selection : { type : "sap.ui.dt.Overlay[]" }
					}
				},
				/**
				 * Event fired when DesignTime is syncing overlays with a ControlTree of root elements
				 */
				syncing : {},
				/**
				 * Event fired when DesignTime's overlays are in-sync with ControlTree of root elements
				 */
				synced : {}
			}
		}
	});

	/**
	 * Called when the DesignTime is initialized
	 * @protected
	 */
	DesignTime.prototype.init = function() {
		// number of element overlays waiting for their designTimeMetadata
		this._iOverlaysPending = 0;
		this._oSelection = this.createSelection();
		this._oSelection.attachEvent("change", function(oEvent) {
			this.fireSelectionChange({selection: oEvent.getParameter("selection")});
		}, this);
	};

	/**
	 * Called when the DesignTime is destroyed
	 * @protected
	 */
	DesignTime.prototype.exit = function() {
		delete this._iOverlaysPending;
		this._destroyAllOverlays();
		this._oSelection.destroy();
	};

	/**
	 * Creates an instance of a Selection to handle the overlays selection inside of the DesignTime
	 * @return {sap.ui.dt.Selection} the instance of the Selection
	 * @protected
	 */
	DesignTime.prototype.createSelection = function() {
		return new Selection();
	};

	/**
	 * Returns array with current selected overlays
	 * @return {sap.ui.dt.Overlay[]} selected overlays
	 * @public
	 */
	DesignTime.prototype.getSelection = function() {
		return this._oSelection.getSelection();
	};

	/**
	 * Sets selection mode to be used in the Selection inside of the DesignTime
	 * @param {sap.ui.dt.SelectionMode} oMode a selection mode to be used with the Selection
	 * @return {sap.ui.dt.DesignTime} this
	 * @public
	 */
	DesignTime.prototype.setSelectionMode = function(oMode) {
		this.setProperty("selectionMode", oMode);
		this._oSelection.setMode(oMode);

		return this;
	};

	/**
	 * Returns all plugins used with the DesignTime
	 * @return {sap.ui.dt.Plugin[]} an array of plugins
	 * @protected
	 */
	DesignTime.prototype.getPlugins = function() {
		return this.getAggregation("plugins") || [];
	};

	/**
	 * Adds new plugin to use with the DesignTime
	 * @param {sap.ui.dt.Plugin} oPlugin to add
	 * @return {sap.ui.dt.DesignTime} this
	 * @protected
	 */
	DesignTime.prototype.addPlugin = function(oPlugin) {
		oPlugin.setDesignTime(this);

		this.addAggregation("plugins", oPlugin);

		return this;
	};

	/**
	 * Inserts new plugin to use with the DesignTime at a defined position
	 * @param {sap.ui.dt.Plugin} oPlugin to insert
	 * @param {int} iIndex a position to insert the plugin at
	 * @return {sap.ui.dt.DesignTime} this
	 * @protected
	 */
	DesignTime.prototype.insertPlugin = function(oPlugin, iIndex) {
		oPlugin.setDesignTime(this);

		this.insertAggregation("plugins", oPlugin, iIndex);

		return this;
	};

	/**
	 * Removes a plugin from the DesignTime
	 * @param {sap.ui.dt.Plugin} oPlugin to remove
	 * @return {sap.ui.dt.DesignTime} this
	 * @protected
	 */
	DesignTime.prototype.removePlugin = function(oPlugin) {
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
	 * Removes all plugins from the DesignTime
	 * @return {sap.ui.dt.DesignTime} this
	 * @protected
	 */
	DesignTime.prototype.removeAllPlugins = function() {
		this.getPlugins().forEach(function(oPlugin) {
			oPlugin.setDesignTime(null);
		});

		this.removeAllAggregation("plugins");

		return this;
	};

	/**
	 * Returns all root elements from the DesignTime
	 * @return {sap.ui.core.Element[]} rootElements of the DesignTime
	 * @protected
	 */
	DesignTime.prototype.getRootElements = function() {
		return this.getAssociation("rootElements") || [];
	};

	/**
	 * Returns a designTimeMetadata
	 * @return {map} designTimeMetadata
	 * @protected
	 */
	DesignTime.prototype.getDesignTimeMetadata = function() {
		return this.getProperty("designTimeMetadata") || {};
	};

	/**
	 * Returns a designTimeMetadata for the element or className
	 * @param {string|sap.ui.core.Element}
	 * @return {object} designTimeMetadata for a specific element or className
	 * @protected
	 */
	DesignTime.prototype.getDesignTimeMetadataFor = function(vElement) {
		var sClassName = vElement;
		var mDesignTimeMetadata = this.getDesignTimeMetadata();
		if (vElement.getMetadata) {
			sClassName = vElement.getMetadata().getName();
		}
		return mDesignTimeMetadata[sClassName];
	};

	/**
	 * Adds a root element to the DesignTime and creates overlays for it and it's public descendants
	 * @param {string|sap.ui.core.Element} vRootElement element or elemet's id
	 * @return {sap.ui.dt.DesignTime} this
	 * @protected
	 */
	DesignTime.prototype.addRootElement = function(vRootElement) {
		this.addAssociation("rootElements", vRootElement);

		var oRootOverlay = this._createElementOverlay(ElementUtil.getElementInstance(vRootElement));

		// trigger rendering of all overlays only once after DesignTime is synced
		// to prevent rerendering of UIArea during async loading process
		this.attachEventOnce("synced", function() {
			oRootOverlay.placeInOverlayContainer();
		});

		return this;
	};

	/**
	 * Removes a root element from the DesignTime and destroys overlays for it and it's public descendants
	 * @param {string|sap.ui.core.Element} vRootElement element or elemet's id
	 * @return {sap.ui.dt.DesignTime} this
	 * @protected
	 */
	DesignTime.prototype.removeRootElement = function(vRootElement) {
		this.removeAssociation("rootElements", vRootElement);

		this._destroyOverlaysForElement(ElementUtil.getElementInstance(vRootElement));

		return this;
	};

	/**
	 * Removes all root elements from the DesignTime and destroys overlays for them and theire public descendants
	 * @param {string|sap.ui.core.Element} element or elemet's id
	 * @return {sap.ui.dt.DesignTime} this
	 * @protected
	 */
	DesignTime.prototype.removeAllRootElement = function() {
		this.removeAssociation("rootElements");

		this._destroyAllOverlays();

		return this;
	};


	/**
	 * Creates and returns the created instance of ElementOverlay for an element
	 * @param {string|sap.ui.core.Element} oElement to create ElementOverlay for
	 * @param {object} oDesignTimeMetadata to create ElementOverlay with
	 * @return {sap.ui.dt.ElementOverlay} created ElementOverlay
	 * @protected
	 */
	DesignTime.prototype.createElementOverlay = function(oElement, bInHiddenTree) {
		return new ElementOverlay({
			inHiddenTree : bInHiddenTree,
			element : oElement
		});
	};

	/**
	 * Returns an array with all element overlays created, registered and handled by the DesignTime
	 * @return {sap.ui.dt.ElementOverlay[]} all element overlays created and handled by the DesignTime
	 * @public
	 */
	DesignTime.prototype.getElementOverlays = function() {
		var that = this;
		var aElementOverlays = [];

		this._iterateRootElements(function(oRootElement) {
			aElementOverlays = aElementOverlays.concat(that._getAllElementOverlaysIn(oRootElement));
		});

		return aElementOverlays;
	};

	/**
	 * @param {sap.ui.core.Element} oElement element
	 * @return {sap.ui.dt.ElementOverlay} created or already existing instance of ElementOverlay for oElement
	 * @private
	 */
	DesignTime.prototype._createElementOverlay = function(oElement, bInHiddenTree) {
		var that = this;

		oElement = ElementUtil.fixComponentContainerElement(oElement);
		var oElementOverlay = OverlayRegistry.getOverlay(oElement);
		if (oElement && !oElement.bIsDestroyed && !oElementOverlay) {
			if (this._iOverlaysPending === 0) {
				this.fireSyncing();
			}
			this._iOverlaysPending++;

			oElementOverlay = this.createElementOverlay(oElement, bInHiddenTree);
			if (oElementOverlay) {
				oElementOverlay.attachRequestElementOverlaysForAggregation(this._onRequestElementOverlaysForAggregation, this);
				oElementOverlay.attachElementModified(this._onElementModified, this);
				oElementOverlay.attachDestroyed(this._onElementOverlayDestroyed, this);
				oElementOverlay.attachSelectionChange(this._onElementOverlaySelectionChange, this);
			}

			ElementUtil.loadDesignTimeMetadata(oElement).then(function(oDesignTimeMetadata) {
				// merge the DTMetadata from the DesignTime and from UI5
				var oMergedDesignTimeMetadata = oDesignTimeMetadata || {};
				jQuery.extend(true, oMergedDesignTimeMetadata, that.getDesignTimeMetadataFor(oElement));
				var oElementDesignTimeMetadata = new ElementDesignTimeMetadata({data : oMergedDesignTimeMetadata});

				oElementOverlay.setDesignTimeMetadata(oElementDesignTimeMetadata);

				that.fireElementOverlayCreated({elementOverlay : oElementOverlay});
			}).catch(function(oError) {
				jQuery.sap.log.error("exception occured in sap.ui.dt.DesignTime._createElementOverlay", oError);
			}).then(function() {
				that._iOverlaysPending--;
				if (that._iOverlaysPending === 0) {
					that.fireSynced();
				}
			});
		}

		return oElementOverlay;
	};

	/**
	 * Create an overlay for an element and register it in the DesignTime
	 * @param {sap.ui.core.Element} oElement element
	 * @return {sap.ui.dt.ElementOverlay} created ElementOverlay
	 * @public
	 */
	DesignTime.prototype.createOverlay = function(oElement) {
		return this._createElementOverlay(oElement);
	};

	/**
	 * @param {sap.ui.core.Element} oElement element
	 * @private
	 */
	DesignTime.prototype._destroyOverlaysForElement = function(oElement) {
		var oOverlay = OverlayRegistry.getOverlay(oElement);
		if (oOverlay) {
			oOverlay.destroy();
		}
	};

	/**
	 * @private
	 */
	DesignTime.prototype._destroyAllOverlays = function() {
		var that = this;

		this._iterateRootElements(function(oRootElement) {
			that._destroyOverlaysForElement(oRootElement);
		});
	};

	/**
	 * @private
	*/
	DesignTime.prototype._createChildOverlaysForAggregation = function(oElementOverlay, sAggregationName) {
		var that = this;

		var oAggregationOverlay = oElementOverlay.getAggregationOverlay(sAggregationName);
		var oElement = oElementOverlay.getElementInstance();
		var vChildren = ElementUtil.getAggregation(oElement, sAggregationName);
		ElementUtil.iterateOverElements(vChildren, function(oChild) {
			that._createElementOverlay(oChild, oAggregationOverlay.isInHiddenTree());
		});
	};

	/**
	 * @private
	*/
	DesignTime.prototype._onRequestElementOverlaysForAggregation = function(oEvent) {
		var oElementOverlay = oEvent.getSource();

		var sAggregationName = oEvent.getParameter("name");
		this._createChildOverlaysForAggregation(oElementOverlay, sAggregationName);
	};

	/**
	 * @param {sap.ui.baseEvent} oEvent event object
	 * @private
	*/
	DesignTime.prototype._onElementOverlayDestroyed = function(oEvent) {
		var oElementOverlay = oEvent.getSource();

		if (oElementOverlay.getSelected()) {
			this._oSelection.remove(oElementOverlay);
		}
		this.fireElementOverlayDestroyed({overlay : oElementOverlay});
	};

	/**
	 * @param {sap.ui.baseEvent} oEvent event object
	 * @private
	 */
	DesignTime.prototype._onElementOverlaySelectionChange = function(oEvent) {
		var oElementOverlay = oEvent.getSource();
		var bSelected = oEvent.getParameter("selected");

		this._oSelection.set(oElementOverlay, bSelected);
	};

	/**
	 * @param {sap.ui.baseEvent} oEvent event object
	 * @private
	 */
	DesignTime.prototype._onElementModified = function(oEvent) {
		var that = this;

		var oParams = oEvent.getParameters();
		if (oParams.type === "addOrSetAggregation" || oParams.type === "insertAggregation") {
			this._onElementOverlayAddAggregation(oParams.value, oParams.target, oParams.name);
		} else if (oParams.type === "setParent") {
			// timeout is needed because UI5 controls & apps can temporary "dettach" controls from control tree
			// and add them again later, so the check if the control is dettached from root element's tree is delayed
			setTimeout(function() {
				if (!that.bIsDestroyed) {
					that._checkIfOverlayShouldBeDestroyed(oParams.target, oParams.value);
				}
			}, 0);
		}
	};

	/**
	 * @param {sap.ui.core.Element} oElement which was added
	 * @private
	 */
	DesignTime.prototype._onElementOverlayAddAggregation = function(oChild, oParent, sAggregationName) {
		// oElement can be of an alternative type (setLabel(sText) for example)
		if (oChild instanceof sap.ui.core.Element) {
			var oChildElementOverlay = OverlayRegistry.getOverlay(oChild);
			if (!oChildElementOverlay) {
				var bIsInHiddenTree = OverlayRegistry.getOverlay(oParent).getAggregationOverlay(sAggregationName).isInHiddenTree();
				this._createElementOverlay(oChild, bIsInHiddenTree);
			}
		}
	};

	/**
	 * @param {sap.ui.core.Element} oElement which parent was changed
	 * @param {sap.ui.core.Element} oParent new parent
	 * @private
	 */
	DesignTime.prototype._checkIfOverlayShouldBeDestroyed = function(oElement, oParent) {
		var oElementOverlay = OverlayRegistry.getOverlay(oElement);
		if (oElementOverlay && !this._isElementInRootElements(oElement)) {
			oElementOverlay.destroy();
		}
	};

	/**
	 * @param {sap.ui.core.Element} oElement to check
	 * @return {boolean} returns if an element is a descendant of any of the root elements
	 * @private
	 */
	DesignTime.prototype._isElementInRootElements = function(oElement) {
		var bFoundAncestor = false;

		this._iterateRootElements(function(oRootElement) {
			if (ElementUtil.hasAncestor(oElement, oRootElement)) {
				bFoundAncestor = true;
				return false;
			}
		});

		return bFoundAncestor;
	};

	/**
	 * @param {function} fnStep function called with every root element
	 * @private
	 */
	DesignTime.prototype._iterateRootElements = function(fnStep) {
		var aRootElements = this.getRootElements();
		aRootElements.forEach(function(sRootElementId) {
			var oRootElement = ElementUtil.getElementInstance(sRootElementId);
			fnStep(oRootElement);
		});
	};

	/**
	 * @param {sap.ui.core.Element} oElement to search overlays for, also all children overlays will be found
	 * @return {sap.ui.dt.ElementOverlay[]} created element overlays for oElement and it's children
	 * @private
	 */
	DesignTime.prototype._getAllElementOverlaysIn = function(oElement) {
		var aElementOverlays = [];

		var oElementOverlay = OverlayRegistry.getOverlay(oElement);
		if (oElementOverlay) {
			OverlayUtil.iterateOverlayElementTree(oElementOverlay, function(oChildOverlay) {
				aElementOverlays.push(oChildOverlay);
			});
		}

		return aElementOverlays;
	};

	return DesignTime;
}, /* bExport= */ true);