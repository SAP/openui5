/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/fl/changeHandler/BaseTreeModifier", "sap/ui/base/DataType"], function (BaseTreeModifier, DataType) {

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

			getStashed: function (oControl) {
				return this.getProperty(oControl, "stashed");
			},

			bindProperty: function (oControl, sPropertyName, vBindingInfos) {
				oControl.setAttribute(sPropertyName, "{" + vBindingInfos + "}");
			},

			setProperty: function (oControl, sPropertyName, oPropertyValue) {
				oControl.setAttribute(sPropertyName, oPropertyValue);
			},

			getProperty: function (oControl, sPropertyName) {
				var oPropertyInfo = this._getControlMetadata(oControl).getProperty(sPropertyName);
				var vPropertyValue = oControl.getAttribute(sPropertyName);
				if (oPropertyInfo) { //not a property like aggregation
					var oType = oPropertyInfo.getType();
					if (vPropertyValue === null){
						vPropertyValue = oPropertyInfo.getDefaultValue() || oType.getDefaultValue();
					} else {
						vPropertyValue = oType.parseValue(vPropertyValue);
					}
				}
				return vPropertyValue;
			},

			setPropertyBinding: function (oControl, sPropertyName, oPropertyBinding) {
				oControl.setAttribute(sPropertyName, oPropertyBinding);
			},

			getPropertyBinding: function (oControl, sPropertyName) {
				return oControl.getAttribute(sPropertyName);
			},

			createControl: function (sClassName, oAppComponent, oView, oSelector, mSettings) {
				var sId, sLocalName;
				if (!this.bySelector(oSelector, oAppComponent, oView)) {
					var aClassNameParts = sClassName.split('.');
					var sNamespaceURI = "";
					if (aClassNameParts.length > 1) {
						sLocalName = aClassNameParts.pop();
						sNamespaceURI = aClassNameParts.join('.');
					}

					var oNewElementNode = oView.ownerDocument.createElementNS(sNamespaceURI, sLocalName);

					sId = this.getControlIdBySelector(oSelector, oAppComponent);
					if (sId) {
						oNewElementNode.setAttribute("id", sId);
					}
					if (mSettings){
						var oValue;
						Object.keys(mSettings).forEach(function(sKey) {
						    oValue = mSettings[sKey];
						    oNewElementNode.setAttribute(sKey, oValue);
						});
					}
					return oNewElementNode;
				} else {
					throw new Error("Can't create a control with duplicated id " + sId);
				}
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

			getAllAggregations: function (oControl) {
				var oControlMetadata = this._getControlMetadata(oControl);
				return oControlMetadata.getAllAggregations();
			},

			getAggregation: function (oParent, sName) {
				var oAggregationNode = this._findAggregationNode(oParent, sName);
				var bSingleValueAggregation = this._isSingleValueAggregation(oParent, sName);
				if (!oAggregationNode){
					if (bSingleValueAggregation && this._isAltTypeAggregation(oParent, sName)){
						return this.getProperty(oParent, sName);
					}
					return bSingleValueAggregation ? undefined : [];
				}
				var aChildren = this._getControlsInAggregation(oParent, oAggregationNode);
				if (bSingleValueAggregation){
					return aChildren[0];
				}
				return aChildren;
			},

			insertAggregation: function (oParent, sName, oObject, iIndex, oView) {
				var oAggregationNode = this._findAggregationNode(oParent, sName);

				if (!oAggregationNode) {
					// named aggregation must have the same namespace as the parent
					var sNamespaceURI = oParent.namespaceURI;
					// no ids for aggregation nodes => no need pass id or component
					oAggregationNode = this.createControl(sNamespaceURI + "." + sName, undefined, oView);
					oParent.appendChild(oAggregationNode);
				}

				if (iIndex >= oAggregationNode.childElementCount) {
					oAggregationNode.appendChild(oObject);
				} else {
					var oReferenceNode = this._getControlsInAggregation(oParent, oAggregationNode)[iIndex];
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
			removeAggregation: function (oParent, sName, oObject) {
				var oAggregationNode = this._findAggregationNode(oParent, sName);
				oAggregationNode.removeChild(oObject);
			},

			removeAllAggregation: function (oControl, sName) {
				var oAggregationNode = this._findAggregationNode(oControl, sName);
				if (oControl === oAggregationNode) {
					var aChildControls = this._getControlsInAggregation(oControl, oControl);
					aChildControls.forEach(function(oChildControl){
						oControl.removeChild(oChildControl);
					});
				} else {
					oControl.removeChild(oAggregationNode);
				}
			},

			_findAggregationNode: function (oParent, sName) {
				var oAggregationNode;
				var aChildren = this._children(oParent);
				for (var i = 0; i < aChildren.length; i++) {
					var oNode = aChildren[i];
					if (oNode.localName === sName) {
						oAggregationNode = oNode;
						break;
					}
				}
				if (!oAggregationNode && this._isDefaultAggregation(oParent, sName)) {
					// expecting default aggregation
					oAggregationNode = oParent;
				}
				return oAggregationNode;
			},

			_isDefaultAggregation: function(oParent, sAggregationName){
				var oControlMetadata = this._getControlMetadata(oParent);
				var oDefaultAggregation = oControlMetadata.getDefaultAggregation();
				return oDefaultAggregation && sAggregationName === oDefaultAggregation.name;
			},

			_isNotNamedAggregationNode: function(oParent, oChildNode){
				var mAllAggregatiosnMetadata = this.getAllAggregations(oParent);
				var oAggregation = mAllAggregatiosnMetadata[oChildNode.localName];
				return oParent.namespaceURI !== oChildNode.namespaceURI || !oAggregation; //same check as in XMLTemplateProcessor (handleChild)
			},

			_isSingleValueAggregation: function(oParent, sAggregationName){
				var mAllAggregatiosnMetadata = this.getAllAggregations(oParent);
				var oAggregationMetadata = mAllAggregatiosnMetadata[sAggregationName];
				return !oAggregationMetadata.multiple;
			},

			_isAltTypeAggregation: function(oParent, sAggregationName){
				var oControlMetadata = this._getControlMetadata(oParent);
				var oAggregationMetadata = oControlMetadata.getAllAggregations()[sAggregationName];
				return !!oAggregationMetadata.altTypes;
			},

			_getControlMetadata: function(oParent, sAggregationName){
				var sControlType = this.getControlType(oParent);
				jQuery.sap.require(sControlType);
				var ControlType = jQuery.sap.getObject(sControlType);
				return ControlType.getMetadata();
			},

			_getControlsInAggregation: function(oParent, oAggregationNode){
				//convert NodeList to Array
				var aChildren = Array.prototype.slice.call(this._children(oAggregationNode));
				return aChildren.filter(this._isNotNamedAggregationNode.bind(this, oParent));
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
			},

			getBindingTemplate: function (oControl, sAggregationName) {
				var oAggregationNode = this._findAggregationNode(oControl, sAggregationName);
				if (oAggregationNode && oAggregationNode.childNodes.length === 1) {
					return oAggregationNode.childNodes[0];
				}

			},

			updateAggregation: function (oControl, sAggregationName) {
				/*only needed in JS case to indicate binding (template) has changed, in XML case binding has not been created yet (see managed object)*/
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