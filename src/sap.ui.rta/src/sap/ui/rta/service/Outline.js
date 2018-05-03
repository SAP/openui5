/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/dt/ElementOverlay",
	"sap/ui/rta/Utils",
	"sap/ui/dt/Util",
	"sap/ui/dt/Overlay",
	"sap/ui/dt/ElementUtil"
], function(
	OverlayRegistry,
	ElementOverlay,
	RtaUtils,
	DtUtil,
	Overlay,
	ElementUtil
) {
	"use strict";

	return function(oRta) {
		/**
		 * Provides necessary functionality to get tree model data for an outline
		 * Takes into consideration different designtime root elements
		 * @experimental Since 1.56
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
		var oOutline = {
			oRta: oRta
		};

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
		oOutline._getOutline = function(sId, iDepth) {
			// Fix parameters if provided in different order
			if (!iDepth && DtUtil.isInteger(sId)) {
					//only depth, shift and start with the root
					iDepth = sId;
					sId = undefined;
			}

			var aRootElementOverlays = [];
			if (!sId) {
				aRootElementOverlays = this.oRta._oDesignTime.getRootElements()
					.map(function (vRootElement) {
						var oRootElement = ElementUtil.getElementInstance(vRootElement);
						return OverlayRegistry.getOverlay(oRootElement);
					});
			} else {
				var oPassedOverlay = OverlayRegistry.getOverlay(sId);
				if (!oPassedOverlay) {
					throw DtUtil.createError("services.Outline#get", "Valid id for the starting overlay should be provided or this parameter should be neglected ", "sap.ui.rta");
				}
				aRootElementOverlays.push(oPassedOverlay);
			}

			return aRootElementOverlays.map(function(oInitialOverlay) {
				return this._getChildrenNodes(oInitialOverlay, iDepth);
			}.bind(this));
		};

		/**
		 * Returns outline model data including the children until max depth (this.iDepth is reached)
		 * During execution the fnFilter is used to determine whether node data should be added.
		 * If not, the children of the skipped node are processed, until max depth
		 *
		 * @param {sap.ui.dt.Overlay} oOverlay - overlay for this node
		 * @param {integer} [iDepth] - level of children to traverse
		 * @param {sap.ui.dt.Overlay} [oParentOverlay] - parent overlay (if present) for the passed overlay
		 * @returns {OutlineObject} - outline model data
		 * @private
		 */
		oOutline._getChildrenNodes = function(oOverlay, iDepth, oParentOverlay) {
			var bValidDepth = DtUtil.isInteger(iDepth);

			//get necessary properties from overlay
			var oData = this._getNodeProperties(oOverlay, oParentOverlay);

			//find children
			var aChildren = oOverlay.getChildren();

			//check if the tree should be traversed deeper and children overlays are present
			if ((!bValidDepth || (bValidDepth && iDepth > 0))
				&& aChildren.length > 0
			) {
				//decrement depth for children nodes
				iDepth = bValidDepth ? iDepth - 1 : iDepth;

				oData.elements = aChildren.map(function (oChildOverlay) {
					return this._getChildrenNodes(oChildOverlay, iDepth, oChildOverlay.getParent());
				}, this);
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
		oOutline._getNodeProperties = function(oOverlay, oParentOverlay) {
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
				if (oParentOverlay instanceof ElementOverlay) {
					oDtName = oParentOverlay.getAggregation(sAggregationName)
						? oParentOverlay.getDesignTimeMetadata().getAggregationDescription(sAggregationName, oElement)
						: undefined;
				}
			}

			//add all mandatory info to data
			var oData = {
				id : sId,
				instanceName : sInstanceName !== sId ? sInstanceName : undefined, //element's id should not be set
				name : oDtName && oDtName.singular, //from designtime metadata
				technicalName: sAggregationName ? sAggregationName : sElementClass, //aggregation name / class name
				editable : bIsEditable,
				icon: sIconType, //designtime metadata icon type
				type: sType //either "element" or "aggregation"
			};

			try {
				return JSON.parse(JSON.stringify(oData));
			} catch (e) {
				throw DtUtil.createError("services.Outline#get", e.message, "sap.ui.rta");
			}
		};


		var oServiceReturnObj = {
			exports: {
				/**
				 * Returns an outline model data associated with the rta instance, starting from the passed control.
				 * If no control is passed rta instance's root control(s) is taken as the initial control.
				 * Throws an error if the control id parameter is not a valid control with a stable id.
				 *
				 * @param {string} [sId] - the id of the control to start with, if omitted the root control(s) is used
				 * @param {int} [iDepth] - the depth of childNode levels that should be returned based on the given control
				 * @returns {OutlineObject[]} - an array containing outline data for each root control
				 */
				get: oOutline._getOutline.bind(oOutline)
			}
		};
		return new Promise(function(fnResolve, fnReject) {
			var fnCheckRootElementOverlaysExist = function () {
				return oRta._oDesignTime.getRootElements().some(function (oRootElement) {
					return !OverlayRegistry.getOverlay(oRootElement);
				});
			};
			if ( !oRta._oDesignTime || fnCheckRootElementOverlaysExist() ) {
				oRta.attachEventOnce("start", function() {
					fnResolve(oServiceReturnObj);
				});
				oRta.attachEventOnce("failed", function() {
					fnReject(DtUtil.createError("services.Outline#get", "Designtime failed to load. This is needed to start the Outline service", "sap.ui.rta"));
				});
			} else {
				fnResolve(oServiceReturnObj);
			}
		});
	};
}, true);