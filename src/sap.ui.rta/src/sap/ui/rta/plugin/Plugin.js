/*!
 * ${copyright}
 */

// Provides class sap.ui.rta.plugin.Plugin.
sap.ui.define([
	'sap/ui/dt/Plugin',
	'sap/ui/fl/Utils',
	'sap/ui/fl/registry/ChangeRegistry',
	'sap/ui/dt/OverlayRegistry',
	'sap/ui/dt/OverlayUtil',
	'sap/ui/dt/ElementOverlay',
	'sap/ui/fl/changeHandler/JsControlTreeModifier'
],
function(
	Plugin,
	FlexUtils,
	ChangeRegistry,
	OverlayRegistry,
	OverlayUtil,
	ElementOverlay,
	JsControlTreeModifier
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
	 * The Plugin should be overriden by the real plugin implementations, which define some actions through events attached to an overlays
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

	/* Methods to save stable ID info on Overlay */
	ElementOverlay.prototype._bElementHasStableId = undefined;
	ElementOverlay.prototype.getElementHasStableId = function() { return this._bElementHasStableId;};
	ElementOverlay.prototype.setElementHasStableId = function(bHasStableId) { this._bElementHasStableId = bHasStableId; };
	ElementOverlay.prototype.hasElementStableId = function() { return this._bElementHasStableId ? true : false; };

	var BasePlugin = Plugin.extend("sap.ui.rta.plugin.Plugin", /** @lends sap.ui.dt.Plugin.prototype */ {
		metadata : {
			"abstract" : true,
			// ---- object ----

			// ---- control specific ----
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
	BasePlugin.prototype._isEditable = function() {};

	var _onElementModified = function(oEvent) {
		var oParams = oEvent.getParameters();
		var aRelevantOverlays;
		var oOverlay = sap.ui.getCore().byId(oParams.id);
		if ((oParams.type === "propertyChanged" && oParams.name === "visible")) {
			aRelevantOverlays = this._getRelevantOverlays(oOverlay);
			this.evaluateEditable(aRelevantOverlays, {onRegistration: false});
		} else if (oParams.type === "overlayRendered") {
			this.evaluateEditable([oOverlay], {onRegistration: true});
		} else if (oParams.type === "insertAggregation" || oParams.type === "removeAggregation") {
			aRelevantOverlays = this._getRelevantOverlays(oOverlay, oParams.name);
			this.evaluateEditable(aRelevantOverlays, {onRegistration: false});
		}
	};

	BasePlugin.prototype._detachReevaluationEditable = function(oOverlay) {
		oOverlay.detachElementModified(_onElementModified, this);
	};

	BasePlugin.prototype._attachReevaluationEditable = function(oOverlay) {
		var fnGeometryChangedCallback = function(oEvent) {
			if (oEvent.getSource().getGeometry() && oEvent.getSource().getGeometry().visible) {
				this.evaluateEditable([oOverlay], {onRegistration: true});
				oOverlay.detachEvent('geometryChanged', fnGeometryChangedCallback, this);
			}
		};

		oOverlay.attachElementModified(_onElementModified, this);

		// the control can be set to visible, but still the control has no size when we do the check.
		// that's why we also attach go 'geometryChanged' and check if the overlay has a size
		if (!oOverlay.getElement().getDomRef()) {
			oOverlay.attachEvent('geometryChanged', fnGeometryChangedCallback, this);
		}
	};

	BasePlugin.prototype._getRelevantOverlays = function(oOverlay, sAggregationName) {
		var aAlreadyDefinedRelevantOverlays = oOverlay.getRelevantOverlays();
		if (aAlreadyDefinedRelevantOverlays.length === 0) {
			var aRelevantOverlays = OverlayUtil.findAllOverlaysInContainer(oOverlay);

			// if an aggregation name is given, those overlays are added without checking the relevant container
			if (sAggregationName) {
				var aAggregationChildren = oOverlay.getAggregationOverlay(sAggregationName).getChildren();
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
		var vEditable;
		aOverlays.forEach(function(oOverlay) {
			var oElement = oOverlay.getElement();
			if (oElement && OverlayUtil.isInAggregationBinding(oOverlay, oElement.sParentAggregationName)) {
				vEditable = false;
			} else {
				// when a control gets destroyed it gets deregistered before it gets removed from the parent aggregation.
				// this means that getElementInstance is undefined when we get here via removeAggregation mutation
				// when an overlay is not registered yet, we should not evaluate editable. In this case getDesignTimeMetadata returns null.
				vEditable = oElement && oOverlay.getDesignTimeMetadata() && this._isEditable(oOverlay, mPropertyBag);
			}
			// for the createContainer and additionalElements plugin the isEditable function returns an object with 2 properties, asChild and asSibling.
			// for every other plugin isEditable should be a boolean.
			if (vEditable !== undefined && vEditable !== null) {
				if (typeof vEditable === "boolean") {
					this._modifyPluginList(oOverlay, vEditable);
				} else {
					this._modifyPluginList(oOverlay, vEditable["asChild"], false);
					this._modifyPluginList(oOverlay, vEditable["asSibling"], true);
				}
			}
		}.bind(this));
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
		var aPluginList = oOverlay.getEditableByPlugins();
		return aPluginList.indexOf(sPluginName) > -1;
	};

	BasePlugin.prototype.registerElementOverlay = function(oOverlay) {
		this.evaluateEditable([oOverlay], {onRegistration: true});
		this._attachReevaluationEditable(oOverlay);
	};

	BasePlugin.prototype.deregisterElementOverlay = function(oOverlay) {
		this.removeFromPluginsList(oOverlay);
		this.removeFromPluginsList(oOverlay, true);
		this.removeFromPluginsList(oOverlay, false);
		this._detachReevaluationEditable(oOverlay);
	};

	/**
	 * Checks if the element of an overlay has a stable ID.
	 * Keeps this information on the Overlay, as stable IDs cannot be modified in runtime.
	 * @param  {sap.ui.dt.ElementOverlay}  oOverlay Overlay for the element to be checked
	 * @return {boolean} Returns true if the element has a stable ID
	 */
	BasePlugin.prototype.hasStableId = function(oOverlay) {
		if (!oOverlay) {
			return false;
		}

		// without DesignTimeMetadata the Overlay was not registered yet.
		if (!oOverlay.getDesignTimeMetadata()) {
			return false;
		}

		if (oOverlay.getElementHasStableId() === undefined){
			var bStable = false;
			var oElement = oOverlay.getElement();
			var oDesignTimeMetadata = oOverlay.getDesignTimeMetadata();
			var fnGetStableElements = oDesignTimeMetadata && oDesignTimeMetadata.getData().getStableElements;
			if (fnGetStableElements){
				var aStableElements = fnGetStableElements(oElement);
				var bUnstable = aStableElements ? aStableElements.some(function(vStableElement) {
					var oControl = vStableElement.id || vStableElement;
					if (!FlexUtils.checkControlId(oControl, vStableElement.appComponent)) {
						return true;
					}
				}) : true;
				bStable = !bUnstable;
			} else {
				bStable = FlexUtils.checkControlId(oElement);
			}

			oOverlay.setElementHasStableId(bStable);
		}
		return oOverlay.hasElementStableId();
	};

	BasePlugin.prototype.getVariantManagementReference = function (oOverlay, oAction, bForceRelevantContainer, oStashedElement) {
		var oElement;
		if (!oStashedElement) {
			oElement = oOverlay.getElement();
		} else {
			oElement = oStashedElement;
		}

		var oRelevantElement;
		if ((oAction.changeOnRelevantContainer || bForceRelevantContainer) && !oStashedElement) {
			oRelevantElement = oOverlay.getRelevantContainer();
		} else {
			oRelevantElement = oElement;
		}

		var sVariantManagementReference;
		if (oOverlay.getVariantManagement && this._hasVariantChangeHandler(oAction.changeType, oRelevantElement)) {
			sVariantManagementReference = oOverlay.getVariantManagement();
		}
		return sVariantManagementReference;
	};

	BasePlugin.prototype._hasVariantChangeHandler = function (sChangeType, oElement){
		var oChangeHandler = this._getChangeHandler(sChangeType, oElement);
		return (oChangeHandler && oChangeHandler.revertChange);
	};

	/**
	 * Checks the Aggregations on the Overlay for a specific Action
	 * @param {sap.ui.dt.ElementOverlay} oOverlay overlay to be checked for action
	 * @param {string} sAction action to be checked
	 * @return {boolean} whether the Aggregation has a valid Action
	 * @protected
	 */
	BasePlugin.prototype.checkAggregationsOnSelf = function (oOverlay, sAction) {
		var oDesignTimeMetadata = oOverlay.getDesignTimeMetadata();
		var oElement = oOverlay.getElement();
		var bIsEditable = false;

		var oAction = oDesignTimeMetadata.getActionDataFromAggregations(sAction, oOverlay.getElement())[0];
		var sChangeType = oAction ? oAction.changeType : null;
		var bChangeOnRelevantContainer = oAction && oAction.changeOnRelevantContainer;
		if (bChangeOnRelevantContainer) {
			oElement = oOverlay.getRelevantContainer();
		}

		if (sChangeType && this.hasChangeHandler(sChangeType, oElement)) {
			bIsEditable = true;
		}

		return bIsEditable;
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

	BasePlugin.prototype.hasChangeHandler = function(sChangeType, oElement) {
		return !!this._getChangeHandler(sChangeType, oElement);
	};

	BasePlugin.prototype._getChangeHandler = function(sChangeType, oElement, sControlType) {
		if (!sControlType){
			sControlType = oElement.getMetadata().getName();
		}
		var sLayer = this.getCommandFactory().getFlexSettings().layer;
		return ChangeRegistry.getInstance().getChangeHandler(sChangeType, sControlType, oElement, JsControlTreeModifier, sLayer);
	};

	return BasePlugin;

}, /* bExport= */ true);