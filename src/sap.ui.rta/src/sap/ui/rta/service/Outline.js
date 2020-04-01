/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/dt/ElementOverlay",
	"sap/ui/dt/AggregationOverlay",
	"sap/ui/dt/Util",
	"sap/ui/fl/registry/ExtensionPointRegistry",
	"sap/base/util/deepEqual",
	"sap/base/util/merge",
	"sap/base/util/restricted/_omit",
	"sap/base/util/restricted/_pick",
	"sap/ui/thirdparty/jquery"
], function(
	OverlayRegistry,
	ElementOverlay,
	AggregationOverlay,
	DtUtil,
	ExtensionPointRegistry,
	deepEqual,
	merge,
	_omit,
	_pick,
	jQuery
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
	 * @property {string} technicalName - Class type for element nodes/aggregation name for aggregation nodes.
	 * @property {boolean} editable - Indicates whether the node is editable
	 * @property {string} [icon] - Icon path for the node
	 * @property {string} type - Type of node
	 * @property {boolean} [visible] - Visibility of node of type <code>element</code>
	 * @property {sap.ui.rta.service.Outline.ExtensionPointInfo} [extensionPointInfo] - In case of an extension point additional extension point information is given.
	 * @property {sap.ui.rta.service.Outline.OutlineObject[]} elements - Outline data for child nodes
	 */

	return function(oRta, fnPublish) {
		var oOutline = {};

		oOutline.mExtensionPointMetadata = {
			palette: {
				icons: {
					svg: "sap/ui/core/designtime/Icon.icon.svg"
				}
			}
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

			return oResponse;
		};

		oOutline._getExtensionPoints = function (oData) {
			var oExtensionPointRegistry = ExtensionPointRegistry.getInstance();
			var sParentId = oData.id;
			var sAggregationName = oData.technicalName;
			return oExtensionPointRegistry.getExtensionPointInfoByParentId(sParentId)
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
					defaultContent: mExtensionPoint.defaultContent
				}
			};
		};

		oOutline._enrichExtensionPointData = function (oData) {
			var bIsDesignMode = sap.ui.getCore().getConfiguration().getDesignMode();
			if (oData.type === "aggregation" && bIsDesignMode) {
				var aExtensionPoints = this._getExtensionPoints(oData)
					.sort(function (mExtensionPointA, mExtensionPointB) {
						return mExtensionPointB.index - mExtensionPointA.index;
					});
				aExtensionPoints.forEach(function (mExtensionPoint) {
					var mExtensionPointData = this._getExtensionPointData(mExtensionPoint);
					oData.elements.splice(mExtensionPoint.index, 0, mExtensionPointData);
				}.bind(this));
			}
		};

		/**
		 * Returns outline model data including the children until max depth (<code>this.iDepth</code> or last child is reached).
		 * During execution, the <code>fnFilter</code> is used to determine whether node data should be added.
		 * If not, the children of the skipped node are processed until max depth.
		 *
		 * @param {sap.ui.dt.Overlay} oOverlay - Overlay for this node
		 * @param {int} [iDepth] - Level of children to traverse
		 * @param {sap.ui.dt.Overlay} [oParentOverlay] - Parent overlay (if present) for the passed overlay
		 * @returns {OutlineObject} Outline model data
		 */
		oOutline._getChildrenNodes = function (oOverlay, iDepth, oParentOverlay) {
			var bValidDepth = DtUtil.isInteger(iDepth);

			if (oOverlay.getShouldBeDestroyed()) {
				return {};
			}

			//get necessary properties from overlay
			var oData = this._getNodeProperties(oOverlay, oParentOverlay) || {};

			//find children
			var aChildren = oOverlay.getChildren();

			//check if the tree should be traversed deeper and children overlays are present
			if ((!bValidDepth || (bValidDepth && iDepth > 0))
				&& aChildren.length > 0
				&& !jQuery.isEmptyObject(oData)
			) {
				//decrement depth for children nodes
				iDepth = bValidDepth ? iDepth - 1 : iDepth;

				oData.elements = aChildren
					.map(function (oChildOverlay) {
						return this._getChildrenNodes(oChildOverlay, iDepth, oChildOverlay.getParent());
					}, this)
					.filter(function (oChildNode) {
						return !jQuery.isEmptyObject(oChildNode);
					});

				//get extension point information if available
				this._enrichExtensionPointData(oData);
			}

			return oData;
		};

		/**
		 * Collects the necessary data for a node without the <code>childNodes</code>.
		 *
		 * @param {sap.ui.dt.Overlay} oOverlay - Overlay of the node for which properties are calculated
		 * @param {sap.ui.dt.Overlay} [oParentOverlay] - Parent overlay (if present) for the passed overlay
		 * @returns {object} Data containing applicable properties
		 */
		oOutline._getNodeProperties = function (oOverlay, oParentOverlay) {
			var oDtName;
			var sAggregationName;
			var sType;
			var bVisible;
			var bIsEditable = false; //default for aggregation overlays
			var oElement = oOverlay.getElement();
			var sId = oElement.getId();
			var sElementClass = oElement.getMetadata().getName();
			var oDtMetadata = oOverlay.getDesignTimeMetadata();
			var oDtMetadataData = oDtMetadata.getData();
			var sInstanceName = oDtMetadata.getLabel(oElement);
			var sIconType = (
				oDtMetadataData.palette
				&& oDtMetadataData.palette.icons
				&& oDtMetadataData.palette.icons.svg
				|| undefined
			);

			if (oOverlay instanceof ElementOverlay) {
				sType = "element";
				bIsEditable = oOverlay.getEditable();
				oDtName = oDtMetadata.getName(oElement);
				bVisible = oOverlay.isVisible();
			} else {
				sType = "aggregation";
				sAggregationName = oOverlay.getAggregationName();
				oDtName = oParentOverlay.getAggregation(sAggregationName)
					? oParentOverlay.getDesignTimeMetadata().getAggregationDescription(sAggregationName, oElement)
					: undefined;
			}

			//add all mandatory info to data
			var oData = Object.assign(
				{
					id: sId,
					technicalName: sAggregationName || sElementClass,
					editable: bIsEditable,
					type: sType //either "element" or "aggregation"
				},
				sInstanceName !== sId && sInstanceName !== undefined && { instanceName: sInstanceName }, // element's id should not be set as instanceName
				oDtName && oDtName.singular && { name: oDtName.singular }, // designTime metadata name.singular
				sIconType !== undefined && { icon: sIconType }, // designTime metadata icon type
				typeof bVisible === "boolean" && { visible: bVisible } // visible
			);

			return oData;
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
					if ( // Proceed only if (either):
					// Aggregation overlay exists for current element overlay & is not being destroyed
					// Aggregation overlay doesn't exist and element overlay belongs to the root element
					(oParentAggregationOverlay instanceof AggregationOverlay
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