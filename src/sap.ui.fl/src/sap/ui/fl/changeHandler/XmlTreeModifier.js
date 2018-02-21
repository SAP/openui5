/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/fl/changeHandler/BaseTreeModifier", "sap/ui/base/DataType"], function (BaseTreeModifier, DataType) {

		"use strict";

		var XmlTreeModifier = {

			targets: "xmlTree",

			setVisible: function (oControl, bVisible) {
				if (bVisible) {
					oControl.removeAttribute("visible");
				} else {
					this.setProperty(oControl, "visible", bVisible);
				}
			},

			getVisible: function (oControl) {
				return this.getProperty(oControl, "visible");
			},

			setStashed: function (oControl, bStashed) {
				if (!bStashed) {
					oControl.removeAttribute("stashed");
				} else {
					this.setProperty(oControl, "stashed", bStashed);
				}
				this.setVisible(oControl, !bStashed);
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

			/**
			 * Creates the control (as XML element or node)
			 *
			 * @param {string} sClassName Class name for the control (for example, <code>sap.m.Button</code>)
			 * @param {sap.ui.core.UIComponent} [oAppComponent] - Needed to calculate the correct ID in case you provide an id
			 * @param {Element} oView XML node of the view, required to create nodes and to find elements
			 * @param {object} [oSelector] - Selector to calculate the ID for the control that is being created
			 * @param {string} [oSelector.id] - Control ID targeted by the change
			 * @param {boolean} [oSelector.isLocalId] - True if the ID within the selector is a local ID or a global ID
			 * @param {object} [mSettings ] Further settings or properties for the control that is being created
			 * @returns {Element} XML node of the control being created
			 */
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
			 * @param {Element} oView Node of the view
			 * @returns {Element} XML node of the control
			 * @private
			 */
			_byId: function (sId, oView) {

				// If function defined and operational use getElementById(sId) of document or view to access control
				// ... Note: oView.ownerDocument.getElementById(sId) may fail under IE 11 indicating "permission denied"
				if (oView) {
					if (oView.ownerDocument && oView.ownerDocument.getElementById && oView.ownerDocument.getElementById(sId)) {
						return oView.ownerDocument.getElementById(sId);
					} else {
						return oView.querySelector("[id='" + sId + "']");
					}

					// Use jQuery.find function to access control if getElementById(..) failed
					var oNodes = jQuery.sap.byId(sId, oView);
					if (oNodes.length === 1) {
						return oNodes[0];
					}
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

			_getLocalName: function (xmlElement) {
				// localName for standard browsers, baseName for IE, nodeName in the absence of namespaces
				return xmlElement.localName || xmlElement.baseName || xmlElement.nodeName;
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

			/**
			 * Insert the control (as XML element or node) into the specified aggregation;
			 * if the aggregation node is not available in the current XML and is needed
			 * because it's not the default aggregation, the aggregation node will be created automatically.
			 *
			 * @param {Element} oParent XML node or element of the control in which to insert <code>oObject</code>
			 * @param {string} sName Aggregation name
			 * @param {Element} oObject XML node or element of the control that will be inserted
			 * @param {int} iIndex Index for <code>oObject</code> in the aggregation
			 * @param {Element} oView xml node/element of the view - needed to potentially create (aggregation) nodes
			 */
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

			_getControlMetadata: function(oControl){
				var sControlType = this.getControlType(oControl);
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
				if (oAggregationNode && this._children(oAggregationNode).length === 1) {
					return this._children(oAggregationNode)[0];
				}

			},

			updateAggregation: function (oControl, sAggregationName) {
				/*only needed in JS case to indicate binding (template) has changed, in XML case binding has not been created yet (see managed object)*/
			},

			findIndexInParentAggregation: function (oControl) {
				var oParent,
					sAggregationName,
					aControlsInAggregation;

				// find the parent
				oParent = this.getParent(oControl);

				if (!oParent) {
					return -1;
				}

				// we need the aggregation name in order to find all control nodes in the parent
				// which are relevant to this aggregation and skip all other possible nodes
				sAggregationName = this.getParentAggregationName(oControl, oParent);

				// get the relevant controls from the aggregation node
				aControlsInAggregation = this.getAggregation(oParent, sAggregationName);

				// if the result from the above is array:
				if (Array.isArray(aControlsInAggregation)) {
					// find and return the correct index
					return aControlsInAggregation.indexOf(oControl);
				} else {
					// if aControlsInAggregation is not an array, then the aggregation is
					// of type 0..1 and aControlsInAggregation is the oControl provided
					// to the function initially, so its index is 0
					return 0;
				}
			},

			getParentAggregationName: function (oControl, oParent) {
				var bNotNamedAggregation,
					sAggregationName;

				// check if the control is in named aggregatio node
				if (!oParent.isSameNode(oControl.parentNode)) {
					// the control is in named aggregation
					bNotNamedAggregation = false;
				} else {
					// again check just in case
					bNotNamedAggregation = this._isNotNamedAggregationNode(oParent, oControl);
				}

				// check if the the control is in default aggregation
				// and get the name of the aggregation
				if (bNotNamedAggregation) {
					// the control is in the default aggregation of the parent
					sAggregationName = this._getControlMetadata(oParent).getDefaultAggregationName();
				} else {
					// the agregation name is provided and we can simply take it from the xml node
					sAggregationName = this._getLocalName(oControl.parentNode);
				}

				return sAggregationName;
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