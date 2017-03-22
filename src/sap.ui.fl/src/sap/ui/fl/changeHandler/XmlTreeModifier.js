/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/fl/changeHandler/BaseTreeModifier"], function (BaseTreeModifier) {

		"use strict";

		var XmlTreeModifier = {

			targets: "xmlTree",

			setVisible: function (oControl, oPropertyValue) {
				this.setProperty(oControl, "visible", oPropertyValue);
			},

			getVisible: function (oControl) {
				return this.getProperty(oControl, "visible");
			},

			setStashed: function (oControl, oPropertyValue) {
				this.setProperty(oControl, "stashed", oPropertyValue);
			},

			bindProperty: function (oControl, sPropertyName, sBindingPath) {
				oControl.setAttribute(sPropertyName, "{" + sBindingPath + "}");
			},

			setProperty: function (oControl, sPropertyName, oPropertyValue) {
				oControl.setAttribute(sPropertyName, oPropertyValue);
			},

			getProperty: function (oControl, sPropertyName) {
				return oControl.getAttribute(sPropertyName);
			},

			setPropertyBinding: function (oControl, sPropertyName, oPropertyBinding) {
				oControl.setAttribute(sPropertyName, oPropertyBinding);
			},

			createControl: function (sClassName, oAppComponent, oView, oSelector) {
				if (!this.bySelector(oSelector, oAppComponent, oView)) {
					var oNewElementNode = oView.createElement(sClassName);
					var sId = this.getControlIdBySelector(oSelector, oAppComponent);
					if (sId) {
						oNewElementNode.setAttribute("id", sId);
					}
					return oNewElementNode;
				} else {
					throw new Error("Can't create a control with duplicated id " + sId);
				}
			},

			/** SUBSTITUTION UNTIL SmartForm has adopted to the bySelector
			 *
			 * @param sId
			 * @param oView
			 * @returns {*|Node}
			 */
			byId: function (sId, oView) {
				return this._byId(sId, oView);
			},

			/**
			 * Returns the control for the given id. Undefined if control cannot be found.
			 *
			 * @param {string} sId control id
			 * @param {Node} oView node of the view
			 * @returns {Node} xml node of the Control
			 * @private
			 */
			_byId: function (sId, oView) {

				// If function defined and operational use getElementById(sId) of document or view to access control
				// ... Note: oView.ownerDocument.getElementById(sId) may fail under IE 11.420 indicating "permission denied"
				if (oView) {
					if (oView.ownerDocument && oView.ownerDocument.getElementById && oView.ownerDocument.getElementById(sId)) {
						// oView.ownerDocument.getElementById(sId) fails under IE 11.420 indicating "permission denied"
						return oView.ownerDocument.getElementById(sId);
					} else if (oView.getElementById && oView.getElementById(sId)) {
						return oView.getElementById(sId);
					}
				}

				// Use jQuery.find function to access control if getElementById(..) failed
				var oNodes = jQuery(oView).find("#" + sId);
				if (oNodes.length === 1) {
					return oNodes[0];
				}
			},

			getId: function (oControl) {
				return oControl.getAttribute("id");
			},

			getParent: function (oControl) {
				var oParent = oControl.parentNode;
				if (!this.getId(oParent)) {
					//go to the real control, jump over aggregation node
					oParent = oParent.parentNode;
				}

				return oParent;
			},

			_getLocalName: function (xmlNode) {
				// localName for standard browsers, baseName for IE, nodeName in the absence of namespaces
				return xmlNode.localName || xmlNode.baseName || xmlNode.nodeName;
			},

			getControlType: function (oControl) {
				var sControlType = oControl.namespaceURI;
				sControlType = (sControlType ? sControlType + "." : ""); // add a dot if there is already a prefix
				sControlType += this._getLocalName(oControl);

				return sControlType;
			},

			getAggregation: function (oParent, sName) {
				var oAggregationNode = this._findAggregationNode(oParent, sName);
				//convert NodeList to Array
				return Array.prototype.slice.call(this._children(oAggregationNode));
			},

			insertAggregation: function (oParent, sName, oObject, iIndex, oView, bNewParent, oAppComponent) {
				var oAggregationNode = this._findAggregationNode(oParent, sName, oView, bNewParent, oAppComponent);

				if (iIndex >= oAggregationNode.childElementCount) {
					oAggregationNode.appendChild(oObject);
				} else {
					var oReferenceNode = this._children(oAggregationNode)[iIndex];
					oAggregationNode.insertBefore(oObject, oReferenceNode);
				}
			},

			/**
			 * Removes the object from the aggregation of the given control
			 *
			 * @param {Node}
			 *          oParent - the control for which the changes should be fetched
			 * @param {string}
			 *          sName - aggregation name
			 * @param {Node}
			 *          oObject - aggregated object to be set
			 */
			removeAggregation: function (oParent, sName, oObject, oView) {
				var oAggregationNode = this._findAggregationNode(oParent, sName, oView);
				oAggregationNode.removeChild(oObject);
			},

			removeAllAggregation: function (oControl, sName, oView) {
				var oAggregationNode = this._findAggregationNode(oControl, sName, oView);
				if (oControl === oAggregationNode) {
					var oChildren = this._children(oControl);
					for (var i = 0; i < oChildren.length; i++) {
						oControl.removeChild(oChildren[i]);
					}
				} else {
					oControl.removeChild(oAggregationNode);
				}
			},

			_findAggregationNode: function (oParent, sName, oView, bNewParent, oAppComponent) {
				var oAggregationNode;
				if (bNewParent) {
					oAggregationNode = this.createControl(sName, oAppComponent, oView);
					oParent.appendChild(oAggregationNode);
				} else {
					var aChildren = this._children(oParent);
					for (var i = 0; i < aChildren.length; i++) {
						var oNode = aChildren[i];
						if (oNode.localName === sName) {
							oAggregationNode = oNode;
							break;
						}
					}
					if (!oAggregationNode) {
						// expecting default aggregation
						oAggregationNode = oParent;
					}
				}
				return oAggregationNode;
			},

			_children: function (oParent) {
				if (oParent.children) {
					return oParent.children;
				} else {
					var aChildren = [];
					for (var i = 0; i < oParent.childNodes.length; i++) {
						var oNode = oParent.childNodes[i];
						if (oNode.nodeType === oNode.ELEMENT_NODE) {
							aChildren.push(oNode);
						}
					}
					return aChildren;
				}
			}
		};

		return jQuery.sap.extend(
			true /* deep extend */,
			{} /* target object, to avoid changing of original modifier */,
			BaseTreeModifier,
			XmlTreeModifier
		);
	},
	/* bExport= */true);
