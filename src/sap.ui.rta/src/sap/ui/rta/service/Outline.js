/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/dt/ElementOverlay",
	"sap/ui/dt/AggregationOverlay",
	"sap/ui/rta/Utils",
	"sap/ui/dt/Util",
	"sap/ui/dt/Overlay",
	"sap/ui/dt/ElementUtil",
	"sap/base/util/equal",
	"sap/base/Log",
	"sap/base/util/extend"
], function(
	OverlayRegistry,
	ElementOverlay,
	AggregationOverlay,
	RtaUtils,
	DtUtil,
	Overlay,
	ElementUtil,
	equal,
	Log,
	Extend
) {
	"use strict";

	return function(oRta, fnPublish) {
		/**
		 * Provides necessary functionality to get tree model data for an outline
		 * Takes into consideration different designtime root elements
		 * @experimental Since 1.56
		 * @private
		 * @ui5-restricted
		 *
		 * @typedef {object} OutlineObject
		 * @property {string} id - id of the control
		 * @property {string} [instanceName] - text retrieved from node's designtime metadata getLabel()
		 * @property {string} [name] - singular name from node's designtime metadata
		 * @property {string} technicalName - class type for element nodes / aggregation name for aggregation nodes
		 * @property {boolean} editable - whether the node is editable
		 * @property {string} [icon] - icon path for the node
		 * @property {string} type - type of control node
		 * @property {OutlineObject[]} elements - outline data for child nodes
		 */
		var oOutline = { };

		/**
		 * Returns the given outline model data that can be used by tools to display an outline.
		 * If an <code>sId</code> is given, the data contains the model data for this control.
		 * If a <code>iDepth</code> is given, all sub elements are retrieved until the depth is reached.
		 *
		 * @param {string} [sId] - id of the control to start with, if omitted the root control(s) is used
		 * @param {int} [iDepth] - depth of childNode levels that should be returned based on the given control
		 * @returns {OutlineObject[]} - an array containing outline data for each root control
		 * @private
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

		/**
		 * Returns outline model data including the children until max depth (this.iDepth is reached)
		 * During execution the fnFilter is used to determine whether node data should be added.
		 * If not, the children of the skipped node are processed, until max depth
		 *
		 * @param {sap.ui.dt.Overlay} oOverlay - overlay for this node
		 * @param {int} [iDepth] - level of children to traverse
		 * @param {sap.ui.dt.Overlay} [oParentOverlay] - parent overlay (if present) for the passed overlay
		 * @returns {OutlineObject} - outline model data
		 * @private
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
			}

			return oData;
		};

		/**
		 * Collects the necessary data for a node without the childNodes
		 *
		 * @param {sap.ui.dt.Overlay} oOverlay - node's overlay for which properties are calculated
		 * @param {sap.ui.dt.Overlay} [oParentOverlay] - parent overlay (if present) for the passed overlay
		 * @returns {object} - data containing applicable properties
		 * @private
		 */
		oOutline._getNodeProperties = function (oOverlay, oParentOverlay) {
			var oDtName;
			var sAggregationName;
			var sInstanceName;
			var sType;
			var bIsEditable = false; //default for aggregation overlays
			var oElement = oOverlay.getElement();
			var sId = oElement.getId();
			var sElementClass = oElement.getMetadata().getName();
			var oDtMetadata = oOverlay.getDesignTimeMetadata();
			var oDtMetadataData = oDtMetadata.getData();
			var sIconType = (
				oDtMetadataData.palette
				&& oDtMetadataData.palette.icons
				&& oDtMetadataData.palette.icons.svg
				|| undefined
			);

			if (oOverlay instanceof ElementOverlay) {
				sType = "element";
				sInstanceName = oDtMetadata.getLabel(oElement);
				bIsEditable = oOverlay.getEditable();
				oDtName = oDtMetadata.getName(oElement);
			} else {
				sType = "aggregation";
				sAggregationName = oOverlay.getAggregationName();
				sInstanceName = oDtMetadata.getLabel(oElement);
				oDtName = oParentOverlay.getAggregation(sAggregationName)
					? oParentOverlay.getDesignTimeMetadata().getAggregationDescription(sAggregationName, oElement)
					: undefined;
			}

			//add all mandatory info to data
			var oData = {
				id: sId,
				technicalName: sAggregationName ? sAggregationName : sElementClass, //aggregation name / class name
				editable: bIsEditable,
				type: sType //either "element" or "aggregation"
			};

			// element's id should not be set
			if (sInstanceName !== sId && sInstanceName !== undefined) {
				oData.instanceName = sInstanceName;
			}

			// from designtime metadata
			if (oDtName && oDtName.singular) {
				oData.name = oDtName.singular;
			}

			// designtime metadata icon type
			if (sIconType !== undefined) {
				oData.icon = sIconType;
			}

			return oData;
		};

		/**
		 * Check if update object already exists in update list
		 *
		 * @private
		 */
		oOutline._removeDuplicate = function(aResponseUpdates, oResponse) {
			return aResponseUpdates.filter(function(oUpdate){
				return !equal(oResponse, oUpdate, Infinity);
			});
		};

		/**
		 * Event handler for events from design time representing
		 * updates on the outline model
		 *
		 * @private
		 */
		oOutline._updatesHandler = function(oEvent) {
			var mParams = oEvent.getParameters();

			if (this.sStatus === "initial") {
				// reset
				this.aUpdates = [];
			}

			var oResponse = Extend(true, {}, mParams);

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
					( oParentAggregationOverlay instanceof AggregationOverlay
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
			oResponse = RtaUtils.omit(oResponse, ["elementOverlay", "editable", "target", "id", "elementId"]);

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
		 * When called, starts listening to any designtime and element property changes
		 * When a change is detected the relevant response is published on the "update" event
		 *
		 * @private
		 */
		oOutline._startUpdates = function () {
			this.aUpdates = [];

			// Initial status for setTimeout
			this.sStatus = "initial";

			oRta._oDesignTime.attachEvent("elementOverlayCreated", this._updatesHandler, this);
			oRta._oDesignTime.attachEvent("elementOverlayAdded", this._updatesHandler, this);
			oRta._oDesignTime.attachEvent("elementOverlayMoved", this._updatesHandler, this);
			oRta._oDesignTime.attachEvent("elementOverlayDestroyed", this._updatesHandler, this);
			oRta._oDesignTime.attachEvent("elementPropertyChanged", this._updatesHandler, this);
			oRta._oDesignTime.attachEvent("elementOverlayEditableChanged", this._updatesHandler, this);
		};

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

		var oServiceReturnObj = {
			events: ["update"],
			exports: {
				/**
				 * Returns an outline model data associated with the rta instance, starting from the passed control.
				 * If no control is passed rta instance's root control(s) is taken as the initial control.
				 * Throws an error if the control id parameter is not a valid control with a stable id.
				 * @experimental Since 1.56
		 		 * @public
		 		 * @ui5-restricted
				 *
				 * @param {string} [sId] - the id of the control to start with, if omitted the root control(s) is used
				 * @param {int} [iDepth] - the depth of childNode levels that should be returned based on the given control
				 * @returns {OutlineObject[]} - an array containing outline data for each root control
				 */
				get: oOutline._getOutline.bind(oOutline)
			},
			destroy: oOutline.destroy.bind(oOutline)
		};

		return new Promise(function (fnResolve, fnReject) {

			var fnCheckRootElementOverlaysExist = function () {
				return oRta._oDesignTime.getRootElements().some(function (oRootElement) {
					return !OverlayRegistry.getOverlay(oRootElement);
				});
			};

			if (!oRta._oDesignTime || fnCheckRootElementOverlaysExist()) {
				oRta.attachEventOnce("start", function () {
					oOutline._startUpdates();
					fnResolve(oServiceReturnObj);
				});
				oRta.attachEventOnce("failed", function () {
					fnReject(DtUtil.createError("services.Outline#get", "Designtime failed to load. This is needed to start the Outline service", "sap.ui.rta"));
				});
			} else {
				oOutline._startUpdates();
				fnResolve(oServiceReturnObj);
			}
		});
	};
}, true);