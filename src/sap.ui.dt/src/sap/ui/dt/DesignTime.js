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
	'sap/ui/dt/Overlay',
	'sap/ui/dt/OverlayUtil',
	'./library'
],
function(ManagedObject, ElementOverlay, OverlayRegistry, Selection, ElementDesignTimeMetadata, ElementUtil, Overlay, OverlayUtil) {
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
	 * @extends sap.ui.base.ManagedObject
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
				 },

				/**
				 * Whether overlays of DT are enabled (shown on the screen). When 'false', DT is still
				 * working, but overlays do not recalculate their styles.
				 */
				 enabled: {
					type: "boolean",
					defaultValue: true
				},

				scope: {
					type: "string",
					defaultValue: "default"
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
				 * Event fired when DesignTime's overlays are in-sync with ControlTree of root elements and registered at all known plugins
				 */
				synced : {},
				/**
				 * Event fired when DesignTime's overlays are in-sync with ControlTree of root elements
				 */
				syncedPureOverlays : {},
				/**
				 * Event fired when DesignTime's overlays failed to sync with ControlTree of root elements
				 */
				syncFailed : {}
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

		this._collectOverlaysDuringSyncing();
	};

	DesignTime.prototype._collectOverlaysDuringSyncing = function() {
		// array of element overlays created between syncing and synced event
		this._aOverlaysCreatedInLastBatch = [];

		this.attachSyncing(function(){
			this._aOverlaysCreatedInLastBatch = [];
		}.bind(this));

		this.attachElementOverlayCreated(function(oEvent){
			var oNewOverlay = oEvent.getParameter("elementOverlay");
			this._aOverlaysCreatedInLastBatch.push(oNewOverlay);
		}.bind(this));

		this.attachSyncedPureOverlays(function(){
			var aPlugins = this.getPlugins();
			this._aOverlaysCreatedInLastBatch.forEach(function(oOverlay) {
				aPlugins.forEach(function(oPlugin) {
					oPlugin.callElementOverlayRegistrationMethods(oOverlay);
				});
			});

			this.fireSynced();
			this._aOverlaysCreatedInLastBatch = [];
		}.bind(this));
	};

	/**
	 * Called when the DesignTime is destroyed
	 * @protected
	 */
	DesignTime.prototype.exit = function() {
		delete this._iOverlaysPending;
		delete this._aOverlaysCreatedInLastBatch;

		// The plugins need to be destroyed before the overlays in order to go through the deregisterElementOverlay Methods
		this.getPlugins().forEach(function(oPlugin) {
			oPlugin.destroy();
		});

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
	 * @param {string|sap.ui.core.Element} vElement element or string witch is needed to expect classname
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
		}, this);

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
	 * @return {sap.ui.dt.ElementOverlay} created ElementOverlay
	 * @protected
	 */
	DesignTime.prototype.createElementOverlay = function(oElement) {
		return new ElementOverlay({
			element : oElement
		});
	};

	/**
	 * Returns an array with all element overlays created, registered and handled by the DesignTime
	 * @return {sap.ui.dt.ElementOverlay[]} all element overlays created and handled by the DesignTime
	 * @public
	 */
	DesignTime.prototype.getElementOverlays = function() {
		var aElementOverlays = [];

		this._iterateRootElements(function(oRootElement) {
			aElementOverlays = aElementOverlays.concat(this._getAllElementOverlaysIn(oRootElement));
		}, this);

		return aElementOverlays;
	};

	/**
	 * @param {sap.ui.core.Element} oElement element
	 * @return {sap.ui.dt.ElementOverlay} created or already existing instance of ElementOverlay for oElement
	 * @private
	 */
	DesignTime.prototype._createElementOverlay = function(oElement) {
		var oElementOverlay = OverlayRegistry.getOverlay(oElement);
		if (oElement && !oElement.bIsDestroyed && !oElementOverlay) {
			if (this._iOverlaysPending === 0) {
				this.fireSyncing();
			}
			this._iOverlaysPending++;

			oElementOverlay = this.createElementOverlay(oElement);
			if (oElementOverlay) {
				oElementOverlay.attachRequestElementOverlaysForAggregation(this._onRequestElementOverlaysForAggregation, this);
				oElementOverlay.attachElementModified(this._onElementModified, this);
				oElementOverlay.attachDestroyed(this._onElementOverlayDestroyed, this);
				oElementOverlay.attachSelectionChange(this._onElementOverlaySelectionChange, this);
			}

			ElementUtil.loadDesignTimeMetadata(oElement, this.getScope()).then(function(oDesignTimeMetadata) {
				// if oElement is already destroyed while designtime metadata is loading
				if (!oElement || oElement.bIsDestroyed) {
					return;
				}
				// merge the DTMetadata from the DesignTime and from UI5
				var oMergedDesignTimeMetadata = oDesignTimeMetadata || {};

				jQuery.extend(true, oMergedDesignTimeMetadata, this.getDesignTimeMetadataFor(oElement));
				var oElementDesignTimeMetadata = new ElementDesignTimeMetadata({
					libraryName : oElement.getMetadata().getLibraryName(),
					data : oMergedDesignTimeMetadata});

				oElementOverlay.setDesignTimeMetadata(oElementDesignTimeMetadata);
				this.fireElementOverlayCreated({elementOverlay : oElementOverlay});
			}.bind(this)).catch(function(oError) {
				jQuery.sap.log.error("exception occurred in sap.ui.dt.DesignTime._createElementOverlay", oError.stack || oError);
				if (oError instanceof Error) {
					this.fireSyncFailed();
				}
			}.bind(this)).then(function() {
				this._iOverlaysPending--;
				if (this._iOverlaysPending === 0) {
					this.fireSyncedPureOverlays();
				}
			}.bind(this));
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
		this._iterateRootElements(function(oRootElement) {
			this._destroyOverlaysForElement(oRootElement);
		}, this);
	};

	/**
	 * @param {sap.ui.core.ElementOverlay} oElementOverlay element overlay
	 * @param {string} sAggregationName name of the aggregation for which element overlays has to be created
	 * @private
	*/
	DesignTime.prototype._createChildOverlaysForAggregation = function(oElementOverlay, sAggregationName) {
		OverlayUtil.iterateOverAggregationLikeChildren(oElementOverlay, sAggregationName, function(oChild) {
			this._createElementOverlay(oChild);
		}.bind(this));
	};

	/**
	 * @param {sap.ui.baseEvent} oEvent event object
	 * @private
	*/
	DesignTime.prototype._onRequestElementOverlaysForAggregation = function(oEvent) {
		var oElementOverlay = oEvent.getSource();

		var sAggregationName = oEvent.getParameter("name");
		this._createChildOverlaysForAggregation(oElementOverlay, sAggregationName);
		// if aggregation overlay is created without element overlay being created (not syncing),
		// the aggregation overlay must be registered on the plugins
		if (this._iOverlaysPending === 0){
			var aPlugins = this.getPlugins();
			aPlugins.forEach(function(oPlugin) {
				oPlugin.callAggregationOverlayRegistrationMethods(oElementOverlay);
			});
		}
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
		var oParams = oEvent.getParameters();
		if (oParams.type === "addOrSetAggregation" || oParams.type === "insertAggregation") {
			this._onElementOverlayAddAggregation(oParams.value, oParams.target, oParams.name);
		} else if (oParams.type === "setParent") {
			// timeout is needed because UI5 controls & apps can temporary "dettach" controls from control tree
			// and add them again later, so the check if the control is dettached from root element's tree is delayed
			setTimeout(function() {
				if (!this.bIsDestroyed) {
					this._checkIfOverlayShouldBeDestroyed(oParams.target);
				}
			}.bind(this), 0);
		}
	};

	/**
	 * @param {sap.ui.core.Element} oChild which was added
	 * @private
	 */
	DesignTime.prototype._onElementOverlayAddAggregation = function(oChild, oParent, sAggregationName) {
		var oParentOverlay = OverlayRegistry.getOverlay(oParent);
		var oParentAggregationOverlay = oParentOverlay.getAggregationOverlay(sAggregationName);
		// oElement can be of an alternative type (setLabel(sText) for example)
		if (oChild instanceof sap.ui.base.ManagedObject) {
			var oChildElementOverlay = OverlayRegistry.getOverlay(oChild);
			if (!oChildElementOverlay) {
				oChildElementOverlay = this._createElementOverlay(oChild);
				oParentAggregationOverlay.addChild(oChildElementOverlay);
			} else {
				// element overlay needs to have a correct parent for propagation
				oParentAggregationOverlay.addChild(oChildElementOverlay);
				oChildElementOverlay.setDesignTimeMetadata(oChildElementOverlay._oOriginalDesignTimeMetadata);
			}
		}
	};

	/**
	 * @param {sap.ui.core.Element} oElement which was modified
	 * @private
	 */
	DesignTime.prototype._checkIfOverlayShouldBeDestroyed = function(oElement) {
		var oElementOverlay = OverlayRegistry.getOverlay(oElement);
		// Overlays of elements in "dependents" aggregation or not in root elements should be destroyed
		if (oElementOverlay &&
			(!this._isElementInRootElements(oElement) || oElement.sParentAggregationName === "dependents")) {
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
	 * @param {object} oScope provides scope object
	 * @private
	 */
	DesignTime.prototype._iterateRootElements = function(fnStep, oScope) {
		var aRootElements = this.getRootElements();
		aRootElements.forEach(function(sRootElementId) {
			var oRootElement = ElementUtil.getElementInstance(sRootElementId);
			fnStep.call(oScope || this, oRootElement);
		}, this);
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
				if (oChildOverlay.getDesignTimeMetadata()) {
					aElementOverlays.push(oChildOverlay);
				}
			});
		}

		return aElementOverlays;
	};

	/**
	 * Custom setter for property 'enabled'
	 * @public
	 */
	DesignTime.prototype.setEnabled = function (bValue) {
		var $OverlayContainer = jQuery(Overlay.getOverlayContainer());
		$OverlayContainer[bValue ? 'show' : 'hide']();

		this.getElementOverlays().forEach(function (oOverlay) {
			oOverlay.setVisible(bValue);
			oOverlay.getChildren().forEach(function (oOverlayChild) {
				oOverlayChild.setVisible(bValue);
			});
		});

		this.setProperty('enabled', bValue);
	};

	return DesignTime;
}, /* bExport= */ true);