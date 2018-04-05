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
		 *
		 * @typedef {object} OutlineObject
		 * @property {string} id - the id of the control
		 * @property {string} instanceName - the text to display for the node
		 * @property {string} className - the class name the control belongs to
		 * @property {string} classType - the class type the control belongs to
		 * @property {string} editable - whether the node is editable
		 * @property {string} icon - icon path for the node
		 * @property {string} type - type of control node
		 * @property {OutlineObject[]} children - outline data for child nodes
		 */
		var oOutline = {
			oRta: oRta
		};

		/**
		 * Returns the given outline model data that can be used by tools to display an outline.
		 * If an <code>sId</code> is given, the data contains the model data for this control.
		 * If a <code>iDepth</code> is given, all sub elements are retrieved until the depth is reached.
		 *
		 * @param {string} [sId] the id of the control to start with, if omitted the root control(s) is used
		 * @param {int} [iDepth] the depth of childNode levels that should be returned based on the given control
		 * @returns {OutlineObject[]} an array containing outline data for each root control
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
		 * @param {sap.ui.dt.Overlay} oOverlay the overlay for this node
		 * @returns {OutlineObject} the outline model data
		 * @private
		 */
		oOutline._getChildrenNodes = function(oOverlay, iDepth) {
			var bValidDepth = DtUtil.isInteger(iDepth);

			//get necessary properties from overlay
			var oData = this._getNodeProperties(oOverlay);

			//find children
			var aChildren = oOverlay.getChildren();

			//check if the tree should be traversed deeper and children overlays are present
			if ((!bValidDepth || (bValidDepth && iDepth > 0))
				&& aChildren.length > 0
			) {
				//decrement depth for children nodes
				iDepth = bValidDepth ? iDepth - 1 : iDepth;

				oData.children = aChildren.map(function (oChildOverlay) {
					return this._getChildrenNodes(oChildOverlay, iDepth);
				}, this);
			}

			return oData;
		};

		/**
		 * Collects the necessary data for a node without the childNodes
		 *
		 * @param {sap.ui.dt.Overlay} oOverlay the overlay
		 * @returns {object} the data of a node
		 * @private
		 */
		oOutline._getNodeProperties = function(oOverlay) {
			var oElement = oOverlay.getElement();
			var sElementClass = oElement.getMetadata().getName();
			var sElementClassName = sElementClass.split(".").pop();
			var bIsEditable = false;
			var sInstanceName;
			var oDtMetadata = oOverlay.getDesignTimeMetadata();
			var oDtMetadataData = oDtMetadata.getData();
			var sType;
			var sIconType = (
				oDtMetadataData.palette
				&& oDtMetadataData.palette.icons
				&& oDtMetadataData.palette.icons.svg
				|| ""
			);

			if (oOverlay instanceof ElementOverlay) {
				sInstanceName = oDtMetadata.getLabel(oElement);
				bIsEditable = oOverlay.getEditable();
				sType = "element";
			} else {
				sInstanceName = oDtMetadata.getLabel(oElement, oOverlay.getAggregationName());
				sType = "aggregation";
			}

			//add all mandatory info to data
			var oData = {
				id : oElement.getId(),
				displayName : sInstanceName,
				className : sElementClassName,
				classType : sElementClass,
				editable : bIsEditable,
				icon: sIconType,
				type: sType
			};

			return oData;
		};


		var oServiceReturnObj = {
			exports: {
				/**
				 * Returns an outline model data associated with the rta instance, starting from the passed control.
				 * If no control is passed rta instance's root control(s) is taken as the initial control.
				 * Throws an error if the control id parameter is not a valid control with a stable id.
				 *
				 * @param {string} [sId] the id of the control to start with, if omitted the root control(s) is used
				 * @param {int} [iDepth] the depth of childNode levels that should be returned based on the given control
				 * @returns {OutlineObject[]} an array containing outline data for each root control
				 */
				get: oOutline._getOutline.bind(oOutline)
			}
		};
		return new Promise(function(fnResolve, fnReject) {
			if (!oRta._oDesignTime) {
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