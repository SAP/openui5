/*!
 * ${copyright}
 */

// Provides class sap.ui.rta.plugin.Plugin.
sap.ui.define([
	"sap/base/util/restricted/_debounce",
	"sap/ui/dt/Plugin",
	"sap/ui/fl/write/api/ChangesWriteAPI",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/dt/OverlayUtil",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/rta/util/hasStableId"
], function(
	debounce,
	Plugin,
	ChangesWriteAPI,
	OverlayRegistry,
	OverlayUtil,
	JsControlTreeModifier,
	hasStableId
) {
	"use strict";

	// The ranks define the order of the plugin actions in the context menu
	const CONTEXT_MENU_RANKS = {
		CTX_RENAME: 10,
		CTX_ADD_ELEMENTS_AS_SIBLING: 20,
		CTX_ADD_ELEMENTS_AS_CHILD: 25,
		CTX_ADD_ELEMENTS_CHILD_AND_SIBLING: 30,
		CTX_CREATE_SIBLING_CONTAINER: 40,
		CTX_CREATE_CHILD_CONTAINER: 50,
		CTX_REMOVE: 60,
		CTX_LOCAL_RESET: 65,
		CTX_CUT: 70,
		CTX_PASTE: 80,
		CTX_GROUP_FIELDS: 90,
		CTX_UNGROUP_FIELDS: 100,
		CTX_ADDXML_AT_EXTENSIONPOINT: 105,
		// Settings ranks go up 1 by 1 for each setting
		CTX_SETTINGS: 110,
		// IFrame ranks go up 1 by 1 for each possible child target
		CTX_CREATE_SIBLING_IFRAME: 130,
		// Variant types are mutually exclusive
		CTX_VARIANT_SET_TITLE: 140,
		CTX_COMP_VARIANT_RENAME: 140,
		CTX_VARIANT_SAVE: 150,
		CTX_COMP_VARIANT_SAVE: 150,
		CTX_VARIANT_SAVEAS: 160,
		CTX_COMP_VARIANT_SAVE_AS: 160,
		CTX_VARIANT_MANAGE: 170,
		CTX_COMP_VARIANT_MANAGE: 170,
		CTX_VARIANT_SWITCH_SUBMENU: 180,
		CTX_COMP_VARIANT_SWITCH: 180,
		CTX_COMP_VARIANT_CONTENT: 190
	};

	function _handleEditableByPlugin(mPropertyBag, aPromises, oSourceElementOverlay) {
		// when a control gets destroyed it gets deregistered before it gets removed from the parent aggregation.
		// this means that getElementInstance is undefined when we get here via removeAggregation mutation
		// when an overlay is not registered yet, we should not evaluate editable. In this case getDesignTimeMetadata returns null.
		// in case a control is marked as not adaptable by designTimeMetadata, it should not be possible to evaluate editable
		// for this control due to parent aggregation action definitions

		var oResponsibleElementOverlay = oSourceElementOverlay;
		if (typeof this.getActionName() === "string") {
			if (this.isResponsibleElementActionAvailable(oSourceElementOverlay)) {
				oResponsibleElementOverlay = this.getResponsibleElementOverlay(oSourceElementOverlay);
			}
		}
		var vEditable = oResponsibleElementOverlay.getElement() &&
			oResponsibleElementOverlay.getDesignTimeMetadata() &&
			!oResponsibleElementOverlay.getDesignTimeMetadata().markedAsNotAdaptable() &&
			this._isEditable(
				oResponsibleElementOverlay,
				Object.assign({sourceElementOverlay: oSourceElementOverlay}, mPropertyBag)
			);

		// handle promise return value by _isEditable function
		if (vEditable && typeof vEditable.then === "function") {
			// intentional interruption of the promise chain
			vEditable.then(function(vEditablePromiseValue) {
				this._handleModifyPluginList(oSourceElementOverlay, vEditablePromiseValue);
			}.bind(this));
			aPromises.push(vEditable);
		} else {
			this._handleModifyPluginList(oSourceElementOverlay, vEditable);
		}
		return aPromises;
	}

	/**
	 * Constructor for a new Plugin.
	 *
	 * @param {string} [sId] id for the new object, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new object
	 *
	 * @class
	 * The Plugin allows to handle the overlays and aggregation overlays from the DesignTime
	 * The Plugin should be overridden by the real plugin implementations, which define some actions through events attached to an overlays
	 * @extends sap.ui.dt.Plugin
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.46
	 * @alias sap.ui.rta.plugin.Plugin
	 */

	var BasePlugin = Plugin.extend("sap.ui.rta.plugin.Plugin", /** @lends sap.ui.dt.Plugin.prototype */ {
		metadata: {
			"abstract": true,
			library: "sap.ui.rta",
			properties: {
				commandFactory: {
					type: "object",
					multiple: false
				}
			},
			events: {
				elementModified: {
					command: {
						type: "sap.ui.rta.command.BaseCommand"
					}
				}
			}
		}
	});

	/**
	 * This function needs to be overwritten in every plugin.
	 */
	BasePlugin.prototype._isEditable = function() {};

	BasePlugin.prototype.executeWhenVisible = function(oElementOverlay, fnCallback) {
		var fnGeometryChangedCallback = function(oEvent) {
			if (oEvent.getSource().getGeometry() && oEvent.getSource().getGeometry().visible) {
				oElementOverlay.detachEvent("geometryChanged", fnGeometryChangedCallback, this);
				fnCallback();
			}
		};

		var mOverlayGeometry = oElementOverlay.getGeometry();
		if (
			oElementOverlay.getElementVisibility()
			&& (
				!mOverlayGeometry
				|| !mOverlayGeometry.visible
			)
		) {
			oElementOverlay.attachEvent("geometryChanged", fnGeometryChangedCallback, this);
		} else {
			fnCallback();
		}
	};

	function debounceFunction(mDebounceFunctions, oOverlay, sName, fnOriginalFunction) {
		// Create debounced function for the given parameters if it was not created before
		var sOverlayId = oOverlay.getId();
		mDebounceFunctions[sOverlayId] ||= {};
		// Debounce with approximately one frame to cover multiple synchronous calls
		// without causing a huge delay
		mDebounceFunctions[sOverlayId][sName] ||= debounce(fnOriginalFunction, 16);
		// Execute the function
		mDebounceFunctions[sOverlayId][sName]();
	}

	var _onElementModified = function(oEvent) {
		// Initialize here because plugins may not extend the rta.Plugin and
		// instead inherit the method via rta.Utils.extendWith
		// Therefore the constructor/init might not be properly called
		// eslint-disable-next-line logical-assignment-operators
		if (!this._mDebounceFunctions) {
			// The _onElementModified callback might be triggered many times in a row, e.g.
			// by SimpleForms which add all aggregation items one by one
			// Since the resulting editable checks in the plugins can be expensive async functions
			// the calls are debounced
			this._mDebounceFunctions = {
				// Make sure that all closure variables of the debounced function
				// are part of the map key:
				// [overlayId][oEvent.getParameters().name]: function
				insertOrRemove: {},
				addOrSet: {}
			};
		}

		var oParams = oEvent.getParameters();
		var aRelevantOverlays;
		var oOverlay = oEvent.getSource();
		if (oParams.type === "propertyChanged" && oParams.name === "visible") {
			aRelevantOverlays = this._getRelevantOverlays(oOverlay);
			if (oParams.value === true) {
				this.executeWhenVisible(oOverlay, function() {
					this.evaluateEditable(aRelevantOverlays, {onRegistration: false});
				}.bind(this));
			} else {
				this.evaluateEditable(aRelevantOverlays, {onRegistration: false});
			}
		} else if (oParams.type === "afterRendering") {
			if (this.getDesignTime().getStatus() === "synced") {
				this.evaluateEditable([oOverlay], {onRegistration: false});
			} else {
				this.getDesignTime().attachEventOnce("synced", function() {
					this.evaluateEditable([oOverlay], {onRegistration: false});
				}, this);
			}
		} else if (
			oParams.type === "insertAggregation"
			|| oParams.type === "removeAggregation"
		) {
			debounceFunction(this._mDebounceFunctions.insertOrRemove, oOverlay, oParams.name, function() {
				aRelevantOverlays = this._getRelevantOverlays(oOverlay, oParams.name);
				this.evaluateEditable(aRelevantOverlays, {onRegistration: false});
			}.bind(this));
		} else if (oParams.type === "addOrSetAggregation") {
			debounceFunction(this._mDebounceFunctions.addOrSet, oOverlay, oParams.name, function() {
				// Designtime might have been destroyed while waiting for the debounce callback
				// In this case, the updates are no longer relevant
				var oDesignTime = this.getDesignTime();
				if (!oDesignTime) {
					return;
				}

				if (oDesignTime.getStatus() === "synced") {
					aRelevantOverlays = this._getRelevantOverlays(oOverlay, oParams.name);
					this.evaluateEditable(aRelevantOverlays, {onRegistration: false});
				} else {
					oDesignTime.attachEventOnce("synced", function() {
						aRelevantOverlays = this._getRelevantOverlays(oOverlay, oParams.name);
						this.evaluateEditable(aRelevantOverlays, {onRegistration: false});
					}, this);
				}
			}.bind(this));
		}
	};

	BasePlugin.prototype._getRelevantOverlays = function(oOverlay, sAggregationName) {
		var aAlreadyDefinedRelevantOverlays = oOverlay.getRelevantOverlays();
		if (aAlreadyDefinedRelevantOverlays.length === 0) {
			var aRelevantOverlays = [];
			// Overlays in aggregation binding templates are not relevant
			if (!oOverlay.getIsPartOfTemplate()) {
				aRelevantOverlays = OverlayUtil.findAllOverlaysInContainer(oOverlay);

				// if an aggregation name is given, those overlays are added without checking the relevant container
				if (sAggregationName) {
					var oAggregationOverlay = oOverlay.getAggregationOverlay(sAggregationName);
					var aAggregationChildren = oAggregationOverlay ? oAggregationOverlay.getChildren() : [];
					aAggregationChildren = aAggregationChildren.filter(function(oChildOverlay) {
						return aRelevantOverlays.indexOf(oChildOverlay) === -1;
					});
					aRelevantOverlays = aRelevantOverlays.concat(aAggregationChildren);
				}
			}

			oOverlay.setRelevantOverlays(aRelevantOverlays);
			return aRelevantOverlays;
		}
		return aAlreadyDefinedRelevantOverlays;
	};

	/**
	 * Checks if the overlay has an associated element and calls the _isEditable function.
	 * If there is an associated element it also modifies the plugin list.
	 * @param {sap.ui.dt.ElementOverlay[]} aOverlays Array of overlays to be checked
	 * @param {object} mPropertyBag Map of additional information to be passed to isEditable
	 */
	BasePlugin.prototype.evaluateEditable = async function(aOverlays, mPropertyBag) {
		// If there are busy plugins, do not evaluate
		// When the action is finished, if the affected controls are modified, the evaluation will be done anyway
		if (!mPropertyBag.onRegistration &&
			this.getDesignTime() &&
			this.getDesignTime().getBusyPlugins().length) {
			return;
		}
		this.setProcessingStatus(true);

		var aPromises = aOverlays.reduce(_handleEditableByPlugin.bind(this, mPropertyBag), []);

		if (aPromises.length) {
			try {
				await Promise.all(aPromises);
				this.setProcessingStatus(false);
			} catch (error) {
				this.setProcessingStatus(false);
			}
		} else {
			this.setProcessingStatus(false);
		}
	};

	BasePlugin.prototype._handleModifyPluginList = function(oOverlay, vEditable) {
		// for the createContainer and additionalElements plugin the isEditable function returns an object with 2 properties, asChild and asSibling.
		// for every other plugin isEditable should be a boolean.
		if (vEditable !== undefined && vEditable !== null) {
			if (typeof vEditable === "boolean") {
				this._modifyPluginList(oOverlay, vEditable);
			} else {
				this._modifyPluginList(oOverlay, vEditable.asChild, false);
				this._modifyPluginList(oOverlay, vEditable.asSibling, true);
			}
		}
	};

	BasePlugin.prototype._modifyPluginList = function(oOverlay, bIsEditable, bOverlayIsSibling) {
		if (bIsEditable) {
			this.addToPluginsList(oOverlay, bOverlayIsSibling);
		} else {
			this.removeFromPluginsList(oOverlay, bOverlayIsSibling);
		}
	};

	BasePlugin.prototype._retrievePluginName = function(bSibling) {
		var sName = this.getMetadata().getName();
		if (bSibling !== undefined) {
			sName += bSibling ? ".asSibling" : ".asChild";
		}
		return sName;
	};

	BasePlugin.prototype._isEditableByPlugin = function(oOverlay, bSibling) {
		var sPluginName = this._retrievePluginName(bSibling);
		return oOverlay.getEditableByPlugins()[sPluginName];
	};

	BasePlugin.prototype.registerElementOverlay = function(oOverlay) {
		this.executeWhenVisible(oOverlay, function() {
			this.evaluateEditable([oOverlay], {onRegistration: true});
			oOverlay.attachElementModified(_onElementModified, this);
		}.bind(this));
	};

	BasePlugin.prototype.deregisterElementOverlay = function(oOverlay) {
		this.removeFromPluginsList(oOverlay);
		this.removeFromPluginsList(oOverlay, true);
		this.removeFromPluginsList(oOverlay, false);
		oOverlay.detachElementModified(_onElementModified, this);
	};

	/**
	 * Checks if the element of an overlay has a stable ID.
	 * Keeps this information on the Overlay, as stable IDs cannot be modified in runtime.
	 * @param  {sap.ui.dt.ElementOverlay}  oOverlay Overlay for the element to be checked
	 * @return {boolean} Returns true if the element has a stable ID
	 */
	BasePlugin.prototype.hasStableId = function(oOverlay) {
		return hasStableId(oOverlay);
	};

	BasePlugin.prototype.getVariantManagementReference = function(oOverlay) {
		var sVariantManagementReference;
		if (oOverlay.getVariantManagement) {
			sVariantManagementReference = oOverlay.getVariantManagement();
		}
		return sVariantManagementReference;
	};

	/**
	 * Checks the Aggregations on the Overlay for a specific Action
	 * @param {sap.ui.dt.ElementOverlay} oOverlay Overlay to be checked for action
	 * @param {string} sAction Action to be checked
	 * @param {string} [sParentAggregationName] The aggregation in the parent where the element is
	 * @param {string} [sSubAction] Sub action
	 * @return {boolean} Whether the Aggregation has a valid action
	 * @protected
	 */
	BasePlugin.prototype.checkAggregationsOnSelf = function(oOverlay, sAction, sParentAggregationName, sSubAction) {
		var oDesignTimeMetadata = oOverlay.getDesignTimeMetadata();
		var oElement = oOverlay.getElement();

		var aActionData = oDesignTimeMetadata.getActionDataFromAggregations(sAction, oElement, undefined, sSubAction);
		var oAction = aActionData.filter(function(oActionData) {
			if (oActionData && sParentAggregationName) {
				return oActionData.aggregation === sParentAggregationName;
			}
			return true;
		})[0];
		var sChangeType = oAction ? oAction.changeType : null;
		var bChangeOnRelevantContainer = oAction && oAction.changeOnRelevantContainer;
		if (bChangeOnRelevantContainer) {
			oElement = oOverlay.getRelevantContainer();
			var oRelevantOverlay = OverlayRegistry.getOverlay(oElement);
			if (!this.hasStableId(oRelevantOverlay)) {
				return Promise.resolve(false);
			}
		}

		if (sChangeType) {
			return this.hasChangeHandler(sChangeType, oElement);
		}
		return Promise.resolve(false);
	};

	BasePlugin.prototype.removeFromPluginsList = function(oOverlay, bSibling) {
		const sName = this._retrievePluginName(bSibling);
		const mEditableByPlugins = oOverlay.getEditableByPlugins();
		oOverlay.setEditableByPlugins({
			...mEditableByPlugins,
			[sName]: false
		});

		// If there are no more plugins registered on the overlay, set editable to false
		if (!Object.values(oOverlay.getEditableByPlugins()).some(Boolean)) {
			oOverlay.setEditable(false);
		}
	};

	BasePlugin.prototype.addToPluginsList = function(oOverlay, bSibling) {
		const sName = this._retrievePluginName(bSibling);
		const mEditableByPlugins = oOverlay.getEditableByPlugins();
		if (!mEditableByPlugins[sName]) {
			oOverlay.setEditableByPlugins({
				...mEditableByPlugins,
				[sName]: true
			});
			oOverlay.setEditable(true);
		}
	};

	BasePlugin.prototype.hasChangeHandler = function(sChangeType, oElement, sControlType) {
		return ChangesWriteAPI.getChangeHandler({
			changeType: sChangeType,
			element: oElement,
			modifier: JsControlTreeModifier,
			layer: this.getCommandFactory().getFlexSettings().layer,
			controlType: sControlType
		})
		.then(function() {
			return true;
		})
		.catch(function() {
			return false;
		});
	};

	BasePlugin.prototype.isAvailable = function(aElementOverlays) {
		return aElementOverlays.every(function(oElementOverlay) {
			return this._isEditableByPlugin(oElementOverlay);
		}, this);
	};

	BasePlugin.prototype._checkRelevantContainerStableID = function(oAction, oElementOverlay) {
		if (oAction.changeOnRelevantContainer) {
			var oRelevantContainer = oElementOverlay.getRelevantContainer();
			var oRelevantOverlay = OverlayRegistry.getOverlay(oRelevantContainer);
			if (!this.hasStableId(oRelevantOverlay)) {
				return false;
			}
		}
		return true;
	};

	BasePlugin.prototype._checkChangeHandlerAndStableId = function(oElementOverlay) {
		var oAction = this.getAction(oElementOverlay);
		if (oAction && oAction.changeType) {
			var oElement = oAction.changeOnRelevantContainer ?
				oElementOverlay.getRelevantContainer() :
				oElementOverlay.getElement();

			return this.hasChangeHandler(oAction.changeType, oElement)
			.then(function(bHasChangeHandler) {
				return bHasChangeHandler
						&& this._checkRelevantContainerStableID(oAction, oElementOverlay)
						&& this.hasStableId(oElementOverlay);
			}.bind(this));
		}
		return Promise.resolve(false);
	};

	/**
	 * Returns the rank (order) of the plugin action in the context menu.
	 * @param {string} sPluginId Plugin ID
	 * @return {number} Rank of the plugin action
	 */
	BasePlugin.prototype.getRank = function(sPluginId) {
		return CONTEXT_MENU_RANKS[sPluginId];
	};

	/**
	 * Generic function to return the menu items for a context menu.
	 * Retrieves the rank and then calls the method from the DT Plugin.
	 * @param {sap.ui.dt.ElementOverlay[]} aElementOverlays - Target overlays
	 * @param {object} mPropertyBag Additional properties for the menu item
	 * @param {string} mPropertyBag.pluginId The ID of the plugin
	 * @param {string} mPropertyBag.icon an icon for the Button inside the context menu
	 * @param {string} mPropertyBag.group A group for buttons which should be grouped together in the MiniMenu
	 * @param {number} [mPropertyBag.rank] The rank (order) of the plugin action in the context menu
	 * @return {object[]} Returns an array with the object containing the required data for a context menu item
	 */
	BasePlugin.prototype._getMenuItems = function(aElementOverlays, mPropertyBag) {
		mPropertyBag.rank ||= this.getRank(mPropertyBag.pluginId);
		return Plugin.prototype._getMenuItems.apply(this, [aElementOverlays, mPropertyBag]);
	};

	return BasePlugin;
});