/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/base/ManagedObject",
	"sap/ui/base/ManagedObjectMetadata",
	"sap/base/util/ObjectPath",
	"sap/ui/util/XMLHelper",
	"sap/base/util/isPlainObject",
	"sap/base/Log"
], function(
	ManagedObject,
	ManagedObjectMetadata,
	ObjectPath,
	XMLHelper,
	isPlainObject,
	Log
) {

	"use strict";

	/**
	 * Abstract static utility class to access <code>ManagedObjects</code> and <code>XMLNodes</code> that represent
	 * <code>ManagedObjects</code> in a harmonized way.
	 *
	 * The class mirrors the <code>ManagedObject</code> API so that code that needs to work with <code>ManagedObjects</code>
	 * in several representations can be written in a harmonized way. The slight differences are handled
	 * by specifying a super set of parameters that might not be needed in all use cases.
	 * For example <code>sap.ui.fl</code> uses this class and its subtypes for change handlers that can be
	 * applied on <code>XMLViews</code> and normal <code>ManagedObject</code> instances.
	 *
	 * @namespace sap.ui.core.util.reflection.BaseTreeModifier
	 * @private
	 * @ui5-restricted sap.ui.fl, sap.ui.rta, sap.ui.model.meta, control change handler and provider
	 * @since 1.56.0
	 */
	return /** @lends sap.ui.core.util.reflection.BaseTreeModifier */{

		/** Function determining the control targeted by the change.
		* The function distinguishes between local IDs generated starting with 1.40 and the global IDs generated in previous versions.
		*
		* @param {object} oSelector - Target of a flexibility change
		* @param {string} oSelector.id - ID of the control targeted by the change
		* @param {boolean} oSelector.isLocalId - <code>true</code> if the ID within the selector is a local ID or a global ID
		* @param {sap.ui.core.UIComponent} oAppComponent - Application component
		* @param {Element} oView - For XML processing only: XML node of the view
		* @returns {sap.ui.base.ManagedObject|Element} Control representation targeted within the selector
		* @throws {Error} In case no control could be determined, an error is thrown
		* @public
		*/
		bySelector: function (oSelector, oAppComponent, oView) {
			var sControlId = this.getControlIdBySelector(oSelector, oAppComponent);
			return this._byId(sControlId, oView);
		},

		/** Function determining the control ID from the selector.
		* The function distinguishes between local IDs generated starting with 1.40 and the global IDs generated in previous versions.
		* @param {object} oSelector - Target of a flexiblity change
		* @param {string} oSelector.id - ID of the control targeted by the change
		* @param {boolean} oSelector.isLocalId - <code>true</code> if the ID within the selector is a local ID or a global ID
		* @param {sap.ui.core.UIComponent} oAppComponent - Application component
		* @returns {string} ID of the control
		* @throws {Error} In case no control could be determined, an error is thrown
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


		/** Function for determining the selector that is used later to apply a change for a given control.
		 * The function distinguishes between local IDs generated starting with 1.40 and the global IDs generated in previous versions.
		 *
		 * @param {sap.ui.base.ManagedObject|Element|string} vControl - Control or ID string for which the selector should be determined
		 * @param {sap.ui.core.Component} oAppComponent - Application component, needed only if <code>vControl</code> is a string or XML node
		 * @param {object} [mAdditionalSelectorInformation] - Additional mapped data which is added to the selector
		 * @returns {object} oSelector
		 * @returns {string} oSelector.id - ID used to determine the flexibility target
		 * @returns {boolean} oSelector.idIsLocal - <code>true</code> if the <code>selector.id</code> has to be concatenated with the application component ID while applying the change
		 * @throws {Error} In case no control could be determined, an error is thrown
		 * @public
		 */
		getSelector: function (vControl, oAppComponent, mAdditionalSelectorInformation) {
			var sControlId = vControl;
			if (typeof sControlId !== "string") {
				sControlId = (vControl) ? this.getId(vControl) : undefined;
			} else if (!oAppComponent) {
				throw new Error("App Component instance needed to get a selector from string ID");
			}

			if (mAdditionalSelectorInformation && (mAdditionalSelectorInformation.id || mAdditionalSelectorInformation.idIsLocal)) {
				throw new Error("A selector of control with the ID '" + sControlId + "' was requested, " +
					"but core properties were overwritten by the additionally passed information.");
			}

			var bValidId = this.checkControlId(sControlId, oAppComponent);
			if (!bValidId) {
				throw new Error("Generated ID attribute found - to offer flexibility a stable control ID is needed to assign the changes to, but for this control the ID was generated by SAPUI5 " + sControlId);
			}

			var oSelector = Object.assign({}, mAdditionalSelectorInformation, {
				id: "",
				idIsLocal: false
			});

			if (this.hasLocalIdSuffix(sControlId, oAppComponent)) {
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
		 * Checks if the control ID is generated or maintained by the application.
		 *
		 * @param {sap.ui.core.Control|string} vControl - Control instance or ID
		 * @param {sap.ui.core.Component} oAppComponent - <code>oAppComponent</code> application component, needed only if vControl is a string (ID)
		 * @returns {boolean} <code>true</code> if the ID is maintained by the application
		 * @protected
		 */
		checkControlId: function (vControl, oAppComponent) {
			var sControlId = vControl instanceof ManagedObject ? vControl.getId() : vControl;
			var bIsGenerated = ManagedObjectMetadata.isGeneratedId(sControlId);

			return !bIsGenerated || this.hasLocalIdSuffix(vControl, oAppComponent);
		},

		/**
		 * Checks if a control ID has a prefix matching the application component.
		 * If this prefix exists, the suffix after the component ID is called the local ID.
		 *
		 * @param {sap.ui.core.Control|string} vControl - Control or ID to be checked if it is within the generic application
		 * @param {sap.ui.core.UIComponent} oAppComponent - Application component, needed only if <code>vControl</code> is a string (ID)
		 * @returns {boolean} <code>true</code> if the control has a local ID
		 * @protected
		 */
		hasLocalIdSuffix: function (vControl, oAppComponent) {
			var sControlId = (vControl instanceof ManagedObject) ? vControl.getId() : vControl;

			if (!oAppComponent) {
				Log.error("Determination of a local ID suffix failed due to missing app component for " + sControlId);
				return false;
			}

			return !!oAppComponent.getLocalId(sControlId);
		},

		/**
		 * This function takes the fragment, goes through all the children and adds a prefix to the control's ID.
		 * Can also handle <code>FragmentDefinition</code> as root node, then all the children's IDs are prefixed.
		 * Adds a '.' at the end of the prefix to separate it from the original ID.
		 * Throws an error if any one of the controls in the fragment have no ID specified.
		 * Aggregations will be ignored and don't need an ID.
		 *
		 * @param {Element} oFragment - Fragment in XML
		 * @param {string} sIdPrefix - String that will be used to prefix the IDs
		 * @returns {Element} Original fragment in XML with updated IDs
		 */
		_checkAndPrefixIdsInFragment: function(oFragment, sIdPrefix) {
			var oParseError = XMLHelper.getParseError(oFragment);
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
		 * Gets all the children of an XML Node that are element nodes.
		 *
		 * @param {Element} oNode - XML node
		 * @returns {Element[]} Array with the children of the node
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
		 * @param {object} oElement - Element to be checked
		 * @param {string} sType - Type that the element should be checked against
		 * @returns {boolean} <code>true</code> if the element is an instance of the type
		 */
		_isInstanceOf: function(oElement, sType) {
			var oInstance = ObjectPath.get(sType);
			if (typeof oInstance === "function") {
				return oElement instanceof oInstance;
			} else {
				return false;
			}
		},

		/**
		 * Checks if the element has the interface.
		 *
		 * @param {object} oElement - Element
		 * @param {string} sInterface - Interface that should be in the element
		 * @returns {boolean} <code>true</code> if the element has the interface
		 */
		_hasInterface: function(oElement, sInterface) {
			var aInterfaces = oElement.getMetadata().getInterfaces();
			return aInterfaces.indexOf(sInterface) !== -1;
		},

		/**
		 * Gets the metadata of an XML control.
		 *
		 * @param {Element} oControl - Control in XML
		 * @returns {sap.ui.base.Metadata} Metadata of the control
		 */
		_getControlMetadataInXml: function(oControl) {
			var sControlType = this._getControlTypeInXml(oControl);
			jQuery.sap.require(sControlType);
			var ControlType = ObjectPath.get(sControlType);
			return ControlType.getMetadata();
		},

		/**
		 * Gets the metadata of a control.
		 *
		 * @param {sap.ui.base.ManagedObject|Element} vControl - Control representation
		 * @returns {sap.ui.base.Metadata} Metadata of the control
		 */
		getControlMetadata: function(vControl) {},

		/**
		 * Gets the library name for a control
		 *
		 * @param {sap.ui.base.ManagedObject|Element} vControl - Control representation
		 * @returns {string} library name
		 */
		getLibraryName: function(vControl) {
			var oMetadata = this.getControlMetadata(vControl);
			return oMetadata.getLibraryName();
		},


		/**
		 * Gets the <code>ControlType</code> of an XML control.
		 *
		 * @param {Element} oControl - Control in XML
		 * @returns {string} Control type as a string, e.g. <code>sap.m.Button</code>
		 */
		_getControlTypeInXml: function (oControl) {
			var sControlType = oControl.namespaceURI;
			sControlType = sControlType ? sControlType + "." : ""; // add a dot if there is already a prefix
			sControlType += oControl.localName;

			return sControlType;
		},

		/**
		 * Recursively goes through an XML tree and calls a callback function for every control inside.
		 * Does not call the callback function for aggregations.
		 *
		 * @param {function} fnCallback - Function that will be called for every control with the following arguments: <code>fnCallback(&lt;Element>)</code>
		 * @param {Element} oRootNode - Root node from which we start traversing the tree
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

		_getSerializedValue: function (vPropertyValue) {
			if (this._isSerializable(vPropertyValue) && typeof vPropertyValue !== "string") {
				//not a property like aggregation
				//type object can be json objects
				//should not be already stringified
				return JSON.stringify(vPropertyValue);
			}
			return vPropertyValue;
		},

		_isSerializable: function (vPropertyValue) {
			// check for plain object, array, primitives
			return isPlainObject(vPropertyValue) || Array.isArray(vPropertyValue) || Object(vPropertyValue) !== vPropertyValue;
		},

		/**
		 * Checks if there is a property binding and returns it if available, otherwise returns the value of the property.
		 *
		 * @param {sap.ui.base.ManagedObject|Element} vControl - Control representation
		 * @param {string} sPropertyName - Property name
		 * @returns {any} Binding info object or value of the property
		 * @public
		 */
		getPropertyBindingOrProperty: function(vControl, sPropertyName) {
			return this.getPropertyBinding(vControl, sPropertyName) || this.getProperty(vControl, sPropertyName);
		},

		/**
		 * Calls {@link sap.ui.core.util.reflection.BaseTreeModifier#setPropertyBinding} if the passed value is a
		 * binding info object or binding string,
		 * otherwise calls {@link sap.ui.core.util.reflection.BaseTreeModifier#setProperty}.
		 *
		 * @param {sap.ui.base.ManagedObject|Element} vControl - Control representation
		 * @param {string} sPropertyName - Property name
		 * @param {any} vBindingOrValue - Property binding or property value
		 * @public
		 */
		setPropertyBindingOrProperty: function(vControl, sPropertyName, vBindingOrValue) {
			var bIsBindingObject = vBindingOrValue && (vBindingOrValue.path || vBindingOrValue.parts);
			var bIsBindingString = vBindingOrValue && typeof vBindingOrValue === "string" && vBindingOrValue.substring(0, 1) === "{" && vBindingOrValue.slice(-1) === "}";

			var sOperation = bIsBindingObject || bIsBindingString ? "setPropertyBinding" : "setProperty";
			this[sOperation](vControl, sPropertyName, vBindingOrValue);
		},

		/**
		 * See {@link sap.ui.core.Control#setVisible} method.
		 *
		 * @param {sap.ui.base.ManagedObject|Element} vControl - Control representation
		 * @param {boolean} bVisible - New value for <code>visible</code> property
		 * @public
		 */
		setVisible: function (vControl, bVisible) {},

		/**
		 * See {@link sap.ui.core.Control#getVisible} method.
		 *
		 * @param {sap.ui.base.ManagedObject|Element} vControl - Control representation
		 * @returns {boolean} <code>true</code> if the control's <code>visible</code> property is set
		 * @public
		 */
		getVisible: function (vControl) {},

		/**
		 * See {@link sap.ui.core.StashedControlSupport#setVisible} method.
		 *
		 * @param {sap.ui.base.ManagedObject|Element} vControl - Control representation
		 * @param {boolean} bVisible - New value for <code>stashed</code> property
		 * @public
		 */
		setStashed: function (vControl, bStashed) {},

		/**
		 * See {@link sap.ui.core.StashedControlSupport#getVisible} method.
		 *
		 * @param {sap.ui.base.ManagedObject|Element} vControl - Control representation
		 * @returns {boolean} <code>true</code> if the control is stashed
		 * @public
		 */
		getStashed: function (vControl) {},

		/**
		 * See {@link sap.ui.base.ManagedObject#bindProperty} method.
		 *
		 * @param {sap.ui.base.ManagedObject|Element} vControl - Control representation
		 * @param {string} sPropertyName - Property name
		 * @param {object} vBindingInfos - Binding info
		 * @public
		 */
		bindProperty: function (vControl, sPropertyName, vBindingInfos) {},

		/**
		 * See {@link sap.ui.base.ManagedObject#unbindProperty} method.
		 *
		 * @param {sap.ui.base.ManagedObject|Element} vControl - Control representation
		 * @param  {string} sPropertyName - Property name to be unbound
		 * @public
		 */
		unbindProperty: function (vControl, sPropertyName) {},

		/**
		 * See {@link sap.ui.base.ManagedObject#bindAggregation} method.
		 *
		 * @param {sap.ui.base.ManagedObject|Element} vControl - Control representation
		 * @param {string} sAggregationName - Aggregation name
		 * @param {object} vBindingInfos - Binding info
		 * @public
		 */
		bindAggregation: function (vControl, sAggregationName, vBindingInfos) {},

		/**
		 * See {@link sap.ui.base.ManagedObject#unbindAggregation} method.
		 *
		 * @param {sap.ui.base.ManagedObject|Element} vControl - Control representation
		 * @param {string} sAggregationName - Aggregation name to be unbound
		 * @public
		 */
		unbindAggregation: function (vControl, sAggregationName) {},

		/**
		 * See {@link sap.ui.base.ManagedObject#setProperty} method.
		 *
		 * @param {sap.ui.base.ManagedObject|Element} vControl - Control representation
		 * @param {string} sPropertyName - Property name
		 * @param {*} vPropertyValue - New value for the property
		 * @public
		 */
		setProperty: function (vControl, sPropertyName, vPropertyValue) {},

		/**
		 * See {@link sap.ui.base.ManagedObject#getProperty} method.
		 *
		 * @param {sap.ui.base.ManagedObject|Element} vControl - Control representation
		 * @param {string} sPropertyName - Property name
		 * @returns {any} Value of the property
		 * @public
		 */
		getProperty: function (vControl, sPropertyName)  {},

		/**
		 * See {@link sap.ui.base.ManagedObject#isPropertyInitial} method.
		 *
		 * @param {sap.ui.base.ManagedObject|Element} vControl - Control representation
		 * @param {string} sPropertyName - Property name
		 * @returns {boolean} <code>true</code> if the property is initial
		 * @public
		 */
		isPropertyInitial: function (oControl, sPropertyName) {},

		/**
		 * Similar as {@link #bindProperty}, but allows to specify binding like in control constructor.
		 *
		 * @param {sap.ui.base.ManagedObject|Element} vControl - Control representation
		 * @param {string} sPropertyName - Property name
		 * @param {any} vPropertyBinding - See {@link sap.ui.base.ManagedObject#extractBindingInfo} method
		 * @public
		 */
		setPropertyBinding: function (vControl, sPropertyName, vPropertyBinding) {},

		/**
		 * See {@link sap.ui.base.ManagedObject#getBindingInfo} method.
		 *
		 * @param {sap.ui.base.ManagedObject|Element} vControl - Control representation
		 * @param {string} sPropertyName - Property name
		 * @returns {*} Binding info
		 * @public
		 */
		getPropertyBinding: function (vControl, sPropertyName) {},

		/**
		 * Creates the control in the corresponding representation.
		 *
		 * @param {string} sClassName - Class name for the control (for example, <code>sap.m.Button</code>), ensures that the class is loaded (no synchronous requests are called)
		 * @param {sap.ui.core.UIComponent} [oAppComponent] - Needed to calculate the correct ID in case you provide an ID
		 * @param {Element} [oView] - XML node of the view, required for XML case to create nodes and to find elements
		 * @param {object} [oSelector] - Selector to calculate the ID for the control that is created
		 * @param {string} [oSelector.id] - Control ID targeted by the change
		 * @param {boolean} [oSelector.isLocalId] - <code>true</code> if the ID within the selector is a local ID or a global ID
		 * @param {object} [mSettings] - Further settings or properties for the control that is created
		 * @param {boolean} bAsync - Determines whether a synchronous (promise) or an asynchronous value should be returned
		 * @returns {Element|Promise} Element or promise with element of the control that is created
		 * @public
		 */
		createControl: function (sClassName, oAppComponent, oView, oSelector, mSettings, bAsync) {},

		/**
		 * See {@link sap.ui.base.ManagedObject#applySettings} method.
		 *
		 * @param {sap.ui.base.ManagedObject|Element} vControl - Control representation
		 * @param {object} mSettings - Further settings or properties for the control
		 * @returns {Element} XML node of the control being created
		 * @public
		 */
		applySettings: function(vControl, mSettings) {},

		/**
		 * Returns the control for the given ID. Consider using {@link sap.ui.core.util.reflection.BaseTreeModifier.js#bySelector} instead if possible.
		 *
		 * @param {string} sId - Control ID
		 * @param {Element} oView - View that the control belongs to
		 * @returns {sap.ui.core.Element|Element} - Control instance or element node or <code>undefined</code> if control cannot be found
		 * @private
		 */
		_byId: function (sId, oView) {},

		/**
		 * See {@link sap.ui.base.ManagedObject#getId} method.
		 *
		 * @param {sap.ui.base.ManagedObject|Element} vControl - Control representation
		 * @returns {string} ID
		 * @public
		 */
		getId: function (vControl) {},

		/**
		 * See {@link sap.ui.base.ManagedObject#getParent} method.
		 *
		 * @param {sap.ui.base.ManagedObject|Element} vControl - Control representation
		 * @returns {sap.ui.base.ManagedObject|Element} Parent control in its representation
		 * @public
		 */
		getParent: function (vControl) {},

		/**
		 * See {@link sap.ui.base.Metadata#getName} method.
		 *
		 * @param {sap.ui.base.ManagedObject|Element} vControl - Control representation
		 * @returns {string} Control type
		 * @public
		 */
		getControlType: function (vControl) {},

		/**
		 * See {@link sap.ui.base.ManagedObject#setAssociation} method.
		 *
		 * @param {sap.ui.base.ManagedObject|Element} vParent - Control which has the association
		 * @param {string} sName - Association name
		 * @param {string|sap.ui.base.ManagedObject|Element} sId - ID of the managed object that is set as an association, or the managed object or XML node itself or <code>null</code>
		 * @public
		 */
		setAssociation: function (vParent, sName, sId) {},

		/**
		 * See {@link sap.ui.base.ManagedObject#getAssociation} method.
		 *
		 * @param {sap.ui.base.ManagedObject|Element} vParent - Control which has the association
		 * @param {string} sName - Association name
		 * @returns {string|string[]} ID of the associated managed object or an array of such IDs; may be null if the association has not been populated
		 * @public
		 */
		getAssociation: function (vParent, sName) {},

		/**
		 * See {@link sap.ui.base.ManagedObjectMetadata#getAllAggregations} method.
		 *
		 * @param {sap.ui.base.ManagedObject|Element} vControl - Control representation
		 * @return {Object<string,object>} Map of aggregation info objects keyed by aggregation names
		 * @public
		 */
		getAllAggregations: function (vControl) {},

		/**
		 * See {@link sap.ui.base.ManagedObject#getAggregation} method.
		 *
		 * @param {sap.ui.base.ManagedObject|Element} vParent - Control which has the aggregation
		 * @param {string} sName - Aggregation name
		 * @returns {sap.ui.base.ManagedObject[]|Element[]} Aggregation content
		 * @public
		 */
		getAggregation: function (vParent, sName) {},


		/**
		 * See {@link sap.ui.base.ManagedObject#insertAggregation} method.
		 *
		 * @param {sap.ui.base.ManagedObject|Element} vParent - Control which has the aggregation
		 * @param {string} sAggregationName - Aggregation name
		 * @param {sap.ui.base.ManagedObject|Element} oObject - XML node or element of the control that will be inserted
		 * @param {int} iIndex - Index for <code>oObject</code> in the aggregation
		 * @param {Element} [oView] - XML node of the view, needed in XML case to potentially create (aggregation) nodes
		 * @public
		 */
		insertAggregation: function (vParent, sAggregationName, oObject, iIndex, oView) {},


		/**
		 * Removes the object from the aggregation of the given control.
		 * See {@link sap.ui.base.ManagedObject#removeAggregation} method.
		 *
		 * @param {sap.ui.base.ManagedObject|Element} vParent - Control representation
		 * @param {string} sAggregationName - Aggregation name
		 * @param {sap.ui.base.ManagedObject|Element} oObject - Aggregated object to be set
		 * @public
		 */
		removeAggregation: function (vParent, sAggregationName, oObject) {},

		/**
		 * Removes all objects from the aggregation of the given control.
		 * See {@link sap.ui.base.ManagedObject#removeAllAggregation} method.
		 *
		 * @param {sap.ui.base.ManagedObject|Element} vParent - Control representation
		 * @param {string} sAggregationName - Aggregation name
		 * @public
		 */
		removeAllAggregation: function (vParent, sAggregationName) {},

		/**
		 * Gets the binding template from an aggregation.
		 * See {@link sap.ui.base.ManagedObject#getBindingInfo} method.
		 *
		 * @param {sap.ui.base.ManagedObject|Element} vControl - Control representation
		 * @param {string} sAggregationName - Aggregation name
		 * @public
		 */
		getBindingTemplate: function (vControl, sAggregationName) {},

		/**
		 * See {@link sap.ui.base.ManagedObject#updateAggregation} method.
		 *
		 * @param {sap.ui.base.ManagedObject|Element} vParent - Control representation
		 * @param {string} sAggregationName - Aggregation name
		 * @public
		 */
		updateAggregation: function (vParent, sAggregationName) {},

		/**
		 * Finds the index of the control in its parent aggregation.
		 *
		 * @param {sap.ui.base.ManagedObject|Element} vParent - Control representation
		 * @returns {int} Index of the control
		 * @public
		 */
		findIndexInParentAggregation: function (vControl) {},

		/**
		 * Removes all objects from the aggregation of the given control.
		 *
		 * @param {sap.ui.base.ManagedObject|Element} vControl - Control representation
		 * @param {sap.ui.base.ManagedObject|Element} [vParent] - Control representation of the parent only needed in XML case
		 * @returns {string} Parent aggregation name
		 * @public
		 */
		getParentAggregationName: function (vControl, vParent) {},

		/**
		 * Validates if the control has the correct type for the aggregation.
		 *
		 * @param {sap.ui.base.ManagedObject|Element} vControl - Control whose type is to be checked
		 * @param {object} mAggregationMetadata - Aggregation info object
		 * @param {sap.ui.base.ManagedObject|Element} vParent - Parent of the control
		 * @param {string} sFragment - Path to the fragment that contains the control whose type is to be checked
		 * @param {int} iIndex - Index of the current control in the parent aggregation
		 * @returns {boolean} <code>true</code> if the type matches
		 * @public
		 */
		validateType: function(vControl, mAggregationMetadata, vParent, sFragment, iIndex) {},

		/**
		 * Loads a fragment and turns the result into an array of nodes; also prefixes all the controls with a given namespace;
		 * throws an error if there is at least one control in the fragment without a stable ID or has a duplicate ID in the given view.
		 *
		 * @param {string} sFragment - XML fragment as string
		 * @param {string} sNamespace - Namespace of the app
		 * @param {sap.ui.core.mvc.View} oView - View for the fragment
		 * @returns {Element[]|sap.ui.core.Element[]} Array with the nodes/instances of the controls of the fragment
		 * @public
		 */
		instantiateFragment: function(sFragment, sNamespace, oView) {},

		/**
		 * Cleans up the resources associated with this object and all its aggregated children.
		 * See {@link sap.ui.base.ManagedObject#destroy} method.
		 *
		 * After an object has been destroyed, it can no longer be used!
		 * Applications should call this method if they don't need the object any longer.
		 *
		 * @param {sap.ui.base.ManagedObject|Element} vControl - Control representation
		 * @public
		 */
		destroy: function(vControl) {},

		/**
		 * Returns the module path of an instance specific change handler.
		 *
		 * @param {sap.ui.base.ManagedObject|Element} vControl - Control representation
		 * @returns {string} Module path
		 * @public
		 */
		getChangeHandlerModulePath: function(vControl) {},

		/**
		 * Attaches event on the specified <code>ManagedObject</code>.
		 *
		 * @param {sap.ui.base.ManagedObject|Element} vControl - Control representation
		 * @param {string} sEventName - Event name
		 * @param {string} sFunctionPath - Absolute path to a function
		 * @param {object} vData - Predefined values for event handler function
		 * @public
		 */
		attachEvent: function(oObject, sEventName, sFunctionPath, vData) {},

		/**
		 * Detaches event from the specified ManagedObject.
		 *
		 * @param {sap.ui.base.ManagedObject|Element} vControl - Control representation
		 * @param {string} sEventName - Event name
		 * @param {string} sFunctionPath - Absolute path to a function
		 * @public
		 */
		detachEvent: function(oObject, sEventName, sFunctionPath) {}
	};
});
