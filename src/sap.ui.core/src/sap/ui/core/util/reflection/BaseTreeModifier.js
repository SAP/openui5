/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/base/ManagedObject",
	"sap/ui/base/ManagedObjectMetadata",
	"jquery.sap.global",
	"jquery.sap.xml" // needed to have jQuery.sap.getParseError
], function(
	ManagedObject,
	ManagedObjectMetadata,
	jQuery
	/* other jQuery.sap dependencies */
) {

	"use strict";

	/**
	 * Abstract static utility class to access ManageObjects and XMLNodes that represent
	 * ManagedObjects in a harmonized way.
	 *
	 * The class mirrors the ManagedObject API so that code that needs to work with ManagedObjects
	 * in several representations can be written in a single way. The slight differences are handled
	 * by specifying a super set of parameters that might not be needed in all use cases.
	 * For example sap.ui.fl is using this class and its subtypes for change handlers that can be
	 * applied on XMLViews and normal ManagedObject instances.
	 *
	 * @namespace sap.ui.core.util.reflection.BaseTreeModifier
	 * @private
	 * @sap-restricted sap.ui.fl, sap.ui.rta, sap.ui.model.meta, control change handler and provider
	 * @since 1.56.0
	 */
	return /** @lends sap.ui.core.util.reflection.BaseTreeModifier */{

		/** Function determining the control targeted by the change.
		* The function differs between local IDs generated starting with 1.40 and the global IDs generated in previous versions.
		*
		* @param {object} oSelector Target of a flexiblity change
		* @param {string} oSelector.id ID of the control targeted by the change
		* @param {boolean} oSelector.isLocalId true if the ID within the selector is a local ID or a global ID
		* @param {sap.ui.core.UIComponent} oAppComponent asd
		* @param {Element} oView For XML processing only: XML node of the view
		* @returns {sap.ui.base.ManagedObject | Element} Control representation targeted within the selector
		* @throws {Error} in case no control could be determined an error is thrown
		* @public
		*/
		bySelector: function (oSelector, oAppComponent, oView) {
		   var sControlId = this.getControlIdBySelector(oSelector, oAppComponent);
		   return this._byId(sControlId, oView);
		},

		/** Function determining the control ID from selector.
		* The function differs between local IDs generated starting with 1.40 and the global IDs generated in previous versions.
		* @param {object} oSelector Target of a flexiblity change
		* @param {string} oSelector.id ID of the control targeted by the change
		* @param {boolean} oSelector.isLocalId True if the ID within the selector is a local ID or a global ID
		* @param {sap.ui.core.UIComponent} oAppComponent Application Component
		* @returns {string} Returns the ID of the control
		* @throws {Error} in case no control could be determined an error is thrown
		* @protected
		*/
		getControlIdBySelector: function (oSelector, oAppComponent) {
			if (!oSelector){
				return undefined;
			}

		   if (typeof oSelector === "string") {
		      oSelector = {
		         id: oSelector
		      };
		   }

		   var sControlId = oSelector.id;

		   if (oSelector.idIsLocal) {
		      if (oAppComponent) {
		         sControlId = oAppComponent.createId(sControlId);
		      } else {
		         throw new Error("App Component instance needed to get a control's ID from selector");
		      }
		   } else {
		      // does nothing except in the case of a FLP prefix
		      var pattern = /^application-[^-]*-[^-]*-component---/igm;
		      var bHasFlpPrefix = !!pattern.exec(oSelector.id);
		      if (bHasFlpPrefix) {
		         sControlId = sControlId.replace(/^application-[^-]*-[^-]*-component---/g, "");
		         if (oAppComponent) {
		            sControlId = oAppComponent.createId(sControlId);
		         } else {
		            throw new Error("App Component instance needed to get a control's ID from selector");
		         }
		      }
		   }

		   return sControlId;
		},


		/** Function for determining the selector later used to apply a change for a given control.
		 * The function differs between local IDs generated starting with 1.40 and the global IDs generated in previous versions.
		 *
		 * @param {sap.ui.base.ManagedObject | Element | string} vControl control or ID string for which the selector should be determined
		 * @param {sap.ui.core.Component} oAppComponent (optional) oAppComponent application component, needed only if vControl is a string or XML Node
		 * @param {object} mAdditionalSelectorInformation additional mapped data which is added to the selector
		 * @returns {object} oSelector
		 * @returns {string} oSelector.id ID used for determination of the flexibility target
		 * @returns {boolean} oSelector.idIsLocal flag if the selector.id has to be concatenated with the application component ID
		 * while applying the change.
		 * @throws {Error} in case no control could be determined an error is thrown
		 * @public
		 */
		getSelector: function (vControl, oAppComponent, mAdditionalSelectorInformation) {
			var sControlId = vControl;
			if (vControl instanceof ManagedObject) {
				sControlId = vControl.getId();
			} else if (!oAppComponent) {
				throw new Error("App Component instance needed to get a selector from string ID");
			}

			if (mAdditionalSelectorInformation && (mAdditionalSelectorInformation.id || mAdditionalSelectorInformation.idIsLocal)) {
				throw new Error("A selector of control with the ID '" + sControlId + "' was requested, " +
					"but core properties were overwritten by the additionally passed information.");
			}

			var bValidId = this.checkControlId(vControl, oAppComponent);

			if (!bValidId) {
				throw new Error("Generated ID attribute found - to offer flexibility a stable control ID is needed to assign the changes to, but for this control the ID was generated by SAPUI5 " + sControlId);
			}

			var oSelector = jQuery.extend(mAdditionalSelectorInformation || {}, {
				id: "",
				idIsLocal: false
			}, true);


			if (this.hasLocalIdSuffix(vControl, oAppComponent)) {
				// get local Id for control at root component and use it as selector ID
				var sLocalId = oAppComponent.getLocalId(sControlId);
				oSelector.id = sLocalId;
				oSelector.idIsLocal = true;
			} else {
				oSelector.id = sControlId;
			}

			return oSelector;
		},

		/**
		 * Check if the control id is generated or maintained by the application
		 *
		 * @param {sap.ui.core.Control | string} vControl Control instance or id
		 * @param {sap.ui.core.Component} oAppComponent oAppComponent application component, needed only if vControl is string (id)
		 * @param {boolean} [bSuppressLogging] bSuppressLogging flag to suppress the warning in the console
		 * @returns {boolean} Returns true if the id is maintained by the application
		 * @protected
		 */
		checkControlId: function (vControl, oAppComponent, bSuppressLogging) {

			var sControlId = vControl instanceof ManagedObject ? vControl.getId() : vControl;
			var bIsGenerated = ManagedObjectMetadata.isGeneratedId(sControlId);

			if (!bIsGenerated || this.hasLocalIdSuffix(vControl, oAppComponent)) {
				return true;
			} else {


				var sHasConcatenatedId = sControlId.indexOf("--") !== -1;
				if (!bSuppressLogging && !sHasConcatenatedId && this._fnCheckElementIsNoClone(vControl)) {
					jQuery.sap.log.warning("Generated id attribute found, to offer flexibility a stable control id is needed " +
						"to assign the changes to, but for this control the id was generated by SAPUI5", sControlId);
				}
				return false;
			}
		},

		/**
		 * Checks if a control id has a prefix matching the application component it.
		 * If this prefix exists the suffix after the component Id is called the local id.
		 *
		 * @param {sap.ui.core.Control | string} vControl ui5 control or id to be checked if it is wihtin the generic application
		 * @param {sap.ui.core.Component} oAppComponent application component, needed only if vControl is string (id)
		 * @returns {boolean} control has a local id
		 * @protected
		 */
		hasLocalIdSuffix: function (vControl, oAppComponent) {
			var sControlId = (vControl instanceof ManagedObject) ? vControl.getId() : vControl;

			if (!oAppComponent) {
				jQuery.sap.log.error("determination of a local id suffix failed due to missing app component for " + sControlId);
				return false;
			}

			return !!oAppComponent.getLocalId(sControlId);
		},


		_fnCheckElementIsNoClone: function (oElement) {
			var bElementIsNoClone = true;

			if (oElement.getBindingContext && oElement.getBindingContext()) {
				var aBindingHierarchy = oElement.getBindingContext().getPath().split("/");
				var sLowestBindingHierarchy = aBindingHierarchy[aBindingHierarchy.length - 1];
				bElementIsNoClone = isNaN(sLowestBindingHierarchy);
			}

			return bElementIsNoClone;
		},
		/**
		 * This function takes the fragment, goes through all the children and adds a prefix to the control's ID.
		 * Can also handle 'FragmentDefinition' as root node, then all the children's IDs are prefixed.
		 * Adds a '.' at the end of the prefix to separate it from the original ID.
		 * Throws an error if any one of the controls in the fragment have no ID specified.
		 * Aggregations will be ignored and don't need an ID.
		 *
		 * @param {Element} oFragment the fragment in XML
		 * @param {string} sIdPrefix string which will be used to prefix the IDs
		 * @returns {Element} Returns the original fragment in XML with updated IDs.
		 */
		_checkAndPrefixIdsInFragment: function(oFragment, sIdPrefix) {
			var oParseError = jQuery.sap.getParseError(oFragment);
			if (oParseError.errorCode !== 0) {
				throw new Error(oFragment.parseError.reason);
			}

			var oControlNodes = oFragment.documentElement;

			var aRootChildren = [], aChildren = [];
			if (oControlNodes.localName === "FragmentDefinition") {
				aRootChildren = this._getElementNodeChildren(oControlNodes);
			} else {
				aRootChildren = [oControlNodes];
			}
			aChildren = [].concat(aRootChildren);

			// get all children and their children
			function oCallback(oChild) {
				aChildren.push(oChild);
			}
			for (var i = 0, n = aRootChildren.length; i < n; i++) {
				this._traverseXmlTree(oCallback, aRootChildren[i]);
			}

			for (var j = 0, m = aChildren.length; j < m; j++) {
				// aChildren[j].id is not available in IE11, therefore using .getAttribute/.setAttribute
				if (aChildren[j].getAttribute("id")) {
					aChildren[j].setAttribute("id", sIdPrefix + "." + aChildren[j].getAttribute("id"));
				} else {
					throw new Error("At least one control does not have a stable ID");
				}
			}

			return oControlNodes;
		},

		/**
		 * Gets all the children of an XML Node that are element nodes
		 *
		 * @param {Element} oNode XML Node
		 * @returns {Element[]} Returns an array with the children of the node.
		 */
		_getElementNodeChildren: function(oNode) {
			var aChildren = [];
			var aNodes = oNode.childNodes;
			for (var i = 0, n = aNodes.length; i < n; i++) {
				if (aNodes[i].nodeType === 1) {
					aChildren.push(aNodes[i]);
				}
			}
			return aChildren;
		},

		/**
		 * Checks if the element is an instance of the type.
		 *
		 * @param {object} oElement Element to be checked
		 * @param {string} sType type That the element should be checked against
		 * @returns {boolean} Returns true if the element is an instance of the type
		 */
		_isInstanceOf: function(oElement, sType) {
			var oInstance = jQuery.sap.getObject(sType);
			if (typeof oInstance === "function") {
				return oElement instanceof oInstance;
			} else {
				return false;
			}
		},

		/**
		 * Checks if the element has the interface.
		 *
		 * @param {object} oElement Element
		 * @param {string} sInterface Interface that should be in the element
		 * @returns {boolean} Returns true if the element has the interface
		 */
		_hasInterface: function(oElement, sInterface) {
			var aInterfaces = oElement.getMetadata().getInterfaces();
			return aInterfaces.indexOf(sInterface) !== -1;
		},

		/**
		 * Gets the Metadata of am XML control.
		 *
		 * @param {Element} oControl control in XML
		 * @returns {sap.ui.base.Metadata} Returns the Metadata of the control
		 */
		_getControlMetadataInXml: function(oControl) {
			var sControlType = this._getControlTypeInXml(oControl);
			jQuery.sap.require(sControlType);
			var ControlType = jQuery.sap.getObject(sControlType);
			return ControlType.getMetadata();
		},

		/**
		 * Gets the ControlType of an XML control
		 *
		 * @param {Element} oControl control in XML
		 * @returns {string} Returns the control type as a string, e.g. 'sap.m.Button'.
		 */
		_getControlTypeInXml: function (oControl) {
			var sControlType = oControl.namespaceURI;
			sControlType = sControlType ? sControlType + "." : ""; // add a dot if there is already a prefix
			sControlType += oControl.localName;

			return sControlType;
		},

		/**
		 * Recursively goes through an XML Tree and calls a callback function for every control inside
		 * Does not call the callback function for aggregations
		 *
		 * @param {function} fnCallback function that will be called for every control with the following argument:
		 * 								{Element} node Element
		 * @param {Element} oRootNode rootnode from which we start traversing the tree
		 */
		_traverseXmlTree: function(fnCallback, oRootNode) {
			function recurse(oParent, oCurrentNode, bIsAggregation) {
				var oAggregations;
				if (!bIsAggregation) {
					var oMetadata = this._getControlMetadataInXml(oCurrentNode);
					oAggregations = oMetadata.getAllAggregations();
				}
				var aChildren = this._getElementNodeChildren(oCurrentNode);
				aChildren.forEach(function(oChild) {
					var bIsCurrentNodeAggregation = oAggregations && oAggregations[oChild.localName];
					recurse.call(this, oCurrentNode, oChild, bIsCurrentNodeAggregation);
					// if it's an aggregation, we don't call the callback function
					if (!bIsCurrentNodeAggregation) {
						fnCallback(oChild);
					}
				}.bind(this));
			}
			recurse.call(this, oRootNode, oRootNode, false);
		},

		//public methods for all modifiers, they are implemented in the sub classes:

		/**
		 * See {@link sap.ui.core.Control#setVisible} method
		 *
		 * @param {sap.ui.base.ManagedObject | Element} vControl Control representation
		 * @param {boolean} bVisible New value for property visible
		 * @public
		 */
		setVisible: function (vControl, bVisible) {},

		/**
		 * See {@link sap.ui.core.Control#getVisible} method
		 *
		 * @param {sap.ui.base.ManagedObject | Element} vControl Control representation
		 * @returns {boolean} whether the control's visible property is set or not
		 * @public
		 */
		getVisible: function (vControl) {},


		/**
		 * See {@link sap.ui.core.StashedControlSupport#setVisible} method
		 *
		 * @param {sap.ui.base.ManagedObject | Element} vControl Control representation
		 * @param {boolean} bVisible New value for property stashed
		 *
		 * @public
		 */
		setStashed: function (vControl, bStashed) {},

		/**
		 * See {@link sap.ui.core.StashedControlSupport#getVisible} method
		 *
		 * @param {sap.ui.base.ManagedObject | Element} vControl Control representation
		 * @returns {boolean} whether the control is stashed or not
		 * @public
		 */
		getStashed: function (vControl) {},

		/**
		 * See {@link sap.ui.base.ManagedObject#bindProperty} method
		 *
		 * @param {sap.ui.base.ManagedObject | Element} vControl Control representation
		 * @param {string} sPropertyName property name
		 * @param {object} vBindingInfos binding info
		 * @public
		 */
		bindProperty: function (vControl, sPropertyName, vBindingInfos) {},

		/**
		 * See {@link sap.ui.base.ManagedObject#unbindProperty} method
		 *
		 * @param {sap.ui.base.ManagedObject | Element} vControl Control representation
		 * @param  {string} sPropertyName  The property to be unbound
		 */
		unbindProperty: function (vControl, sPropertyName) {},

		/**
		 * See {@link sap.ui.base.ManagedObject#setProperty} method
		 *
		 * @param {sap.ui.base.ManagedObject | Element} vControl Control representation
		 * @param {string} sPropertyName property name
		 * @param {any} vPropertyValue new value for the property
		 * @public
		 */
		setProperty: function (vControl, sPropertyName, vPropertyValue) {},

		/**
		 * See {@link sap.ui.base.ManagedObject#getProperty} method
		 *
		 * @param {sap.ui.base.ManagedObject | Element} vControl Control representation
		 * @param {string} sPropertyName property name
		 * @returns {any} value of the property
		 * @public
		 */
		getProperty: function (vControl, sPropertyName)  {},

		/**
		 * See {@link sap.ui.base.ManagedObject#isPropertyInitial} method
		 *
		 * @param {sap.ui.base.ManagedObject | Element} vControl Control representation
		 * @param {string} sPropertyName property name
		 * @returns {boolean} <code>true</code> if the property is initial
		 * @public
		 */
		isPropertyInitial: function (oControl, sPropertyName) {},

		/**
		 * Similar as {@link #bindProperty}, but allows to specify binding like in control constructor
		 *
		 * @param {sap.ui.base.ManagedObject | Element} vControl Control representation
		 * @param {string} sPropertyName property name
		 * @param {any} vPropertyBinding See {@link sap.ui.base.ManagedObject#extractBindingInfo} method
		 * @public
		 */
		setPropertyBinding: function (vControl, sPropertyName, vPropertyBinding) {},

		/**
		 * See {@link sap.ui.base.ManagedObject#getBindingInfo} method
		 *
		 * @param {sap.ui.base.ManagedObject | Element} vControl Control representation
		 * @param {string} sPropertyName property name
		 * @returns {any} binding Info
		 * @public
		 */
		getPropertyBinding: function (vControl, sPropertyName) {},


		/**
		 * Creates the control in the corresponding representation
		 *
		 * @param {string} sClassName Class name for the control (for example, <code>sap.m.Button</code>), ensure the class is loaded to avoid sync requests
		 * @param {sap.ui.core.UIComponent} [oAppComponent] - Needed to calculate the correct ID in case you provide an id
		 * @param {Element} [oView] XML node of the view, required for XML case to create nodes and to find elements
		 * @param {object} [oSelector] - Selector to calculate the ID for the control that is being created
		 * @param {string} [oSelector.id] - Control ID targeted by the change
		 * @param {boolean} [oSelector.isLocalId] - True if the ID within the selector is a local ID or a global ID
		 * @param {object} [mSettings] Further settings or properties for the control that is being created
		 * @returns {Element} XML node of the control being created
		 * @public
		 */
		createControl: function (sClassName, oAppComponent, oView, oSelector, mSettings) {},


		/**
		 * See {@link sap.ui.base.ManagedObject#getId} method
		 *
		 * @param {sap.ui.base.ManagedObject | Element} vControl Control representation
		 * @returns {string} ID
		 * @public
		 */
		getId: function (vControl) {},

		/**
		 * See {@link sap.ui.base.ManagedObject#getParent} method
		 *
		 * @param {sap.ui.base.ManagedObject | Element} vControl Control representation
		 * @returns {sap.ui.base.ManagedObject | Element} parent control in it's representation
		 * @public
		 */
		getParent: function (vControl) {},

		/**
		 * See {@link sap.ui.base.Metadata#getName} method
		 *
		 * @param {sap.ui.base.ManagedObject | Element} vControl Control representation
		 * @returns {string} control type
		 * @public
		 */
		getControlType: function (vControl) {},

		/**
		 * See {@link sap.ui.base.ManagedObjectMetadata#getAllAggregations} method
		 *
		 * @param {sap.ui.base.ManagedObject | Element} vControl Control representation
		 * @return {map} Map of aggregation info objects keyed by aggregation names
		 * @public
		 */
		getAllAggregations: function (vControl) {},

		/**
		 * See {@link sap.ui.base.ManagedObject#getAggregation} method
		 *
		 * @param {sap.ui.base.ManagedObject | Element}
		 *          vParent The control which has the aggregation
		 * @param {string}
		 *          sName Aggregation name
		 *
		 * @returns {sap.ui.base.ManagedObject[] | Element[]} the aggregation content
		 * @public
		 */
		getAggregation: function (vParent, sName) {},


		/**
		 * See {@link sap.ui.base.ManagedObject#insertAggregation} method
		 *
		 * @param {sap.ui.base.ManagedObject | Element} vParent The control which has the aggregation
		 * @param {string} sAggregationName Aggregation name
		 * @param {sap.ui.base.ManagedObject | Element} oObject XML node or element of the control that will be inserted
		 * @param {int} iIndex Index for <code>oObject</code> in the aggregation
		 * @param {Element} [oView] xml node/element of the view - needed in XML case to potentially create (aggregation) nodes
		 * @public
		 */
		insertAggregation: function (vParent, sAggregationName, oObject, iIndex, oView) {},


		/**
		 * See {@link sap.ui.base.ManagedObject#removeAggregation} method
		 * Removes the object from the aggregation of the given control
		 *
		 * @param {sap.ui.base.ManagedObject | Element}
		 *          vParent - control representation
		 * @param {string}
		 *          sAggregationName - aggregation name
		 * @param {sap.ui.base.ManagedObject | Element}
		 *          oObject - aggregated object to be set
		 * @public
		 */
		removeAggregation: function (vParent, sAggregationName, oObject) {},

		/**
		 * See {@link sap.ui.base.ManagedObject#removeAllAggregation} method
		 * Removes alls objects from the aggregation of the given control
		 *
		 * @param {sap.ui.base.ManagedObject | Element}
		 *          vParent - control representation
		 * @param {string}
		 *          sAggregationName - aggregation name
		 * @public
		 */
		removeAllAggregation: function (vParent, sAggregationName) {},

		/**
		 * Get the binding template from an aggregation
		 * See {@link sap.ui.base.ManagedObject#getBindingInfo} method
		 *
		 * @param {sap.ui.base.ManagedObject | Element}
		 *          vControl - control representation
		 * @param {string}
		 *          sAggregationName - aggregation name
		 * @public
		 */
		getBindingTemplate: function (vControl, sAggregationName) {},

		/**
		 * See {@link sap.ui.base.ManagedObject#updateAggregation} method
		 *
		 * @param {sap.ui.base.ManagedObject | Element}
		 *          vParent - control representation
		 * @param {string}
		 *          sAggregationName - aggregation name
		 * @public
		 */
		updateAggregation: function (vParent, sAggregationName) {},

		/**
		 * Finds the index of the control in it's parent aggregation
		 *
		 * @param {sap.ui.base.ManagedObject | Element}
		 *          vParent - control representation
		 * @returns {int} index of the control
		 * @public
		 */
		findIndexInParentAggregation: function (vControl) {},

		/**
		 * Removes alls objects from the aggregation of the given control
		 *
		 * @param {sap.ui.base.ManagedObject | Element}
		 *          vControl - control representation
		 * @param {sap.ui.base.ManagedObject | Element}
		 *          [vParent] - control representation of the parent only needed in XML case
		 * @returns {string}
		 *          parent aggregation name
		 * @public
		 */
		getParentAggregationName: function (vControl, vParent) {},

		/**
		 * Validates if the control has the correct type for the aggregation.
		 *
		 * @param {sap.ui.base.ManagedObject | Element} vControl control whose type is to be checked
		 * @param {object} mAggregationMetadata Aggregation info object
		 * @param {sap.ui.base.ManagedObject | Element} vParent parent of the control
		 * @param {string} sFragment path to the fragment that contains the control, whose type is to be checked
		 * @param {int} iIndex index of the current control in the parent aggregation
		 * @returns {boolean} Returns true if the type matches
		 * @public
		 */
		validateType: function(vControl, mAggregationMetadata, vParent, sFragment, iIndex) {},

		/**
		 * Loads a fragment and turns the result into an array of nodes. Also prefixes all the controls with a given namespace
		 * Throws an Error if there is at least one control in the fragment without stable ID
		 *
		 * @param {string} sFragment xml fragment as string
		 * @param {string} sNamespace namespace of the app
		 * @param {sap.ui.core.mvc.View} [oView] view for the fragment, only needed in JS case
		 * @returns {Element[]} Returns an array with the nodes of the controls of the fragment
		 * @public
		 */
		instantiateFragment: function(sFragment, sNamespace, oView) {},

		/**
		 * Returns the module path of an instance specific change handler
		 *
		 * @param {sap.ui.base.ManagedObject | Element} vControl control representation
		 * @returns {string} module path
		 * @public
		 */
		getChangeHandlerModulePath: function(vControl) {}

	};
});

