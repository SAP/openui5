/*!
 * ${copyright}
 */

// Provides class sap.ui.rta.plugin.Plugin.
sap.ui.define([
	"sap/ui/dt/Plugin",
	"sap/ui/fl/registry/ChangeRegistry",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/dt/OverlayUtil",
	"sap/ui/fl/changeHandler/JsControlTreeModifier",
	"sap/ui/rta/util/hasStableId"
],
function(
	Plugin,
	ChangeRegistry,
	OverlayRegistry,
	OverlayUtil,
	JsControlTreeModifier,
	hasStableId
) {
	"use strict";

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
	 * @experimental Since 1.46. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */

	var BasePlugin = Plugin.extend("sap.ui.rta.plugin.Plugin", /** @lends sap.ui.dt.Plugin.prototype */ {
		metadata : {
			"abstract" : true,
			library : "sap.ui.rta",
			properties : {
				commandFactory : {
					type : "object",
					multiple : false
				}
			},
			events : {
				elementModified : {
					command : {
						type : "sap.ui.rta.command.BaseCommand"
					}
				}
			}
		}
	});

	/**
	 * This function needs to be overwritten in every plugin.
	 */
	BasePlugin.prototype._isEditable = function () {};

	BasePlugin.prototype.executeWhenVisible = function (oElementOverlay, fnCallback) {
		var fnGeometryChangedCallback = function (oEvent) {
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

	var _onElementModified = function (oEvent) {
		var oParams = oEvent.getParameters();
		var aRelevantOverlays;
		var oOverlay = oEvent.getSource();
		if (oParams.type === "propertyChanged" && oParams.name === "visible") {
			aRelevantOverlays = this._getRelevantOverlays(oOverlay);
			if (oParams.value === true) {
				this.executeWhenVisible(oOverlay, function () {
					this.evaluateEditable(aRelevantOverlays, {onRegistration: false});
				}.bind(this));
			} else {
				this.evaluateEditable(aRelevantOverlays, {onRegistration: false});
			}
		} else if (oParams.type === "afterRendering") {
			if (this.getDesignTime().getStatus() === "synced") {
				this.evaluateEditable([oOverlay], {onRegistration: false});
			} else {
				this.getDesignTime().attachEventOnce("synced", function () {
					this.evaluateEditable([oOverlay], {onRegistration: false});
				}, this);
			}
		} else if (
			oParams.type === "insertAggregation"
			|| oParams.type === "removeAggregation"
		) {
			aRelevantOverlays = this._getRelevantOverlays(oOverlay, oParams.name);
			this.evaluateEditable(aRelevantOverlays, {onRegistration: false});
		} else if (oParams.type === "addOrSetAggregation") {
			if (this.getDesignTime().getStatus() === "synced") {
				aRelevantOverlays = this._getRelevantOverlays(oOverlay, oParams.name);
				this.evaluateEditable(aRelevantOverlays, {onRegistration: false});
			} else {
				this.getDesignTime().attachEventOnce("synced", function () {
					aRelevantOverlays = this._getRelevantOverlays(oOverlay, oParams.name);
					this.evaluateEditable(aRelevantOverlays, {onRegistration: false});
				}, this);
			}
		}
	};

	BasePlugin.prototype._getRelevantOverlays = function(oOverlay, sAggregationName) {
		var aAlreadyDefinedRelevantOverlays = oOverlay.getRelevantOverlays();
		if (aAlreadyDefinedRelevantOverlays.length === 0) {
			var aRelevantOverlays = OverlayUtil.findAllOverlaysInContainer(oOverlay);

			// if an aggregation name is given, those overlays are added without checking the relevant container
			if (sAggregationName) {
				var oAggregationOverlay = oOverlay.getAggregationOverlay(sAggregationName);
				var aAggregationChildren = oAggregationOverlay ? oAggregationOverlay.getChildren() : [];
				aAggregationChildren = aAggregationChildren.filter(function(oChildOverlay) {
					return aRelevantOverlays.indexOf(oChildOverlay) === -1;
				});
				aRelevantOverlays = aRelevantOverlays.concat(aAggregationChildren);
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
	BasePlugin.prototype.evaluateEditable = function(aOverlays, mPropertyBag) {
		var aPromises = [];
		// If there are busy plugins, do not evaluate
		// When the action is finished, if the affected controls are modified, the evaluation will be done anyway
		if (!mPropertyBag.onRegistration &&
			this.getDesignTime() &&
			this.getDesignTime().getBusyPlugins().length) {
			return;
		}
		this.setProcessingStatus(true);

		aOverlays.forEach(function(oOverlay) {
			// when a control gets destroyed it gets deregistered before it gets removed from the parent aggregation.
			// this means that getElementInstance is undefined when we get here via removeAggregation mutation
			// when an overlay is not registered yet, we should not evaluate editable. In this case getDesignTimeMetadata returns null.
			// in case a control is marked as not adaptable by designTimeMetadata, it should not be possible to evaluate editable
			// for this control due to parent aggregation action definitions
			var vEditable =
				oOverlay.getElement() &&
				oOverlay.getDesignTimeMetadata() &&
				!oOverlay.getDesignTimeMetadata().markedAsNotAdaptable() &&
				this._isEditable(oOverlay, mPropertyBag);

			// handle promise return value by _isEditable function
			if (vEditable && typeof vEditable.then === "function") {
				// intentional interruption of the promise chain
				vEditable.then(function(vEditablePromiseValue) {
					this._handleModifyPluginList(oOverlay, vEditablePromiseValue);
				}.bind(this));
				aPromises.push(vEditable);
			} else {
				this._handleModifyPluginList(oOverlay, vEditable);
			}
		}.bind(this));

		if (aPromises.length) {
			Promise.all(aPromises)
			.then(function() {
				this.setProcessingStatus(false);
			}.bind(this))
			.catch(function() {
				this.setProcessingStatus(false);
			}.bind(this));
		} else {
			this.setProcessingStatus(false);
		}
	};

	BasePlugin.prototype._handleModifyPluginList = function (oOverlay, vEditable) {
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

	BasePlugin.prototype._isEditableByPlugin = function (oOverlay, bSibling) {
		var sPluginName = this._retrievePluginName(bSibling);
		var aPluginList = oOverlay.getEditableByPlugins();
		return aPluginList.indexOf(sPluginName) > -1;
	};

	BasePlugin.prototype.registerElementOverlay = function(oOverlay) {
		this.executeWhenVisible(oOverlay, function () {
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

	BasePlugin.prototype.getVariantManagementReference = function (oOverlay) {
		var sVariantManagementReference;
		if (oOverlay.getVariantManagement) {
			sVariantManagementReference = oOverlay.getVariantManagement();
		}
		return sVariantManagementReference;
	};

	/**
	 * Checks the Aggregations on the Overlay for a specific Action
	 * @param {sap.ui.dt.ElementOverlay} oOverlay overlay to be checked for action
	 * @param {string} sAction action to be checked
	 * @param {string} [sParentAggregationName] the aggregation in the parent where the element is
	 * @return {boolean} whether the Aggregation has a valid Action
	 * @protected
	 */
	BasePlugin.prototype.checkAggregationsOnSelf = function (oOverlay, sAction, sParentAggregationName) {
		var oDesignTimeMetadata = oOverlay.getDesignTimeMetadata();
		var oElement = oOverlay.getElement();

		var aActionData = oDesignTimeMetadata.getActionDataFromAggregations(sAction, oOverlay.getElement());
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
		var sName = this._retrievePluginName(bSibling);
		oOverlay.removeEditableByPlugin(sName);
		if (!oOverlay.getEditableByPlugins().length) {
			oOverlay.setEditable(false);
		}
	};

	BasePlugin.prototype.addToPluginsList = function(oOverlay, bSibling) {
		var sName = this._retrievePluginName(bSibling);
		var aPluginList = oOverlay.getEditableByPlugins();
		if (aPluginList.indexOf(sName) === -1) {
			oOverlay.addEditableByPlugin(sName);
			oOverlay.setEditable(true);
		}
	};

	BasePlugin.prototype.hasChangeHandler = function(sChangeType, oElement, sControlType) {
		sControlType = sControlType || oElement.getMetadata().getName();
		var sLayer = this.getCommandFactory().getFlexSettings().layer;

		return ChangeRegistry.getInstance().getChangeHandler(sChangeType, sControlType, oElement, JsControlTreeModifier, sLayer)
		.then(function() {
			return true;
		})
		.catch(function() {
			return false;
		});
	};

	BasePlugin.prototype.isAvailable = function (aElementOverlays) {
		return aElementOverlays.every(function (oElementOverlay) {
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

	return BasePlugin;
});