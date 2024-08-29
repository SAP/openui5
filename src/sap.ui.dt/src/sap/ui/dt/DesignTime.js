/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/restricted/_curry",
	"sap/base/util/restricted/_difference",
	"sap/base/util/isEmptyObject",
	"sap/base/util/isPlainObject",
	"sap/base/util/merge",
	"sap/base/util/ObjectPath",
	"sap/base/Log",
	"sap/ui/base/ManagedObject",
	"sap/ui/dt/AggregationDesignTimeMetadata",
	"sap/ui/dt/AggregationOverlay",
	"sap/ui/dt/DesignTimeStatus",
	"sap/ui/dt/ElementDesignTimeMetadata",
	"sap/ui/dt/ElementOverlay",
	"sap/ui/dt/ElementUtil",
	"sap/ui/dt/MetadataPropagationUtil",
	"sap/ui/dt/Overlay",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/dt/OverlayUtil",
	"sap/ui/dt/SelectionManager",
	"sap/ui/dt/SelectionMode",
	"sap/ui/dt/TaskManager",
	"sap/ui/dt/TaskRunner",
	"sap/ui/dt/util/ZIndexManager",
	"sap/ui/dt/Util"
], function(
	_curry,
	_difference,
	isEmptyObject,
	isPlainObject,
	merge,
	ObjectPath,
	Log,
	ManagedObject,
	AggregationDesignTimeMetadata,
	AggregationOverlay,
	DesignTimeStatus,
	ElementDesignTimeMetadata,
	ElementOverlay,
	ElementUtil,
	MetadataPropagationUtil,
	Overlay,
	OverlayRegistry,
	OverlayUtil,
	SelectionManager,
	SelectionMode,
	TaskManager,
	TaskRunner,
	ZIndexManager,
	Util
) {
	"use strict";

	/**
	 * Constructor for a new DesignTime.
	 *
	 * @param {string} [sId] id for the new object, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new object
	 *
	 * @class
	 * The DesignTime allows to create a set of Overlays above the root elements and
	 * their public children and manage their events.
	 * @extends sap.ui.base.ManagedObject
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.30
	 * @alias sap.ui.dt.DesignTime
	 */

	var DesignTime = ManagedObject.extend("sap.ui.dt.DesignTime", /** @lends sap.ui.dt.DesignTime.prototype */ {
		metadata: {
			library: "sap.ui.dt",
			properties: {
				/**
				 * DesignTime metadata for classes to use with overlays (will overwrite default DTMetadata fields)
				 * should have a map structure { "sClassName" : oDesignTimeMetadata, ... }
				 */
				designTimeMetadata: {
					type: "object"
				},

				/**
				 * Whether overlays are enabled (shown on the screen). When 'false', DesignTime is still
				 * working, but overlays do not recalculate their styles.
				 */
				enabled: {
					type: "boolean",
					defaultValue: true
				},

				/**
				 * DesignTime metadata scope
				 */
				scope: {
					type: "string",
					defaultValue: "default"
				}
			},
			associations: {
				/**
				 * Root elements to create overlays for
				 */
				rootElements: {
					type: "sap.ui.core.Element",
					multiple: true
				}
			},
			aggregations: {
				/**
				 * Plugins to use with a design time
				 */
				plugins: {
					type: "sap.ui.dt.Plugin",
					multiple: true
				}
			},
			events: {
				/**
				 * Fires when new root element is added
				 */
				addRootElement: {
					parameters: {
						element: {
							type: "sap.ui.core.Element"
						}
					}
				},

				/**
				 * Fires when new plugin is added
				 */
				addPlugin: {
					parameters: {
						plugin: {
							type: "sap.ui.dt.Plugin"
						}
					}
				},

				/**
				 * Fires when property 'enabled' is changed
				 */
				enabledChanged: {
					parameters: {
						value: {
							type: "boolean"
						}
					}
				},

				/**
				 * Fires when an ElementOverlay is created and it's ready for use
				 */
				elementOverlayCreated: {
					parameters: {
						elementOverlay: {
							type: "sap.ui.dt.ElementOverlay"
						}
					}
				},

				/**
				 * Fires when an ElementOverlay is destroyed
				 */
				elementOverlayDestroyed: {
					parameters: {
						elementOverlay: {
							type: "sap.ui.dt.ElementOverlay"
						}
					}
				},

				/**
				 * Fires when element overlay is added to an aggregation
				 */
				elementOverlayAdded: {
					parameters: {
						// id of the added overlay
						id: {type: "string"},

						// index of element overlay in the target aggregation overlay
						targetIndex: {type: "int"},

						// id of target aggregation overlay
						targetId: {type: "string"},

						// aggregation where element overlay is inserted
						targetAggregation: {type: "string"}
					}
				},

				/**
				 * Fires when element overlay is moved inside an aggregation
				 */
				elementOverlayMoved: {
					parameters: {
						// id of the moved overlay
						id: {type: "string"},

						// index of element overlay in the target aggregation overlay
						targetIndex: {type: "int"},

						// id of target aggregation overlay
						targetId: {type: "string"},

						// aggregation where element overlay is inserted
						targetAggregation: {type: "string"}
					}
				},

				/**
				 * Fires the "editable" property of an overlay changes
				 */
				elementOverlayEditableChanged: {
					parameters: {
						id: {type: "string"},
						elementId: {type: "string"},
						editable: {type: "boolean"}
					}
				},

				/**
				 * Fires when a property of an element with an overlay changes
				 */
				elementPropertyChanged: {
					parameters: {
						id: {type: "string"},
						name: {type: "string"},
						oldValue: {type: "any"},
						value: {type: "any"}
					}
				},

				/**
				 * Fires when DesignTime is syncing overlays with a ControlTree of root elements
				 */
				syncing: {},

				/**
				 * Fires when DesignTime's overlays are in-sync with ControlTree of root elements and registered at all known plugins
				 */
				synced: {},

				/**
				 * Fires when DesignTime's overlays failed to sync with ControlTree of root elements
				 */
				syncFailed: {}
			}
		},
		// eslint-disable-next-line object-shorthand
		constructor: function(...aArgs) {
			// Storage for promises of pending overlays (overlays that are in creation phase)
			this._sStatus = DesignTimeStatus.SYNCED;
			this._mPendingOverlays = {};
			this._oTaskManager = new TaskManager({
				complete: function(oEvent) {
					if (oEvent.getSource().isEmpty()) {
						this._registerElementOverlays();
						// TODO: get rid of this temporary solution with UICSFLEX-3718 BLI
						// new teasks are created during element overlay registration
						if (this._oTaskManager.isEmpty() && this._sStatus !== DesignTimeStatus.SYNCED) {
							this._sStatus = DesignTimeStatus.SYNCED;
							setTimeout(function() {
								// checks if designTime status is still synced, due to asynchronity from setTimeout()
								if (this._sStatus === DesignTimeStatus.SYNCED) {
									this.fireSynced();
								}
							}.bind(this), 0);
						}
					}
				}.bind(this),
				add: function(oEvent) {
					if (oEvent.getSource().count() === 1) {
						this._sStatus = DesignTimeStatus.SYNCING;
						this.fireSyncing();
					}
				}.bind(this)
			});
			this._oTaskRunner = new TaskRunner({
				taskManager: this._oTaskManager,
				taskType: "applyStyles"
			}).run();

			this._oSelectionManager = new SelectionManager();

			// Syncing batch of overlays
			this._aOverlaysCreatedInLastBatch = [];

			ManagedObject.apply(this, aArgs);

			// Create overlays for root elements
			this.getRootElements().forEach(this._createOverlaysForRootElement, this);

			// Create overlays for future root elements
			this.attachEvent("addRootElement", function(oEvent) {
				this._createOverlaysForRootElement(oEvent.getParameter("element"));
			}, this);

			// Attach processingStatusChange to available plugins
			this.getPlugins().forEach(function(oPlugin) {
				oPlugin.attachEvent("processingStatusChange", this._onProcessingStatusChange, this);
			}, this);

			// Attach processingStatusChange for future added plugins
			this.attachEvent("addPlugin", function(oEvent) {
				var oPlugin = oEvent.getParameter("plugin");
				oPlugin.attachEvent("processingStatusChange", this._onProcessingStatusChange, this);
			}, this);

			// Toggle root overlays visibility when property "enabled" is changed
			this.attachEvent("enabledChanged", function(oEvent) {
				var bValue = oEvent.getParameter("value");
				var $OverlayContainer = Overlay.getOverlayContainer();
				$OverlayContainer[bValue ? "show" : "hide"]();

				// Ensure that the overlays are correct when the mode is enabled
				this.getRootElements().forEach(function(oRootElement) {
					var oRootElementOverlay = OverlayRegistry.getOverlay(oRootElement);
					oRootElementOverlay.setVisible(bValue);

					// TODO: move to overlay
					if (bValue) {
						this._oTaskManager.add({
							type: "applyStyles",
							callbackFn: oRootElementOverlay.applyStyles.bind(oRootElementOverlay, /* bForceScrollbarSync = */true),
							overlayId: oRootElementOverlay.getId()
						});
					}
				}.bind(this));
			}, this);
		}
	});

	DesignTime.prototype._onProcessingStatusChange = function(oEvent) {
		if (oEvent.getParameter("processing")) {
			this._oTaskManager.add({
				type: "pluginInProcess",
				plugin: oEvent.getSource().getMetadata().getName()
			});
		} else {
			this._oTaskManager.completeBy({
				type: "pluginInProcess",
				plugin: oEvent.getSource().getMetadata().getName()
			});
		}
	};

	DesignTime.prototype._onApplyStylesRequired = function(oEvent) {
		var mParameters = oEvent.getParameters();
		var oOverlay = oEvent.getSource();
		this._oTaskManager.add({
			type: "applyStyles",
			callbackFn: oOverlay.applyStyles.bind(oOverlay, mParameters.bForceScrollbarSync, mParameters.bSkipForceCalculation),
			overlayId: oOverlay.getId()
		}, "overlayId");
	};

	DesignTime.prototype._removeOverlayFromSyncingBatch = function(oElementOverlay) {
		var iIndex = this._aOverlaysCreatedInLastBatch.indexOf(oElementOverlay);
		if (iIndex !== -1) {
			this._aOverlaysCreatedInLastBatch.splice(iIndex, 1);
		}
	};

	DesignTime.prototype._registerElementOverlays = function() {
		var aElementOverlays = this._aOverlaysCreatedInLastBatch.slice();

		if (!aElementOverlays.length) {
			return;
		}

		this._aOverlaysCreatedInLastBatch = [];

		// TODO: get rid of this temporary solution with UICSFLEX-3718 BLI
		var iTaskId = this._oTaskManager.add({
			type: "registerElementOverlays"
		});
		var aPlugins = this.getPlugins();

		// IMPORTANT: cycles below should not be combined in one.
		// Reason: overlays life-cycle:
		// - create
		// - register in registry
		// - register in plugins
		// - inform others about the new overlay
		// The source code of each step may rely on the previous step indirectly. E.g.:
		// Layout->Button. When we register Button inside the plugins, they may expect
		// Layout to be available in OverlayRegistry already.

		// 1. Register element overlays in OverlayRegistry:
		aElementOverlays.forEach(function(oElementOverlay) {
			OverlayRegistry.register(oElementOverlay);
			oElementOverlay.attachBeforeDestroy(function(oEvent) {
				OverlayRegistry.deregister(oEvent.getSource());
			});
		});

		// 2. Register element overlays in plugins:
		aElementOverlays.forEach(function(oElementOverlay) {
			aPlugins.forEach(function(oPlugin) {
				try {
					oPlugin.callElementOverlayRegistrationMethods(oElementOverlay);
				} catch (vError) {
					var oError = Util.propagateError(
						vError,
						"DesignTime#_registerElementOverlays",
						`registerElementOverlay() method of the plugin ${oPlugin.getMetadata().getName()} has failed for overlay with id='${oElementOverlay.getId()}' (element id='${oElementOverlay.getElement().getId()}')`
					);
					Log.error(Util.errorToString(oError));
				}
			});
		}, this);

		// 3. Tell the world about this miracle
		aElementOverlays.forEach(function(oElementOverlay) {
			try {
				this.fireElementOverlayCreated({
					elementOverlay: oElementOverlay
				});
			} catch (vError) {
				var oError = Util.propagateError(
					vError,
					"DesignTime#_registerElementOverlays",
					`One of the listeners of elementOverlayCreated event failed while processing the overlay with id='${oElementOverlay.getId()}' for element with id='${oElementOverlay.getElement().getId()}'`
				);
				Log.error(Util.errorToString(oError));
			}
		}, this);

		this._oTaskManager.complete(iTaskId);
	};

	/**
	 * Called when the DesignTime is destroyed
	 * @protected
	 */
	DesignTime.prototype.exit = function() {
		this._bDestroyPending = true;

		// The plugins need to be destroyed before the overlays in order to go through the deregisterElementOverlay Methods
		this.getPlugins().forEach(function(oPlugin) {
			oPlugin.destroy();
		});

		this._oSelectionManager.destroy();
		this._oTaskManager.destroy();

		this._destroyAllOverlays();
		// ZIndexManager is static and is used in overlays, dt-plugins and rta-toolbar.
		// Desingtime seems to be the best place for ZIndexManager to be cleared.
		ZIndexManager.clearState();

		this._aOverlaysCreatedInLastBatch = [];
		delete this._bDestroyPending;
	};

	/**
	 * Returns the Selection Manager
	 * @return {sap.ui.dt.SelectionManager} the instance of the Selection Manager
	 * @public
	 */
	DesignTime.prototype.getSelectionManager = function() {
		return this._oSelectionManager;
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
	 * Returns all plugins that are currently busy
	 * @returns {sap.ui.dt.Plugin[]} Returns an array of busy plugins
	 * @protected
	 */
	DesignTime.prototype.getBusyPlugins = function() {
		return this.getPlugins().filter(function(oPlugin) {
			return oPlugin.isBusy();
		});
	};

	/**
	 * Resolves when all the currently busy plugins are not busy anymore
	 * @returns {Promise} Resolves with undefined when no plugin is busy anymore
	 */
	DesignTime.prototype.waitForBusyPlugins = function() {
		var aBusyPlugins = this.getBusyPlugins();
		return Promise.all(aBusyPlugins.map(function(oPlugin) {
			return oPlugin.waitForBusyAction();
		}));
	};

	/**
	 * Adds new plugin to use with the DesignTime
	 * @param {sap.ui.dt.Plugin} oPlugin to add
	 * @return {sap.ui.dt.DesignTime} this
	 * @protected
	 */
	DesignTime.prototype.addPlugin = function(oPlugin) {
		this.addAggregation("plugins", oPlugin);
		this.fireAddPlugin({
			plugin: oPlugin
		});
		oPlugin.setDesignTime(this);
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
		this.insertAggregation("plugins", oPlugin, iIndex);
		this.fireAddPlugin({
			plugin: oPlugin
		});
		oPlugin.setDesignTime(this);
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
				oPlugin.detachEvent("processingStatusChange", this._onProcessingStatusChange, this);
			}
		}.bind(this));

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
			oPlugin.detachEvent("processingStatusChange", this._onProcessingStatusChange, this);
		}.bind(this));

		this.removeAllAggregation("plugins");

		return this;
	};

	/**
	 * Returns all root elements from the DesignTime
	 * @return {sap.ui.core.Element[]} rootElements of the DesignTime
	 * @protected
	 */
	DesignTime.prototype.getRootElements = function() {
		return (this.getAssociation("rootElements") || []).map(function(sElementId) {
			return ElementUtil.getElementInstance(sElementId);
		});
	};

	/**
	 * Returns a designTimeMetadata for the element or className
	 * @param {sap.ui.core.Element} oElement element or string witch is needed to expect classname
	 * @return {object} designTimeMetadata for a specific element or className
	 * @protected
	 */
	DesignTime.prototype.getDesignTimeMetadataFor = function(oElement) {
		var sClassName;

		if (typeof oElement === "string") { // backwards compatibility, should be dropped in future releases (>rel-1.54)
			sClassName = oElement;
			Log.error(
				"sap.ui.dt.DesignTime#getDesignTimeMetadataFor / Function getDesignTimeMetadataFor() should be called with element instance"
			);
		} else {
			sClassName = oElement.getMetadata().getName();
		}

		return (this.getDesignTimeMetadata() || {})[sClassName];
	};

	/**
	 * Adds a root element to the DesignTime and creates overlays for it and it's public descendants
	 * @param {string|sap.ui.core.Element} vRootElement element or element's id
	 * @protected
	 */
	DesignTime.prototype.addRootElement = function(vRootElement) {
		this.addAssociation("rootElements", vRootElement);
		this.fireAddRootElement({
			element: vRootElement
		});
	};

	/**
	 * Creates overlay for specified root element and renders it in overlay container
	 * @param {sap.ui.base.ManagedObject} oRootElement - Root element
	 * @private
	 */
	DesignTime.prototype._createOverlaysForRootElement = function(oRootElement) {
		var iTaskId = this._oTaskManager.add({
			type: "createOverlay",
			element: oRootElement,
			root: true
		});
		this.createOverlay({
			element: ElementUtil.getElementInstance(oRootElement),
			root: true,
			visible: this.getEnabled()
		})
		.then(
			function(oElementOverlay) {
				Overlay.getOverlayContainer().append(oElementOverlay.render());
				this._oTaskManager.add({
					type: "applyStyles",
					callbackFn: oElementOverlay.applyStyles.bind(oElementOverlay),
					overlayId: oElementOverlay.getId()
				}, "overlayId");
				this._oTaskManager.complete(iTaskId);
				return oElementOverlay;
			}.bind(this),
			function(vError) {
				var oError = Util.propagateError(
					vError,
					"DesignTime#_createOverlaysForRootElement",
					`Initialization failed for root element with id '${oRootElement.getId()}'`
				);
				Log.error(Util.errorToString(oError));
				this._oTaskManager.cancel(iTaskId);
				this.fireSyncFailed({
					error: oError
				});
			}.bind(this)
		);
	};

	/**
	 * Removes a root element from the DesignTime and destroys overlays for it and its public descendants
	 * @param {string|sap.ui.core.Element} vRootElement element or element id
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
	 * Returns an array with all element overlays created, registered and handled by the DesignTime
	 * @return {sap.ui.dt.ElementOverlay[]} all element overlays created and handled by the DesignTime
	 * @public
	 */
	// TODO: replace with OverlayRegistry
	DesignTime.prototype.getElementOverlays = function() {
		var aElementOverlays = [];

		this._iterateRootElements(function(oRootElement) {
			aElementOverlays = aElementOverlays.concat(this._getAllElementOverlaysIn(oRootElement));
		}, this);

		return aElementOverlays;
	};

	function ensureRoot(bIsRoot, oElementOverlay) {
		if (bIsRoot) {
			oElementOverlay.setIsRoot(true);
		}
	}

	/**
	 * @typedef {object} sap.ui.dt.DesignTime.CreateOverlayParameters
	 * @property {sap.ui.base.ManagedObject} element - Control instance for which overlay is being created
	 * @property {boolean} [root="true"] - Proxy for "isRoot" property of sap.ui.dt.ElementOverlay constructor
	 * @property {object} [parentMetadata] - Map with metadata from the parent
	 * @property {boolean} [visible] - Proxy for "visible" property of sap.ui.dt.ElementOverlay constructor
	 * @property {boolean} [isPartOfTemplate] - Marker that overlay is part of template
	 * @private
	 */

	/**
	 * Creates overlay and returns a Promise which is resolved when whole hierarchy is created. If creation
	 * of an overlay is in a process, then same promise object will be returned as after first call.
	 *
	 * @param {sap.ui.base.ManagedObject|CreateOverlayParameters} vArg - Accepts control instance or parameters object
	 * @return {Promise} - resolves with overlay as the only argument for specified Element
	 * @private
	 */
	DesignTime.prototype.createOverlay = function(vArg) {
		// Function can receive an element as the only argument or object with parameters
		const mParams = { ...(isPlainObject(vArg) ? vArg : { element: vArg }) };
		const iTaskId = this._oTaskManager.add({
			type: "createOverlay"
		});

		// 1. Validation
		if (!mParams.element || !ElementUtil.isElementValid(mParams.element)) {
			this._oTaskManager.cancel(iTaskId);
			return this._rejectCreateOverlay(mParams.element);
		}

		const sElementId = mParams.element.getId();
		const oElementOverlay = OverlayRegistry.getOverlay(sElementId);

		// 2. ElementOverlay is already created
		if (oElementOverlay) {
			ensureRoot(mParams.root, oElementOverlay);
			this._oTaskManager.complete(iTaskId);
			return Promise.resolve(oElementOverlay);
		// 3. ElementOverlay is in creation phase
		} else if (sElementId in this._mPendingOverlays) {
			this._oTaskManager.complete(iTaskId);
			return this._mPendingOverlays[sElementId];
		}

		// 4. Create new ElementOverlay
		if (typeof mParams.root === "undefined") {
			mParams.root = true;
		}
		this._mPendingOverlays[sElementId] = this._createElementOverlay(mParams)
		.then(
			// Fulfilled
			function(oElementOverlay) {
				return this._createChildren(oElementOverlay, mParams)
				.then(function() {
					// Remove overlay promise from the map only when it is "officially" available
					// and registered everywhere (OverlayRegistry, Plugins, etc)
					this.attachEventOnce("synced", function() {
						delete this._mPendingOverlays[sElementId];
					}, this);

					// When DesignTime instance was destroyed during overlay creation process
					if (this.bIsDestroyed) {
						// TODO: refactor destroy() logic. See @676 & @788
						oElementOverlay.detachEvent("destroyed", this._onElementOverlayDestroyed, this);
						oElementOverlay.destroy();
						this._oTaskManager.cancel(iTaskId);
						return Promise.reject(Util.createError(
							"DesignTime#createOverlay",
							"while creating overlay, DesignTime instance has been destroyed"
						));
						// When element was destroyed during overlay creation process
					} else if (oElementOverlay.bIsDestroyed) {
						this._oTaskManager.cancel(iTaskId);
						return Promise.reject(Util.createError(
							"DesignTime#createOverlay",
							"while creating children overlays, its parent overlay has been destroyed"
						));
					}

					this._aOverlaysCreatedInLastBatch.push(oElementOverlay);
					this._oTaskManager.complete(iTaskId);
					return oElementOverlay;
				}.bind(this));
			}.bind(this))
		.catch(function(vError) {
			const oError = Util.propagateError(
				vError,
				"DesignTime#createOverlay",
				`Failed attempt to create overlay for element '${sElementId}'`
			);

			// If it crashes by any reason, we must always remove pending Promise, otherwise
			// potential second attempt for creating overlay will not be possible
			delete this._mPendingOverlays[sElementId];

			this._oTaskManager.cancel(iTaskId);

			return Promise.reject(oError);
		}.bind(this));

		return this._mPendingOverlays[sElementId];
	};

	/**
	 * Calculates reasonable rejection reason and returns a rejected Promise with it inside.
	 * @param {sap.ui.base.ManagedObject} [oElement] - Element which doesn't pass the validation
	 * @return {Promise} Rejected promise with detailed error inside.
	 * @private
	 */
	DesignTime.prototype._rejectCreateOverlay = function(oElement) {
		var sReason;

		if (!oElement) {
			sReason = "Cannot create overlay — no element is specified.";
		} else if (oElement.bIsDestroyed) {
			sReason = "Cannot create overlay — the element is already destroyed.";
		} else if (oElement instanceof ManagedObject && !ElementUtil.isElementInTemplate(oElement)) {
			sReason = `Element is in a bound aggregation, but not found in the binding template. Skipping overlay creation for element with id='${oElement.getId()}'. Please report to CA-UI5-FL-RTA component.`;
		} else {
			sReason = `Cannot create overlay without a valid element. Expected a descendant of sap.ui.core.Element or sap.ui.core.Component, but ${Util.getObjectType(oElement)} was given`;
		}

		return Promise.reject(
			Util.createError("DesignTime#createOverlay", sReason)
		);
	};

	DesignTime.prototype._createAggregationOverlay = function(sAggregationName, oElement, mAggregationMetadata, bIsTemplateAggregation) {
		// TODO: Aggregation overlays should be registered at the same time as their ElementOverlays
		// (currently they are registered *before*)
		return new AggregationOverlay({
			aggregationName: sAggregationName,
			element: oElement,
			visible: !bIsTemplateAggregation,
			isPartOfTemplate: bIsTemplateAggregation,
			designTimeMetadata: new AggregationDesignTimeMetadata({
				data: mAggregationMetadata
			}),
			init: function(oEvent) {
				var oAggregationOverlay = oEvent.getSource();
				oAggregationOverlay.attachEvent("destroyed", this._onAggregationOverlayDestroyed, this);
				oAggregationOverlay.attachEvent("applyStylesRequired", this._onApplyStylesRequired, this);
			}.bind(this),
			beforeDestroy: function(oEvent) {
				var oAggregationOverlay = oEvent.getSource();
				OverlayRegistry.deregister(oAggregationOverlay);
				oAggregationOverlay.detachEvent("applyStylesRequired", this._onApplyStylesRequired, this);
			}.bind(this)
		});
	};

	/**
	 * Creates ElementOverlay
	 * @param {object} mParams - Parameter map
	 * @param {sap.ui.core.Element} mParams.element - Element for which ElementOverlay should be created
	 * @param {boolean} [mParams.root] - Proxy for "isRoot" property of sap.ui.dt.ElementOverlay constructor
	 * @param {boolean} [mParams.visible] - Proxy for "visible" property of sap.ui.dt.ElementOverlay constructor
	 * @param {boolean} [mParams.isPartOfTemplate] - Proxy for "isPartOfTemplate" property of sap.ui.dt.ElementOverlay constructor
	 * @param {object} [mParams.parentMetadata] - Map with metadata from the parent
	 * @return {Promise} returns Promise which is resolved when ElementOverlay is created and ready for use
	 * @private
	 */
	DesignTime.prototype._createElementOverlay = function(mParams) {
		var oElement = mParams.element;

		function createElementOverlay(mParameters) {
			return new ElementOverlay(mParameters);
		}

		return new Promise(function(fnResolve, fnReject) {
			createElementOverlay({
				element: oElement,
				isRoot: mParams.root,
				// TODO: check why defaultValue doesn't work if "undefined" specified
				visible: typeof mParams.visible !== "boolean" || mParams.visible,
				isPartOfTemplate: mParams.isPartOfTemplate,
				metadataScope: this.getScope(),
				designTimeMetadata: (
					// If DesignTimeMetadata is an object of ElementDesignTimeMetadata, then it will be set
					// on ElementOverlay and no Metadata will be loaded from the server for this Element.
					this.getDesignTimeMetadataFor(oElement) instanceof ElementDesignTimeMetadata
						? this.getDesignTimeMetadataFor(oElement)
						: _curry(function(mMetadataExtension, mParentMetadata, oElement, mMetadata) {
							mMetadata = merge({}, mMetadata, mMetadataExtension);

							this._mMetadataOriginal = mMetadata;

							// In case of root element we don't have parent to inherit from, thus no mParentMetadata
							if (mParentMetadata) {
								mMetadata = MetadataPropagationUtil.propagateMetadataToElementOverlay(mMetadata, mParentMetadata, oElement);
							}

							return mMetadata;
						})(this.getDesignTimeMetadataFor(oElement), mParams.parentMetadata, oElement)
				),
				init: function(oEvent) {
					var oElementOverlay = oEvent.getSource();
					fnResolve(oEvent.getSource());
					oElementOverlay.attachEvent("destroyed", this._onElementOverlayDestroyed, this);
					oElementOverlay.attachEvent("elementDestroyed", this._onElementDestroyed, this);
					oElementOverlay.attachEvent("selectionChange", this._onElementOverlaySelectionChange, this);
					oElementOverlay.attachEvent("elementModified", this._onElementModified, this);
					oElementOverlay.attachEvent("editableChange", this._onEditableChanged, this);
					oElementOverlay.attachEvent("applyStylesRequired", this._onApplyStylesRequired, this);

					if (ObjectPath.get(["actions", "actionsFromResponsibleElement"], oElementOverlay.getDesignTimeMetadata().getData())) {
						var mConnectedElements = this.getSelectionManager().getConnectedElements();
						var oElement = oElementOverlay.getElement();
						var oResponsibleElement = oElementOverlay.getDesignTimeMetadata().getResponsibleElement(oElement);
						mConnectedElements[oElement.getId()] = oResponsibleElement.getId();
						mConnectedElements[oResponsibleElement.getId()] = oElement.getId();
						this.getSelectionManager().setConnectedElements(mConnectedElements);
					}
				}.bind(this),
				initFailed: function(sElementId, oEvent) {
					var oElementOverlay = oEvent.getSource();
					var oError = Util.propagateError(
						oEvent.getParameter("error"),
						"DesignTime#_createElementOverlay",
						`Error creating overlay (id='${oElementOverlay.getId()}') for '${sElementId}'`
					);

					oElementOverlay.detachEvent("destroyed", this._onElementOverlayDestroyed, this);
					oElementOverlay.detachEvent("elementDestroyed", this._onElementDestroyed, this);
					oElementOverlay.detachEvent("applyStylesRequired", this._onApplyStylesRequired, this);
					oElementOverlay.destroy();

					fnReject(oError);
				}.bind(this, oElement.getId())
			});
		}.bind(this));
	};

	function getAggregationBindingTemplates(oElementOverlay, aAggregationNames) {
		var oElement = oElementOverlay.getElement();
		return aAggregationNames.reduce(function(mTemplateAggregations, sAggregationName) {
			var oTemplate = ElementUtil.getAggregationBindingTemplate(oElement, sAggregationName);
			if (oTemplate) {
				mTemplateAggregations[sAggregationName] = oTemplate;
			}
			return mTemplateAggregations;
		}, {});
	}

	/**
	 * Destroy children of an aggregation binding template.
	 * @param {sap.ui.dt.ElementOverlay} oTargetOverlay - ElementOverlay to destroy children for
	 * @param {string} sAggregationName - Aggregation name
	 */
	DesignTime.prototype._destroyChildrenForAggregationBindingTemplate = function(oTargetOverlay, sAggregationName) {
		const oTemplateRootOverlays = oTargetOverlay.getAggregationBindingTemplateOverlays();
		oTemplateRootOverlays.forEach((oTemplateRootOverlay) => {
			if (oTemplateRootOverlay.getAggregationName() === sAggregationName) {
				oTemplateRootOverlay.destroy();
			}
		});
	};

	/**
	 * Create children of an aggregation binding template. It is called when the aggregation binding
	 * is changed during runtime.
	 * @param {sap.ui.dt.ElementOverlay} oElementOverlay - ElementOverlay to create children for
	 * @returns {Promise} Resolves when whole hierarchy of children for specified ElementOverlay is created
	 * @private
	 */
	DesignTime.prototype._createChildrenForAggregationBindingTemplate = function(oElementOverlay) {
		const aAggregationNames = oElementOverlay.getAggregationNames();
		const mParentAggregationMetadata = oElementOverlay.getDesignTimeMetadata().getData();
		const mAggregationBindingTemplates = getAggregationBindingTemplates(oElementOverlay, aAggregationNames);
		const aTemplateAggregationNames = Object.keys(mAggregationBindingTemplates);

		// Consider each aggregation binding template which is not nested inside an existing template structure as a root template
		// Separate root templates and their children from the instances of the root template as well as all nested template instances
		const bHasTemplateAggregation = !isEmptyObject(mAggregationBindingTemplates);

		return this._createChildrenOverlays(
			oElementOverlay,
			mParentAggregationMetadata,
			aTemplateAggregationNames,
			bHasTemplateAggregation,
			mAggregationBindingTemplates
		);
	};

	/**
	 * Creates children for specified ElementOverlay.
	 * @param {sap.ui.dt.ElementOverlay} oElementOverlay - ElementOverlay to create children for
	 * @param {object} mParams - Property bag
	 * @param {object} [mParams.parentMetadata] - Parent aggregation metadata
	 * @param {boolean} [mParams.isPartOfTemplate] - Whether the overlay is part of an aggregation binding template
	 * @returns {Promise} Resolves when whole hierarchy of children for specified ElementOverlay is created
	 * @private
	 */
	DesignTime.prototype._createChildren = function(oElementOverlay, mParams) {
		var aAggregationNames = oElementOverlay.getAggregationNames();
		var mParentAggregationMetadata = mParams.parentMetadata;
		var mAggregationBindingTemplates = getAggregationBindingTemplates(oElementOverlay, aAggregationNames);
		var aTemplateAggregationNames = Object.keys(mAggregationBindingTemplates);

		// Consider each aggregation binding template which is not nested inside an existing template structure as a root template
		// Separate root templates and their children from the instances of the root template as well as all nested template instances
		var bEncounteredTemplate = mParams.isPartOfTemplate !== undefined;
		var bHasTemplateAggregation = !isEmptyObject(mAggregationBindingTemplates);
		var bIsRootTemplate = bHasTemplateAggregation && !bEncounteredTemplate;
		var bIsPartOfTemplate = bIsRootTemplate ? true : mParams.isPartOfTemplate;
		// Whether cloned instances are nested deeply in the root template structure
		var bIsCloneInsideTemplate = bIsRootTemplate ? false : mParams.isPartOfTemplate;

		// Avoid creating aggregation overlays for cloned template instances inside the template structure
		if (bHasTemplateAggregation && bIsPartOfTemplate && !bIsRootTemplate) {
			aAggregationNames = _difference(aAggregationNames, aTemplateAggregationNames);
		}

		return this._createChildrenOverlays(
			oElementOverlay,
			mParentAggregationMetadata,
			aTemplateAggregationNames,
			bIsPartOfTemplate,
			mAggregationBindingTemplates
		)
		.then(this._createChildrenOverlays.bind(
			this,
			oElementOverlay,
			mParentAggregationMetadata,
			aAggregationNames,
			bIsCloneInsideTemplate
		));
	};

	DesignTime.prototype._createChildrenOverlays = function(
		oElementOverlay,
		mParentAggregationMetadata,
		aAggregationNames,
		bIsPartOfTemplate,
		mAggregationBindingTemplates
	) {
		var bIsTemplateAggregation = !isEmptyObject(mAggregationBindingTemplates);
		// Nested template inside a clone of another template
		if (bIsTemplateAggregation && !bIsPartOfTemplate) {
			return Promise.resolve();
		}
		return Promise.all(
			aAggregationNames.map(function(sAggregationName) {
				var oElement = oElementOverlay.getElement();
				var sElementClassName = oElement.getMetadata().getName();
				var mAggregationMetadata = MetadataPropagationUtil.propagateMetadataToAggregationOverlay(
					oElementOverlay.getDesignTimeMetadata().getAggregation(sAggregationName),
					oElement,
					mParentAggregationMetadata
				);

				var oAggregationOverlay = this._createAggregationOverlay(
					sAggregationName,
					oElement,
					mAggregationMetadata,
					bIsTemplateAggregation
				);
				OverlayRegistry.register(oAggregationOverlay);

				var aChildrenElements;
				if (bIsTemplateAggregation) {
					aChildrenElements = [mAggregationBindingTemplates[sAggregationName]];
				} else {
					aChildrenElements = ElementUtil[oAggregationOverlay.isAssociation() ? "getAssociationInstances" : "getAggregation"](
						oElement,
						sAggregationName
					);
				}

				return Promise.all(
					aChildrenElements.map(function(sParentElementClassName, oChildElement) {
						return this.createOverlay({
							element: oChildElement,
							root: false,
							parentMetadata: mAggregationMetadata,
							isPartOfTemplate: bIsPartOfTemplate
						})
						// If creation of one of the children is aborted, we still continue our execution
						.catch(function(oError) {
							var mError = this._enrichChildCreationError(oError, oChildElement, sParentElementClassName, sAggregationName);
							// Omit error message if the parent was already destroyed
							// e.g. SimpleForm move where many elements are created/destroyed in a row
							if (!oElement.isDestroyed() && !oElementOverlay.isDestroyed()) {
								Log[mError.severity](mError.message);
							}
							return mError.errorObject;
						}.bind(this));
					}.bind(this, sElementClassName))
				).then(function(aChildrenElementOverlays) {
					aChildrenElementOverlays.map(function(oChildElementOverlay) {
						if (
							oChildElementOverlay instanceof ElementOverlay
							&& !oChildElementOverlay.bIsDestroyed
							&& !oChildElementOverlay.getParent()
						) {
							oAggregationOverlay.addChild(oChildElementOverlay, true);
						}
					}, this);
					return oAggregationOverlay;
				}.bind(this));
			}, this)
		).then(function(aAggregationOverlays) {
			aAggregationOverlays.forEach(function(oAggregationOverlay) {
				// Yes, it's possible that during initialization original ElementOverlay dies. TODO: add test case
				if (oElementOverlay.bIsDestroyed) {
					oAggregationOverlay.destroy();
				} else if (bIsTemplateAggregation) {
					oElementOverlay.addAggregationBindingTemplateOverlay(oAggregationOverlay);
				} else {
					oElementOverlay.addChild(oAggregationOverlay, true);
				}
			});
		});
	};

	/**
	 * Enriches the error object, decides on severity and formats the outgoing error text.
	 * @param {Error} oError - Error object
	 * @param {sap.ui.base.ManagedObject} oElement - Element for which the overlay cannot be created
	 * @param {string} sParentElementClassName - Class name of the parent element relatively to oElement
	 * @param {string} sAggregationName - Aggregation name in parent element where oElement is located
	 * @returns {{severity: string, errorObject: Error, message: string}} Error map
	 * @private
	 */
	DesignTime.prototype._enrichChildCreationError = function(oError, oElement, sParentElementClassName, sAggregationName) {
		var sSeverity = "error";
		var sError = Util.errorToString(oError);

		if (oError.message.includes("Cannot create overlay without a valid element")) {
			sSeverity = "warning";
			oError = Util.createError(
				"DesignTime#_createChildren",
				`Child element in aggregation '${sAggregationName}' of ${sParentElementClassName} must be a descendant of sap.ui.core.Element or sap.ui.core.Component, but ${Util.getObjectType(oElement)} was given. Consider ignoring aggregation ${sAggregationName} in the .designtime configuration of the control.`
			);
			sError = oError.toString(); // excluding stack trace
		} else if (oError.message.startsWith("Element is in a bound aggregation")) {
			sSeverity = "error";
			sError = oError.toString(); // excluding stack trace
		}

		return {
			errorObject: oError,
			severity: sSeverity,
			message: sError
		};
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
		Overlay.removeOverlayContainer();
	};

	/**
	 * Handler for destroy event of ElementOverlay
	 * @param {sap.ui.base.Event} oEvent event object
	 * @private
	 */
	DesignTime.prototype._onElementOverlayDestroyed = function(oEvent) {
		// In case of DesignTime instance destroy process we should not react on overlay destroy event
		if (this._bDestroyPending) {
			return;
		}

		var oElementOverlay = oEvent.getSource();

		// cancel open applyStyles tasks for the destroyed overlays in the task manager
		this._oTaskManager.cancelBy({
			type: "applyStyles",
			overlayId: oElementOverlay.getId()
		}, "overlayId");

		// Destroyed Overlays should not be left over in the syncing batch
		this._removeOverlayFromSyncingBatch(oElementOverlay);

		// FIXME: workaround. Overlays should not kill themselves (see ElementOverlay@_onElementDestroyed).
		var sElementId = oElementOverlay.getAssociation("element");
		if (sElementId in this._mPendingOverlays) { // means that the overlay was destroyed during initialization process
			delete this._mPendingOverlays[sElementId];
			return;
		}

		if (!OverlayRegistry.hasOverlays()) {
			Overlay.destroyMutationObserver();
			Overlay.removeOverlayContainer();
		}

		if (oElementOverlay.isSelected()) {
			this.getSelectionManager().remove(oElementOverlay);
		}

		this.fireElementOverlayDestroyed({
			elementOverlay: oElementOverlay
		});
	};

	DesignTime.prototype._onElementDestroyed = function(oEvent) {
		var sElementId = oEvent.getParameter("targetId");

		this.removeRootElement(sElementId);
	};

	/**
	 * Handler for destroy event of AggregationOverlay
	 * @param {sap.ui.base.Event} oEvent event object
	 * @private
	 */
	DesignTime.prototype._onAggregationOverlayDestroyed = function(oEvent) {
		// cancel open applyStyles tasks for the destroyed overlays in the task manager
		this._oTaskManager.cancelBy({
			type: "applyStyles",
			overlayId: oEvent.getSource().getId()
		}, "overlayId");

		if (!OverlayRegistry.hasOverlays()) {
			Overlay.removeOverlayContainer();
		}
	};

	/**
	 * @param {sap.ui.base.Event} oEvent event object
	 * @private
	 */
	DesignTime.prototype._onElementOverlaySelectionChange = function(oEvent) {
		var oElementOverlay = oEvent.getSource();
		var bSelected = oEvent.getParameter("selected");

		if (bSelected) {
			if (this.getSelectionManager().getSelectionMode() === SelectionMode.Multi) {
				this.getSelectionManager().add(oElementOverlay);
			} else {
				this.getSelectionManager().set(oElementOverlay);
			}

			if (!this.getSelectionManager().get().includes(oElementOverlay)) {
				oElementOverlay.setSelected(false);
			}
		} else {
			this.getSelectionManager().remove(oElementOverlay);
		}
	};

	/**
	 * @param {sap.ui.base.Event} oEvent event object
	 * @private
	 */
	DesignTime.prototype._onElementModified = function(oEvent) {
		var oParams = merge({}, oEvent.getParameters());
		var oElementOverlay = oEvent.getSource();
		oParams.type = !oParams.type ? oEvent.getId() : oParams.type;
		switch (oParams.type) {
			case "addOrSetAggregation":
			case "insertAggregation":
				this._onAddAggregation(oParams.value, oParams.target, oParams.name);
				break;
			case "setParent":
				// timeout is needed because UI5 controls & apps can temporary "detach" controls from control tree
				// and add them again later, so the check if the control is detached from root element's tree is delayed
				setTimeout(function() {
					if (!this.bIsDestroyed) {
						this._checkIfOverlayShouldBeDestroyed(oParams.target);
					}
				}.bind(this), 0);
				break;
			case "propertyChanged":
				oParams.id = oEvent.getSource().getId();
				delete oParams.type;
				delete oParams.target;

				if (this.getStatus() === DesignTimeStatus.SYNCING) {
					this.attachEventOnce("synced", oParams, function(...aArgs) {
						if (!oElementOverlay.bIsDestroyed) {
							this.fireElementPropertyChanged(aArgs[1]);
						}
					}, this);
				} else {
					this.fireElementPropertyChanged(oParams);
				}
				break;
			case "bindAggregation":
				this._createChildrenForAggregationBindingTemplate(oElementOverlay);
				break;
			case "unbindAggregation":
				this._destroyChildrenForAggregationBindingTemplate(oElementOverlay, oParams.name);
				break;
			default:
				break;
		}
	};

	/**
	 * @param {sap.ui.base.Event} oEvent event object
	 * @private
	 */
	DesignTime.prototype._onEditableChanged = function(oEvent) {
		var oParams = merge({}, oEvent.getParameters());
		var oElementOverlay = oEvent.getSource();
		oParams.id = oElementOverlay.getId();
		if (this.getStatus() === DesignTimeStatus.SYNCING) {
			this.attachEventOnce("synced", oParams, function(...aArgs) {
				if (!oElementOverlay.bIsDestroyed) {
					this.fireElementOverlayEditableChanged(aArgs[1]);
				}
			}, this);
		} else {
			this.fireElementOverlayEditableChanged(oParams);
		}
	};

	/**
	 * Creates an ElementOverlay (if doesn't exist) and adds it to specified aggregation of the parent
	 * @param {sap.ui.core.Element} oElement - Element which was added
	 * @param {sap.ui.core.Element} oParent - Parent element
	 * @param {string} sAggregationName - Aggregation name
	 * @private
	 */
	DesignTime.prototype._onAddAggregation = function(oElement, oParent, sAggregationName) {
		if (ElementUtil.isElementValid(oElement)) {
			var oParentOverlay = OverlayRegistry.getOverlay(oParent);
			var oParentAggregationOverlay = oParentOverlay && oParentOverlay.getAggregationOverlay(sAggregationName);
			if (!oParentAggregationOverlay) {
				var onElementOverlayCreated = function(oEvent) {
					var oElementOverlay = oEvent.getParameter("elementOverlay");
					if (oElementOverlay.getElement().getId() === oParent.getId()) {
						var oParentAggregationOverlay = oElementOverlay.getAggregationOverlay(sAggregationName);
						this.detachElementOverlayCreated(onElementOverlayCreated, this);
						this._addAggregation(oElement, oParentAggregationOverlay);
					}
				};
				this.attachElementOverlayCreated(onElementOverlayCreated, this);
			} else {
				this._addAggregation(oElement, oParentAggregationOverlay);
			}
		}
	};

	DesignTime.prototype._addAggregation = function(oElement, oParentAggregationOverlay) {
		var oElementOverlay = OverlayRegistry.getOverlay(oElement);

		if (
			!oElementOverlay
			&& oParentAggregationOverlay
			&& oParentAggregationOverlay.getElement()
		) {
			var iTaskId = this._oTaskManager.add({
				type: "createChildOverlay",
				element: oElement
			});
			this.createOverlay({
				element: oElement,
				root: false,
				parentMetadata: oParentAggregationOverlay.getDesignTimeMetadata().getData()
			})
			.then(function(oElementOverlay) {
				var vInsertChildReply = oParentAggregationOverlay.insertChild(null, oElementOverlay);
				if (vInsertChildReply === true) {
					this._oTaskManager.add({
						type: "applyStyles",
						callbackFn: oElementOverlay.applyStyles.bind(oElementOverlay),
						overlayId: oElementOverlay.getId()
					}, "overlayId");

					var iOverlayPosition = oParentAggregationOverlay.indexOfAggregation("children", oElementOverlay);

					// `ElementOverlayAdded` event should be emitted only when overlays are ready to prevent
					// an access to still syncing overlays (e.g. the overlay is still not available in overlay registry
					// at this point and not registered in the plugins).
					this.attachEventOnce("synced", oElementOverlay, function() {
						if (!oElementOverlay.bIsDestroyed) {
							this.fireElementOverlayAdded({
								id: oElementOverlay.getId(),
								targetIndex: iOverlayPosition,
								targetId: oParentAggregationOverlay.getId(),
								targetAggregation: oParentAggregationOverlay.getAggregationName()
							});
						}
					}, this);
				}
				this._oTaskManager.complete(iTaskId);
			}.bind(this))
			.catch(function(sElementId, sAggregationOverlayId, vError) {
				// In case of any crash or rejection the task has to be canceled
				this._oTaskManager.cancel(iTaskId);

				var oError = Util.propagateError(
					vError,
					"DesignTime#_onAddAggregation",
					`Failed to add new element overlay (elementId='${sElementId}') into aggregation overlay (id='${sAggregationOverlayId}')`
				);

				// Omit error message if the element was destroyed during overlay initialisation
				// (e.g. SimpleForm case when multi-removal takes place)
				if (!oElement.bIsDestroyed && !oParentAggregationOverlay.bIsDestroyed) {
					Log.error(Util.errorToString(oError));
				}
			}.bind(this, oElement.getId(), oParentAggregationOverlay.getId()));
		} else {
			// This is necessary when ElementOverlay was created for an Element which is not inside RootElement
			// and which is added to the RootElement later on (LayoutEditor use case). Thus, this ElementOverlay
			// has to be marked as non-root anymore.
			if (
				oElementOverlay
				&& !this._isElementInRootElements(oElementOverlay)
				&& oElementOverlay.isRoot()
			) {
				oElementOverlay.setIsRoot(false);
			}

			if (oParentAggregationOverlay) {
				oParentAggregationOverlay.insertChild(null, oElementOverlay);
			} else {
				Log.error("No parentAggregationOverlay exists during addAggregation");
				return;
			}

			oElementOverlay.setDesignTimeMetadata(
				MetadataPropagationUtil.propagateMetadataToElementOverlay(
					oElementOverlay._mMetadataOriginal,
					oParentAggregationOverlay.getDesignTimeMetadata().getData(),
					oElement
				)
			);

			this.fireElementOverlayMoved({
				id: oElementOverlay.getId(),
				targetIndex: oParentAggregationOverlay.indexOfAggregation("children", oElementOverlay),
				targetId: oParentAggregationOverlay.getId(),
				targetAggregation: oParentAggregationOverlay.getAggregationName()
			});
		}
	};

	/**
	 * @param {sap.ui.core.Element} oElement which was modified
	 * @private
	 */
	DesignTime.prototype._checkIfOverlayShouldBeDestroyed = function(oElement) {
		var oElementOverlay = OverlayRegistry.getOverlay(oElement);
		// Overlays of elements in "dependents" aggregation or not in root elements should be destroyed
		if (
			// element overlays for destroyed elements will be destroyed already,
			// but element might be recreated with the same id, so a new element overlay might exist that shouldn't be removed
			!oElement.bIsDestroyed
			&& oElementOverlay
			&& (!this._isElementInRootElements(oElement) || oElement.sParentAggregationName === "dependents")
		) {
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
			return undefined;
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
	 * @param {boolean} bValue True for enabled
	 * @public
	 */
	DesignTime.prototype.setEnabled = function(bValue) {
		bValue = !!bValue;

		if (this.getEnabled() !== bValue) {
			this.setProperty("enabled", bValue);
			this.fireEnabledChanged({
				value: bValue
			});
		}
	};

	/**
	 * Returns the current status of the designTime instance
	 * @returns {string} DesignTime status
	 * @public
	 */
	DesignTime.prototype.getStatus = function() {
		return this._sStatus;
	};

	return DesignTime;
});