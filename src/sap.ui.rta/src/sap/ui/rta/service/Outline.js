/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/dt/ElementOverlay",
	"sap/ui/dt/AggregationOverlay",
	"sap/ui/dt/Util",
	"sap/ui/fl/Utils",
	"sap/ui/fl/write/api/ExtensionPointRegistryAPI",
	"sap/base/util/deepEqual",
	"sap/base/util/isEmptyObject",
	"sap/base/util/merge",
	"sap/base/util/restricted/_omit",
	"sap/ui/core/mvc/View",
	"sap/base/Log",
	"sap/ui/core/Configuration"
], function(
	OverlayRegistry,
	ElementOverlay,
	AggregationOverlay,
	DtUtil,
	FlUtils,
	ExtensionPointRegistryAPI,
	deepEqual,
	isEmptyObject,
	merge,
	_omit,
	View,
	Log,
	Configuration
) {
	"use strict";

	/**
	 * Provides necessary functionality to get tree model data for an outline.
	 * Takes into consideration different design time root elements.
	 *
	 * @namespace
	 * @name sap.ui.rta.service.Outline
	 * @author SAP SE
	 * @experimental Since 1.56
	 * @since 1.56
	 * @version ${version}
	 * @private
	 * @ui5-restricted
	 */

	/**
	 * Object containing an outline of available nodes.
	 *
	 * @typedef {object} sap.ui.rta.service.Outline.ExtensionPointInfo
	 * @since 1.77
	 * @private
	 * @ui5-restricted
	 * @property {string[]} defaultContent - List of control IDs that belong to the default content of an extension point
	 */

	/**
	 * Object containing an outline of available nodes.
	 *
	 * @typedef {object} sap.ui.rta.service.Outline.OutlineObject
	 * @since 1.56
	 * @private
	 * @ui5-restricted
	 * @property {string} id - ID of the control
	 * @property {string} [instanceName] - Text retrieved from node's design time metadata <code>getLabel()</code>
	 * @property {string} [name] - Singular name from node's design time metadata
	 * @property {string} technicalName - Class type for element nodes/aggregation name for aggregation nodes
	 * @property {boolean} editable - Indicates whether the node is editable
	 * @property {string} [templateReference]
	 *  - ID of the template that the element was cloned from; can be used for filtering out clones or
	 *  showing the template element in the outline for a clone selected in the UI
	 * @property {string} [icon] - Icon path for the node
	 * @property {string} type - Type of node
	 * @property {boolean} [visible] - Visibility of node of type <code>element</code>
	 * @property {sap.ui.rta.service.Outline.ExtensionPointInfo} [extensionPointInfo]
	 *  - In case of an extension point additional extension point information is given.
	 * @property {sap.ui.rta.service.Outline.OutlineObject[]} elements - Outline data for child nodes
	 */

	function getExtensionPointsForView(sViewId, aConsideredExtensionPointNames) {
		var mExtensionPoints = ExtensionPointRegistryAPI.getExtensionPointInfoByViewId({viewId: sViewId});
		return _omit(mExtensionPoints, aConsideredExtensionPointNames);
	}

	function cleanupData(oData) {
		return _omit(oData, ["bIsView"]);
	}

	return function(oRta, fnPublish) {
		var oOutline = {};

		oOutline.mExtensionPointMetadata = {
			palette: {
				icons: {
					svg: "sap/ui/core/designtime/Icon.icon.svg"
				}
			}
		};

		oOutline._aConsideredExtensionPoints = [];

		oOutline._attachNotConsideredExtensionPoints = function (oOverlay, oData) {
			var sViewId = FlUtils.getViewForControl(oOverlay.getElement()).getId();
			var mExtensionPointInfos = getExtensionPointsForView(sViewId, this._aConsideredExtensionPoints);
			Object.keys(mExtensionPointInfos).forEach(function (sExtensionPointName, iIndex) {
				var mExtensionPointInfo = mExtensionPointInfos[sExtensionPointName];
				var mExtensionPointData = this._getExtensionPointData(mExtensionPointInfo);
				mExtensionPointData.id = sViewId;
				oData.elements.splice(iIndex, 0, mExtensionPointData);
				this._aConsideredExtensionPoints.push(mExtensionPointData.name);
			}.bind(this));
		};

		/**
		 * Returns the given outline model data that can be used by tools to display an outline.
		 * If an <code>sId</code> is given, the data contains the model data for this control.
		 * If a <code>iDepth</code> is given, all sub elements are retrieved until the depth is reached.
		 *
		 * @param {string} [sId] - ID of the control to start with. If omitted, the root control(s) is used.
		 * @param {int} [iDepth] - Depth of <code>childNode</code> levels that should be returned based on the given control
		 * @returns {OutlineObject[]} Array containing outline data for each root control
		 */
		oOutline._getOutline = function (sId, iDepth) {
			var oResponse;
			// Fix parameters if provided in different order
			if (!iDepth && DtUtil.isInteger(sId)) {
				//only depth, shift and start with the root
				iDepth = sId;
				sId = undefined;
			}

			var aInitialOverlays = [];
			if (!sId) {
				aInitialOverlays = oRta._oDesignTime.getRootElements()
					.map(function (sRootElementId) {
						return OverlayRegistry.getOverlay(sRootElementId);
					});
			} else {
				var oPassedOverlay = OverlayRegistry.getOverlay(sId);
				if (!oPassedOverlay) {
					throw DtUtil.createError(
						"services.Outline#get",
						"Cannot find element with id= " + sId + ". A valid or empty value for the initial element id should be provided.", "sap.ui.rta"
					);
				}
				aInitialOverlays.push(oPassedOverlay);
			}

			oResponse = aInitialOverlays.map(function (oInitialOverlay) {
				return this._getChildrenNodes(oInitialOverlay, iDepth);
			}, this);

			this._aConsideredExtensionPoints = [];
			return oResponse;
		};

		oOutline._getExtensionPoints = function (oData) {
			var sParentId = oData.id;
			var sAggregationName = oData.technicalName;
			return ExtensionPointRegistryAPI.getExtensionPointInfoByParentId({parentId: sParentId})
				.filter(function (mExtenstionPoint) {
					return mExtenstionPoint.aggregationName === sAggregationName;
				});
		};

		oOutline._getExtensionPointData = function (mExtensionPoint) {
			return {
				id: mExtensionPoint.targetControl.getId(),
				name: mExtensionPoint.name,
				technicalName: "sap.ui.extensionpoint",
				type: "extensionPoint",
				icon: this.mExtensionPointMetadata.palette.icons.svg,
				extensionPointInfo: {
					defaultContent: mExtensionPoint.defaultContent.map(function (oControl) {
						return oControl.getId();
					})
				}
			};
		};

		oOutline._enrichExtensionPointData = function (oData, oOverlay) {
			var bIsDesignMode = Configuration.getDesignMode();
			if (!bIsDesignMode) {
				return undefined;
			}
			if (oData.type === "aggregation") {
				var aExtensionPoints = this._getExtensionPoints(oData)
					.sort(function (mExtensionPointA, mExtensionPointB) {
						return mExtensionPointB.index - mExtensionPointA.index;
					});
				aExtensionPoints.forEach(function (mExtensionPoint) {
					var mExtensionPointData = this._getExtensionPointData(mExtensionPoint);
					oData.elements.splice(mExtensionPoint.index, 0, mExtensionPointData);
					this._aConsideredExtensionPoints.push(mExtensionPointData.name);
				}.bind(this));
			} else if (oData.bIsView) {
				return this._attachNotConsideredExtensionPoints(oOverlay, oData);
			}
		};

		function getTemplateData(oChildOverlay, mTemplateData, mInnerTemplateData) {
			var sAggregationName = oChildOverlay.getAggregationName && oChildOverlay.getAggregationName();
			if (sAggregationName) {
				var sAggregationOverlayId = oChildOverlay.getParent().getId();
				// Aggregation with root template
				if (mInnerTemplateData[sAggregationName]) {
					return Object.assign({
						templateFor: sAggregationOverlayId
					}, mInnerTemplateData[sAggregationName]);
				}
				return ((mTemplateData && mTemplateData.elements) || [])
					.map(function(oElement) {
						// Template
						if (
							oElement.type === "aggregationBindingTemplate"
							|| oElement.parentAggregationName === sAggregationName
						) {
							return Object.assign({
								templateFor: sAggregationOverlayId
							}, oElement);
						}
						// Regular aggregation
						return oElement.technicalName === sAggregationName && oElement;
					})
					.filter(Boolean)[0];
			}
			// Template root element
			var aAggregationTemplateOverlays = (
				oChildOverlay.getParentElementOverlay().getAggregationBindingTemplateOverlays
				&& oChildOverlay.getParentElementOverlay().getAggregationBindingTemplateOverlays()
					.reduce(function (aAllRootElementOverlaysInsideTemplates, oAggregationOverlay) {
						return aAllRootElementOverlaysInsideTemplates.concat(oAggregationOverlay.getChildren());
					}, [])
			) || [];
			if (aAggregationTemplateOverlays.includes(oChildOverlay)) {
				return undefined;
			}
			if (!mTemplateData) {
				return undefined;
			}
			// Element inside clone
			var oParent = oChildOverlay.getParentElementOverlay();
			if (oParent.getId() === mTemplateData.templateFor) {
				return mTemplateData;
			}
			var iIndex = oChildOverlay.getParent().getChildren().indexOf(oChildOverlay);
			return mTemplateData.elements[iIndex];
		}

		/**
		 * Returns outline model data including the children until max depth (<code>this.iDepth</code> or last child is reached).
		 * During execution, the <code>fnFilter</code> is used to determine whether node data should be added.
		 * If not, the children of the skipped node are processed until max depth.
		 *
		 * @param {sap.ui.dt.Overlay} oOverlay - Overlay for this node
		 * @param {int} [iDepth] - Level of children to traverse
		 * @param {sap.ui.dt.Overlay} [oParentOverlay] - Parent overlay (if present) for the passed overlay
		 * @param {object} [mTemplateData] - Propagates template data to the aggregation template clones
		 * @returns {OutlineObject} Outline model data
		 */
		oOutline._getChildrenNodes = function (oOverlay, iDepth, oParentOverlay, mTemplateData) {
			var bValidDepth = DtUtil.isInteger(iDepth);
			var mAggregationTemplates = {};

			if (oOverlay.getShouldBeDestroyed()) {
				return {};
			}

			//get necessary properties from overlay
			var oData = this._getNodeProperties(oOverlay, oParentOverlay, mTemplateData) || {};

			var aChildren = oOverlay.getChildren();
			//find aggregation binding template overlays
			var aAggregationTemplateOverlays = (
				oOverlay.getAggregationBindingTemplateOverlays
				&& oOverlay.getAggregationBindingTemplateOverlays()
			) || [];

			if (aAggregationTemplateOverlays.length > 0) {
				aChildren = aAggregationTemplateOverlays.reduce(function(aCollectedChildren, oAggregationTemplateOverlay) {
					var oTemplateOverlay = oAggregationTemplateOverlay.getChildren()[0];
					mAggregationTemplates[oTemplateOverlay.getId()] = oAggregationTemplateOverlay.getAggregationName();
					return [oTemplateOverlay].concat(aCollectedChildren);
				}, aChildren);
			}

			//check if the tree should be traversed deeper and children overlays are present
			if ((!bValidDepth || (bValidDepth && iDepth > 0))
				&& aChildren.length > 0
				&& !isEmptyObject(oData)
			) {
				//decrement depth for children nodes
				iDepth = bValidDepth ? iDepth - 1 : iDepth;

				var mInnerTemplateData = {};
				oData.elements = aChildren
					.map(function (oChildOverlay) {
						var mNextTemplateData = getTemplateData(oChildOverlay, mTemplateData, mInnerTemplateData);
						var oNextData = this._getChildrenNodes(oChildOverlay, iDepth, oChildOverlay.getParent(), mNextTemplateData);
						if (oNextData.type === "aggregationBindingTemplate") {
							var sAggregationName = mAggregationTemplates[oChildOverlay.getId()];
							mInnerTemplateData[sAggregationName] = merge({}, oNextData);
						}
						return oNextData;
					}, this)
					.filter(function (oChildNode) {
						return !isEmptyObject(oChildNode);
					});

				//get extension point information if available
				this._enrichExtensionPointData(oData, oOverlay);
			}

			return cleanupData(oData);
		};

		function isAggregationBindingTemplate(oOverlay, oParentAggregationOverlay, sParentAggregationName) {
			var oParentElementOverlay = oOverlay.getParentElementOverlay();
			return oParentElementOverlay
				&& sParentAggregationName
				&& oParentElementOverlay.getAggregationOverlay(sParentAggregationName, "AggregationBindingTemplateOverlays") === oParentAggregationOverlay;
		}

		function getElementOverlayData(oOverlay, oElement, oDtMetadata) {
			var oData = {
				editable: oOverlay.getEditable(),
				bIsView: oOverlay.getElement() instanceof View
			};
			if (typeof oOverlay.isVisible() === "boolean") {
				oData.visible = oOverlay.isVisible();
			}
			var oParentAggregationOverlay = oOverlay.getParent() && oOverlay.getParentAggregationOverlay();
			var sParentAggregationName = (oParentAggregationOverlay && oParentAggregationOverlay.getAggregationName()) || "";
			// Aggregation Binding Template
			if (isAggregationBindingTemplate(oOverlay, oParentAggregationOverlay, sParentAggregationName)) {
				oData.type = "aggregationBindingTemplate";
				oData.icon = "sap-icon://attachment-text-file";
				oData.parentAggregationName = sParentAggregationName;
			} else {
				oData.type = "element";
			}

			var oDtName = oDtMetadata.getName(oElement);
			if (oDtName && oDtName.singular) {
				oData.name = oDtName && oDtName.singular;
			}
			return oData;
		}

		function getAggregationOverlayData(oOverlay, oParentOverlay, oElement) {
			var sAggregationName = oOverlay.getAggregationName();
			var oData = {
				technicalName: oOverlay.getAggregationName(),
				editable: false,
				type: "aggregation",
				bIsView: oOverlay.getElement() instanceof View
			};
			if (oParentOverlay.getAggregation(sAggregationName)) {
				var oAggregationDescription = oParentOverlay.getDesignTimeMetadata().getAggregationDescription(sAggregationName, oElement);
				if (oAggregationDescription.singular) {
					oData.name = oAggregationDescription.singular;
				}
			}
			if (oParentOverlay.getAggregationBindingTemplateOverlays().length) {
				oData.icon = "sap-icon://card";
			}
			return oData;
		}

		function getDefaultData(oElement, oDtMetadata, mTemplateData) {
			var oData = {
				id: oElement.getId(),
				technicalName: oElement.getMetadata().getName(),
				editable: false,
				type: null
			};

			if (mTemplateData) {
				oData.templateReference = mTemplateData.id;
			}

			var sDefaultIcon = getDefaultIcon(oDtMetadata);
			if (sDefaultIcon) {
				oData.icon = sDefaultIcon;
			}
			var sInstanceName = oDtMetadata.getLabel(oElement);
			if (sInstanceName && sInstanceName !== oData.id) {
				oData.instanceName = sInstanceName;
			}
			return oData;
		}

		function getDefaultIcon(oDtMetadata) {
			var oDtMetadataData = oDtMetadata.getData();
			return oDtMetadataData.palette
				&& oDtMetadataData.palette.icons
				&& oDtMetadataData.palette.icons.svg
				|| undefined;
		}

		/**
		 * Collects the necessary data for a node without the <code>childNodes</code>.
		 *
		 * @param {sap.ui.dt.Overlay} oOverlay - Overlay of the node for which properties are calculated
		 * @param {sap.ui.dt.Overlay} [oParentOverlay] - Parent overlay (if present) for the passed overlay
		 * @param {object} [mTemplateData] - Template data
		 * @returns {object} Data containing applicable properties
		 */
		 oOutline._getNodeProperties = function (oOverlay, oParentOverlay, mTemplateData) {
			var oElement = oOverlay.getElement();
			var oDtMetadata = oOverlay.getDesignTimeMetadata();
			var oData = getDefaultData(oElement, oDtMetadata, mTemplateData);

			if (oOverlay instanceof ElementOverlay) {
				return Object.assign(oData, getElementOverlayData(oOverlay, oElement, oDtMetadata));
			}
			return Object.assign(oData, getAggregationOverlayData(oOverlay, oParentOverlay, oElement));
		};

		/**
		 * Checks if update object already exists in update list.
		 *
		 * @param {array} aResponseUpdates - Array of existing updates
		 * @param {Object} oResponse - Update object to be checked if it already exists
		 * @return {array} Filtered array of updates
		 */
		oOutline._removeDuplicate = function(aResponseUpdates, oResponse) {
			return aResponseUpdates.filter(function(oUpdate) {
				return !deepEqual(oResponse, oUpdate, Infinity);
			});
		};

		/**
		 * Event handler for events from design time representing
		 * updates on the outline model.
		 * @param {object} oEvent - Event thrown by designtime
		 */
		oOutline._updatesHandler = function(oEvent) {
			var mParams = oEvent.getParameters();

			if (this.sStatus === "initial") {
				// reset
				this.aUpdates = [];
			}

			var oResponse = merge({}, mParams);

			// Map overlay ids to element ids
			var sElementId = oResponse.id ? OverlayRegistry.getOverlay(oResponse.id).getElement().getId() : undefined;
			var sTargetId = oResponse.targetId ? OverlayRegistry.getOverlay(oResponse.targetId).getElement().getId() : undefined;

			switch (oEvent.getId()) {
				case "elementOverlayCreated":
					// Only send new root overlays as updates; children elements are part of their outlines already
					if (mParams.elementOverlay.isRoot()) {
						var sRootElementId = mParams.elementOverlay.getElement().getId();
						oResponse.element = oOutline._getOutline(sRootElementId)[0];
						oResponse.type = "new";
						break;
					}
					return;

				case "elementOverlayAdded":
					// Overlays added to existing aggregations
					oResponse.element = oOutline._getOutline(sElementId)[0];
					oResponse.targetId = sTargetId;
					oResponse.type = "new";
					break;

				case "elementOverlayMoved":
					oResponse.element = oOutline._getOutline(sElementId, 0)[0];
					oResponse.targetId = sTargetId;
					oResponse.type = "move";
					break;

				case "elementOverlayDestroyed":
					var oParentAggregationOverlay = oResponse.elementOverlay.getParentAggregationOverlay();
					// Proceed only if (either):
					// Aggregation overlay exists for current element overlay & is not being destroyed
					// Aggregation overlay doesn't exist and element overlay belongs to the root element
					if (
						(
							oParentAggregationOverlay instanceof AggregationOverlay
							&& !oParentAggregationOverlay._bIsBeingDestroyed
						)
						|| oResponse.elementOverlay.isRoot()
					) {
						oResponse.element = {};
						oResponse.element.id =
							oResponse.elementOverlay.getElement()
								? oResponse.elementOverlay.getElement().getId()
								: oResponse.elementOverlay.getAssociation("element"); // Triggered via DesignTime elementOverlayDestroyed event
						oResponse.type = "destroy";
						break;
					}
					return;

				case "elementOverlayEditableChanged":
					// Trigger origin in ElementOverlay
					oResponse.element = {
						id: sElementId,
						editable: oResponse.editable
					};
					oResponse.type = "editableChange";
					break;

				case "elementPropertyChanged":
					// Trigger origin is ManagedObjectObserver
					oResponse.element = oOutline._getOutline(sElementId, 0)[0];
					oResponse.type = "elementPropertyChange";
					break;

				default:
					Log.error("Event type is not 'expected' by handler");
			}

			// Remove unwanted properties
			oResponse = _omit(oResponse, ["elementOverlay", "editable", "target", "id", "elementId"]);

			//Check if the new update already exists - if present remove the previous occurrence
			this.aUpdates = oOutline._removeDuplicate(this.aUpdates, oResponse);

			this.aUpdates.push(oResponse);

			if (this.sStatus === "initial") {
				setTimeout(function () {
					// need to check this.aUpdates still exists as destroy() can be called when setTimeout is still waiting
					if (Array.isArray(this.aUpdates) && this.aUpdates.length > 0) {
						this.sStatus = "initial";
						fnPublish("update", this.aUpdates);
					}
				}.bind(oOutline), 200);
			}
			// Set status of update request to "processing"  - until a setTimeout callback is executed
			this.sStatus = "processing";
		};

		/**
		 * Detaches all event listeners that were attached from the outline service and performs a clean up.
		 */
		oOutline.destroy = function () {
			oRta._oDesignTime.detachEvent("elementOverlayCreated", this._updatesHandler, this);
			oRta._oDesignTime.detachEvent("elementOverlayAdded", this._updatesHandler, this);
			oRta._oDesignTime.detachEvent("elementOverlayMoved", this._updatesHandler, this);
			oRta._oDesignTime.detachEvent("elementOverlayDestroyed", this._updatesHandler, this);
			oRta._oDesignTime.detachEvent("elementPropertyChanged", this._updatesHandler, this);
			oRta._oDesignTime.detachEvent("elementOverlayEditableChanged", this._updatesHandler, this);
			delete this.aUpdates;
			delete this.sStatus;
		};

		/**
		 * Starts listening to any design time and element property changes.
		 * When a change is detected, the relevant response is published on the "update" event.
		 */
		oOutline.aUpdates = [];

		// Initial status for setTimeout
		oOutline.sStatus = "initial";

		oRta._oDesignTime.attachEvent("elementOverlayCreated", oOutline._updatesHandler, oOutline);
		oRta._oDesignTime.attachEvent("elementOverlayAdded", oOutline._updatesHandler, oOutline);
		oRta._oDesignTime.attachEvent("elementOverlayMoved", oOutline._updatesHandler, oOutline);
		oRta._oDesignTime.attachEvent("elementOverlayDestroyed", oOutline._updatesHandler, oOutline);
		oRta._oDesignTime.attachEvent("elementPropertyChanged", oOutline._updatesHandler, oOutline);
		oRta._oDesignTime.attachEvent("elementOverlayEditableChanged", oOutline._updatesHandler, oOutline);

		return {
			/**
			 * @desc Attached listeners are notified of any modifications to existing nodes in the outline.
			 * These notifications are an array of objects (updates) whenever modifications are encountered.
			 *
			 * The array will contain one or multiple occurrences of the following object types:
			 * <pre>
			 * {
			 *   "type": "destroy",
			 *   "element": {
			 *      "id": &lt;string&gt; // elementId
			 *   }
			 * }
			 *
			 * {
			 *   "type": "editableChange",
			 *   "element": {
			 *      "id": &lt;string&gt; // elementId,
			 *      "editable": &lt;boolean&gt;
			 *   }
			 * }
			 *
			 * {
			 *   "type": "new",
			 *   "element": &lt;sap.ui.rta.service.Outline.OutlineObject&gt;
			 *   "targetAggregation": &lt;string&gt;,
			 *   "targetId": &lt;string&gt;,
			 *   "targetIndex": &lt;integer&gt;
			 * }
			 *
			 * {
			 *   "type": "elementPropertyChange",
			 *   "element": &lt;sap.ui.rta.service.Outline.OutlineObject&gt;
			 *   "name": &lt;string&gt; // property name,
			 *   "oldValue": &lt;string&gt; // old value,
			 *   "value": &lt;integer&gt; // current value
			 * }
			 *
			 * {
			 *   "type": "move",
			 *   "element": &lt;sap.ui.rta.service.Outline.OutlineObject&gt;
			 *   "targetAggregation": &lt;string&gt;,
			 *   "targetId": &lt;string&gt;,
			 *   "targetIndex": &lt;integer&gt;
			 * }
			 * </pre>
			 * @event sap.ui.rta.service.Outline.update
			 * @public
			 */
			events: ["update"],
			exports: {
				/**
				 * Returns an outline model data associated with the key user adaptation instance, starting from the passed control.
				 * If no control is passed, the root control(s) of the respective key user adaptation instance is taken as the initial control.
				 * Throws an error if the control ID parameter is not a valid control with a stable ID.
				 *
				 * @method sap.ui.rta.service.Outline.get
				 * @param {string} [sId] - ID of the control to start with. If omitted the root control(s) is used.
				 * @param {int} [iDepth] - Depth of <code>childNode</code> levels that should be returned based on the given control
				 * @returns {sap.ui.rta.service.Outline.OutlineObject} Array containing outline data for each root control
				 * @public
				 */
				get: oOutline._getOutline.bind(oOutline)
			},
			destroy: oOutline.destroy.bind(oOutline)
		};
	};
});