/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/base/ManagedObject",
	"sap/ui/base/ManagedObjectMetadata",
	"sap/ui/util/XMLHelper",
	"sap/ui/core/XMLTemplateProcessor",
	"sap/ui/core/util/XMLPreprocessor",
	"sap/base/util/isPlainObject",
	"sap/base/Log"
], function(
	ManagedObject,
	ManagedObjectMetadata,
	XMLHelper,
	XMLTemplateProcessor,
	XMLPreprocessor,
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
	 * @ui5-restricted sap.ui.fl, sap.ui.rta, sap.ui.model.meta, implementations of sap.ui.fl.interfaces.Delegate, control change handler and provider
	 * @since 1.56.0
	 */
	return /** @lends sap.ui.core.util.reflection.BaseTreeModifier */{

		/**
		 * Function determining the control targeted by the change. It is also possible to pass an extensionpoint selector.
		 * In this case an extension point is referenced in the selector but the parent control of the extensionpoint will be returned.
		 *
		 * @param {object} oSelector - Target of a flexibility change
		 * @param {string} [oSelector.id] - ID of the control targeted by the change. (name or id property is mandatory for selector)
		 * @param {boolean} [oSelector.isLocalId] - <code>true</code> if the ID within the selector is a local ID or a global ID
		 * @param {string} [oSelector.name] - Name of the extension point targeted by the change. (name or id property is mandatory for selector)
		 * @param {sap.ui.core.UIComponent} oAppComponent - Application component
		 * @param {Element} oView - For XML processing only: XML node of the view
		 * @returns {Promise<sap.ui.base.ManagedObject|Element>} Control representation targeted within the selector, wrapped in a Promise
		 * @throws {Error} In case no control could be determined, an error is thrown
		 * @public
		 */
		bySelectorExtensionPointEnabled: function (oSelector, oAppComponent, oView) {
			return Promise.resolve(this.bySelector(oSelector, oAppComponent, oView));
		},

		/**
		 * Function determining the control targeted by the change.
		 *
		 * @param {object} oSelector - Target of a flexibility change
		 * @param {string} [oSelector.id] - ID of the control targeted by the change. (name or id property is mandatory for selector)
		 * @param {boolean} [oSelector.isLocalId] - <code>true</code> if the ID within the selector is a local ID or a global ID
		 * @param {string} [oSelector.name] - Name of the extension point targeted by the change. (name or id property is mandatory for selector)
		 * @param {sap.ui.core.UIComponent} oAppComponent - Application component
		 * @param {Element} oView - For XML processing only: XML node of the view
		 * @returns {Promise<sap.ui.base.ManagedObject|Element>} Control representation targeted within the selector, wrapped in a Promise
		 * @throws {Error} In case no control could be determined, an error is thrown
		 * @public
		 */
		bySelectorTypeIndependent: function (oSelector, oAppComponent, oView) {
			var sControlId;
			return Promise.resolve()
				.then(function () {
					if (oSelector && oSelector.name) {
						oView = oView || this.bySelector(oSelector.viewSelector, oAppComponent);
						return this.getExtensionPointInfo(oSelector.name, oView)
							.then(function (oExtensionPointInfo) {
								return oExtensionPointInfo ? oExtensionPointInfo.parent : undefined;
							});
					}
					sControlId = this.getControlIdBySelector(oSelector, oAppComponent);
					return this._byId(sControlId, oView);
				}.bind(this));
		},

		/**
		 * Function determining the control targeted by the change.
		 *
		 * @param {object} oSelector - Target of a flexibility change
		 * @param {string} [oSelector.id] - ID of the control targeted by the change. (name or id property is mandatory for selector)
		 * @param {boolean} [oSelector.isLocalId] - <code>true</code> if the ID within the selector is a local ID or a global ID
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

		/**
		 * Function determining the control ID from the selector.
		 *
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
			}

			return sControlId;
		},

		/**
		 * Function for determining the selector that is used later to apply a change for a given control.
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
				return Promise.reject(new Error(oFragment.parseError.reason));
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
			var oPromiseChain = Promise.resolve();
			for (var i = 0, n = aRootChildren.length; i < n; i++) {
				oPromiseChain = oPromiseChain.then(this._traverseXmlTree.bind(this, oCallback, aRootChildren[i]));
			}

			return oPromiseChain.then(function () {
				for (var j = 0, m = aChildren.length; j < m; j++) {
					// aChildren[j].id is not available in IE11, therefore using .getAttribute/.setAttribute
					if (aChildren[j].getAttribute("id")) {
						aChildren[j].setAttribute("id", sIdPrefix + "." + aChildren[j].getAttribute("id"));
					} else {
						throw new Error("At least one control does not have a stable ID");
					}
				}

				return oControlNodes;
			});
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
		 * Gets the metadata of an XML control.
		 *
		 * @param {Element} oControl - Control in XML
		 * @returns {Promise<sap.ui.base.Metadata>} Resolves methadata of the control
		 */
		_getControlMetadataInXml: function(oControl) {
			var sControlType = this._getControlTypeInXml(oControl).replace(/\./g, "/");
			var oControlType = sap.ui.require(sControlType);
			if (oControlType && oControlType.getMetadata) {
				return Promise.resolve(oControlType.getMetadata());
			}
			return new Promise(function(fnResolve, fnReject) {
				sap.ui.require([sControlType],
					function(ControlType) {
						if (ControlType.getMetadata) {
							fnResolve(ControlType.getMetadata());
						}
						fnReject(new Error("getMetadata function is not available on control type"));
					},
					function() {
						fnReject(new Error("Required control '" + sControlType + "' couldn't be found"));
					}
				);
			});
		},

		/**
		 * Gets the metadata of a control.
		 *
		 * @abstract
		 * @param {sap.ui.base.ManagedObject|Element} vControl - Control representation
		 * @returns {Promise<sap.ui.base.Metadata>} Metadata of the control wrapped in a Promise
		 */
		getControlMetadata: function(vControl) {},

		/**
		 * Gets the library name for a control
		 *
		 * @param {sap.ui.base.ManagedObject|Element} vControl - Control representation
		 * @returns {Promise<string>} library name wrapped in a promise
		 */
		getLibraryName: function(vControl) {
			return this.getControlMetadata(vControl)
				.then(function (oMetadata) {
					return oMetadata.getLibraryName();
				});
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
		 * @returns {Promise} resolves when async processing is done
		 */
		_traverseXmlTree: function (fnCallback, oRootNode) {
			function recurse(oParent, oCurrentNode, bIsAggregation) {
				return Promise.resolve()
					.then(function () {
						if (!bIsAggregation) {
							return this._getControlMetadataInXml(oCurrentNode, true);
						}
						return undefined;
					}.bind(this))

					.then(function (oMetadata) {
						return oMetadata && oMetadata.getAllAggregations();
					})
					.then(function (aAggregations) {
						var aChildren = this._getElementNodeChildren(oCurrentNode);
						var oPromiseChain = Promise.resolve();
						aChildren.forEach(function(oChild) {
							var bIsCurrentNodeAggregation = aAggregations && aAggregations[oChild.localName];
							oPromiseChain = oPromiseChain.then(function() {
								return recurse.call(this, oCurrentNode, oChild, bIsCurrentNodeAggregation)
								.then(function () {
									// if it's an aggregation, we don't call the callback function
									if (!bIsCurrentNodeAggregation) {
										fnCallback(oChild);
									}
								});
							}.bind(this));
						}.bind(this));

						return oPromiseChain;
					}.bind(this));
			}
			return recurse.call(this, oRootNode, oRootNode, false);
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

		_escapeCurlyBracketsInString: function (vPropertyValue) {
			return typeof vPropertyValue === "string" ? vPropertyValue.replace(/({|})/g, "\\$&") : vPropertyValue;
		},

		_templateFragment: function(sFragmentName, mPreprocessorSettings) {
			return Promise.resolve(
				// process might be sync, therefore stay async and wrap result in a promise
				XMLPreprocessor.process(
					XMLTemplateProcessor.loadTemplate(sFragmentName, "fragment"),
					{ name: sFragmentName },
					mPreprocessorSettings
				)
			);
		},
		/**
		 * Checks if there is a property binding and returns it if available, otherwise returns the value of the property.
		 *
		 * @param {sap.ui.base.ManagedObject|Element} vControl - Control representation
		 * @param {string} sPropertyName - Property name
		 * @returns {Promise<any>} Binding info object or value of the property
		 * @public
		 */
		getPropertyBindingOrProperty: function(vControl, sPropertyName) {
			var oPropertyBinding = this.getPropertyBinding(vControl, sPropertyName);
			if (oPropertyBinding) {
				return Promise.resolve(oPropertyBinding);
			}
			return this.getProperty(vControl, sPropertyName);
		},

		/**
		 * Calls {@link sap.ui.core.util.reflection.BaseTreeModifier.setPropertyBinding} if the passed value is a
		 * binding info object or binding string,
		 * otherwise calls {@link sap.ui.core.util.reflection.BaseTreeModifier.setProperty}.
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
		 * @abstract
		 * @param {sap.ui.base.ManagedObject|Element} vControl - Control representation
		 * @param {boolean} bVisible - New value for <code>visible</code> property
		 * @public
		 */
		setVisible: function (vControl, bVisible) {},

		/**
		 * See {@link sap.ui.core.Control#getVisible} method.
		 *
		 * @abstract
		 * @param {sap.ui.base.ManagedObject|Element} vControl - Control representation
		 * @returns {Promise<boolean>} <code>true</code> if the control's <code>visible</code> property is set wrapped in promise
		 * @public
		 */
		getVisible: function (vControl) {},

		/**
		 * Sets the new value for stashed and visible.
		 *
		 * @abstract
		 * @param {sap.ui.base.ManagedObject|Element} vControl - Control representation
		 * @param {boolean} bStashed - New value for <code>stashed</code> property
		 * @public
		 */
		setStashed: function (vControl, bStashed) {},

		/**
		 * Retrieves the current value of the stashed property.
		 *
		 * @abstract
		 * @param {sap.ui.base.ManagedObject|Element} vControl - Control representation
		 * @returns {boolean} <code>true</code> if the control is stashed
		 * @public
		 */
		getStashed: function (vControl) {},

		/**
		 * See {@link sap.ui.base.ManagedObject#bindProperty} method.
		 *
		 * @abstract
		 * @param {sap.ui.base.ManagedObject|Element} vControl - Control representation
		 * @param {string} sPropertyName - Property name
		 * @param {object} vBindingInfos - Binding info
		 * @public
		 */
		bindProperty: function (vControl, sPropertyName, vBindingInfos) {},

		/**
		 * See {@link sap.ui.base.ManagedObject#unbindProperty} method.
		 *
		 * @abstract
		 * @param {sap.ui.base.ManagedObject|Element} vControl - Control representation
		 * @param  {string} sPropertyName - Property name to be unbound
		 * @public
		 */
		unbindProperty: function (vControl, sPropertyName) {},

		/**
		 * See {@link sap.ui.base.ManagedObject#bindAggregation} method.
		 *
		 * @abstract
		 * @param {sap.ui.base.ManagedObject|Element} vControl - Control representation
		 * @param {string} sAggregationName - Aggregation name
		 * @param {object} vBindingInfos - Binding info
		 * @returns {Promise} resolves when async processing is done
		 * @public
		 */
		bindAggregation: function (vControl, sAggregationName, vBindingInfos) {},

		/**
		 * See {@link sap.ui.base.ManagedObject#unbindAggregation} method.
		 *
		 * @abstract
		 * @param {sap.ui.base.ManagedObject|Element} vControl - Control representation
		 * @param {string} sAggregationName - Aggregation name to be unbound
		 * @returns {Promise} resolves when async processing is done
		 * @public
		 */
		unbindAggregation: function (vControl, sAggregationName) {},

		/**
		 * See {@link sap.ui.base.ManagedObject#setProperty} method.
		 *
		 * @abstract
		 * @param {sap.ui.base.ManagedObject|Element} vControl - Control representation
		 * @param {string} sPropertyName - Property name
		 * @param {*} vPropertyValue - New value for the property
		 * @public
		 */
		setProperty: function (vControl, sPropertyName, vPropertyValue) {},

		/**
		 * See {@link sap.ui.base.ManagedObject#getProperty} method.
		 *
		 * @abstract
		 * @param {sap.ui.base.ManagedObject|Element} vControl - Control representation
		 * @param {string} sPropertyName - Property name
		 * @returns {Promise<any>} Value of the property wrapped in a Pomise
		 * @public
		 */
		getProperty: function (vControl, sPropertyName)  {},

		/**
		 * See {@link sap.ui.base.ManagedObject#isPropertyInitial} method.
		 *
		 * @abstract
		 * @param {sap.ui.base.ManagedObject|Element} oControl - Control representation
		 * @param {string} sPropertyName - Property name
		 * @returns {boolean} <code>true</code> if the property is initial
		 * @public
		 */
		isPropertyInitial: function (oControl, sPropertyName) {},

		/**
		 * Similar as {@link #bindProperty}, but allows to specify binding like in control constructor.
		 *
		 * @abstract
		 * @param {sap.ui.base.ManagedObject|Element} vControl - Control representation
		 * @param {string} sPropertyName - Property name
		 * @param {any} vPropertyBinding - See source of <code>sap.ui.base.ManagedObject#extractBindingInfo</code> method
		 * @public
		 */
		setPropertyBinding: function (vControl, sPropertyName, vPropertyBinding) {},

		/**
		 * See {@link sap.ui.base.ManagedObject#getBindingInfo} method.
		 *
		 * @abstract
		 * @param {sap.ui.base.ManagedObject|Element} vControl - Control representation
		 * @param {string} sPropertyName - Property name
		 * @returns {*} Binding info
		 * @public
		 */
		getPropertyBinding: function (vControl, sPropertyName) {},


		/**
		 * Creates and add a Custom Data object to the control.
		 *
		 * @abstract
		 * @param {sap.ui.base.ManagedObject} oControl - Control representation
		 * @param {string} sCustomDataKey - Key for the Custom Data
		 * @param {string} sValue - Value for the Custom Data
		 * @param {sap.ui.core.Component} oAppComponent - App Component Instance
		 * @param {Promise} resolves when async processing is done
		 */
		createAndAddCustomData: function(oControl, sCustomDataKey, sValue, oAppComponent) {},

		/**
		 * Checks the custom data created via the {@link sap.ui.core.util.reflection.BaseTreeModifier.js#createAndAddCustomData}.
		 * If there is a custom data with the given key, an object with the following two properties is returned:
		 * customData: CustomData attribute / object
		 * customDataValue: Value of the CustomData
		 *
		 * @abstract
		 * @param {sap.ui.base.ManagedObject|Element} vControl - Control representation
		 * @param {string} sCustomDataKey - Key for the Custom Data
		 * @returns {object} Information about the custom data or an empty object
		 */
		getCustomDataInfo: function(vControl, sCustomDataKey) {},

		/**
		 * Creates the control in the corresponding representation.
		 *
		 * @abstract
		 * @param {string} sClassName - Class name for the control (for example, <code>sap.m.Button</code>), ensures that the class is loaded (no synchronous requests are called)
		 * @param {sap.ui.core.UIComponent} [oAppComponent] - Needed to calculate the correct ID in case you provide an ID
		 * @param {Element} [oView] - XML node of the view, required for XML case to create nodes and to find elements
		 * @param {object} [oSelector] - Selector to calculate the ID for the control that is created
		 * @param {string} [oSelector.id] - Control ID targeted by the change
		 * @param {boolean} [oSelector.isLocalId] - <code>true</code> if the ID within the selector is a local ID or a global ID
		 * @param {object} [mSettings] - Further settings or properties for the control that is created
		 * @returns {Promise<Element>} Promise with Element of the control that is created
		 * @public
		 */
		createControl: function (sClassName, oAppComponent, oView, oSelector, mSettings) {},

		/**
		 * See {@link sap.ui.base.ManagedObject#applySettings} method.
		 *
		 * @abstract
		 * @param {sap.ui.base.ManagedObject|Element} vControl - Control representation
		 * @param {object} mSettings - Further settings or properties for the control
		 * @returns {Promise<Element>} XML node of the control being created wrapped into promise
		 * @public
		 */
		applySettings: function(vControl, mSettings) {},

		/**
		 * Returns the control for the given ID. Consider using {@link sap.ui.core.util.reflection.BaseTreeModifier.js#bySelector} instead if possible.
		 *
		 * @abstract
		 * @param {string} sId - Control ID
		 * @param {Element} oView - View that the control belongs to
		 * @returns {sap.ui.core.Element|Element} - Control instance or element node or <code>undefined</code> if control cannot be found
		 * @private
		 */
		_byId: function (sId, oView) {},

		/**
		 * See {@link sap.ui.base.ManagedObject#getId} method.
		 *
		 * @abstract
		 * @param {sap.ui.base.ManagedObject|Element} vControl - Control representation
		 * @returns {string} ID
		 * @public
		 */
		getId: function (vControl) {},

		/**
		 * See {@link sap.ui.base.ManagedObject#getParent} method.
		 *
		 * @abstract
		 * @param {sap.ui.base.ManagedObject|Element} vControl - Control representation
		 * @returns {sap.ui.base.ManagedObject|Element} Parent control in its representation
		 * @public
		 */
		getParent: function (vControl) {},

		/**
		 * See {@link sap.ui.base.Metadata#getName} method.
		 *
		 * @abstract
		 * @param {sap.ui.base.ManagedObject|Element} vControl - Control representation
		 * @returns {string} Control type
		 * @public
		 */
		getControlType: function (vControl) {},

		/**
		 * See {@link sap.ui.base.ManagedObject#setAssociation} method.
		 *
		 * @abstract
		 * @param {sap.ui.base.ManagedObject|Element} vParent - Control which has the association
		 * @param {string} sName - Association name
		 * @param {string|sap.ui.base.ManagedObject|Element} sId - ID of the managed object that is set as an association, or the managed object or XML node itself or <code>null</code>
		 * @public
		 */
		setAssociation: function (vParent, sName, sId) {},

		/**
		 * See {@link sap.ui.base.ManagedObject#getAssociation} method.
		 *
		 * @abstract
		 * @param {sap.ui.base.ManagedObject|Element} vParent - Control which has the association
		 * @param {string} sName - Association name
		 * @returns {string|string[]|null} ID of the associated managed object or an array of such IDs; may be <code>null</code> if the association has not been populated
		 * @public
		 */
		getAssociation: function (vParent, sName) {},

		/**
		 * See {@link sap.ui.base.ManagedObjectMetadata#getAllAggregations} method.
		 *
		 * @abstract
		 * @param {sap.ui.base.ManagedObject|Element} vControl - Control representation
		 * @return {Promise<Object>} Map of aggregation info objects keyed by aggregation names wrapped in a Promise
		 * @public
		 */
		getAllAggregations: function (vControl) {},

		/**
		 * See {@link sap.ui.base.ManagedObject#getAggregation} method.
		 *
		 * @abstract
		 * @param {sap.ui.base.ManagedObject|Element} vParent - Control which has the aggregation
		 * @param {string} sName - Aggregation name
		 * @returns {Promise<sap.ui.base.ManagedObject[]|Element[]>} Aggregation content
		 * @public
		 */
		getAggregation: function (vParent, sName) {},


		/**
		 * See {@link sap.ui.base.ManagedObject#insertAggregation} method.
		 *
		 * @abstract
		 * @param {sap.ui.base.ManagedObject|Element} vParent - Control which has the aggregation
		 * @param {string} sAggregationName - Aggregation name
		 * @param {sap.ui.base.ManagedObject|Element} oObject - XML node or element of the control that will be inserted
		 * @param {int} iIndex - Index for <code>oObject</code> in the aggregation
		 * @param {Element} [oView] - XML node of the view, needed in XML case to potentially create (aggregation) nodes
		 * @param {boolean} [bSkipAdjustIndex] - true in case of inserting an XML node or element at an extension point, needed only in XML case
		 * @returns {Promise} resolves when async processing is done
		 * @public
		 */
		insertAggregation: function (vParent, sAggregationName, oObject, iIndex, oView, bSkipAdjustIndex) {},


		/**
		 * Removes the object from the aggregation of the given control.
		 * See {@link sap.ui.base.ManagedObject#removeAggregation} method.
		 *
		 * @abstract
		 * @param {sap.ui.base.ManagedObject|Element} vParent - Control representation
		 * @param {string} sAggregationName - Aggregation name
		 * @param {sap.ui.base.ManagedObject|Element} oObject - Aggregated object to be set
		 * @returns {Promise} resolves when async processing is done
		 * @public
		 */
		removeAggregation: function (vParent, sAggregationName, oObject) {},

		/**
		 * Removes the object from an aggregation of the source control and places it into an aggregation of the target control.
		 * This method is basically a removeAggregation followed by an insertAggregation, but the execution of both steps is
		 * done synchronously, avoiding issues with having elements without parents in asynchronous processes. The entire process
		 * is however asynchronous like other modifier actions.
		 *
		 * @abstract
		 * @param {sap.ui.base.ManagedObject|Element} vSourceParent - Control representation of the source parent
		 * @param {string} sSourceAggregationName - Source aggregation name
		 * @param {sap.ui.base.ManagedObject|Element} vTargetParent - Control representation of the target parent
		 * @param {string} sTargetAggregationName - Target aggregation name
		 * @param {sap.ui.base.ManagedObject|Element} oObject - Aggregated object to be moved
		 * @param {int} iIndex - Index for <code>oObject</code> in the target aggregation
		 * @param {Element} [oView] - XML node of the view, needed in XML case to potentially create (aggregation) nodes
		 * @param {boolean} [bSkipAdjustIndex] - true in case of inserting an XML node or element at an extension point, needed only in XML case
		 * @returns {Promise} resolves when async processing is done
		 * @public
		 */
		moveAggregation: function (vSourceParent, sSourceAggregationName, vTargetParent, sTargetAggregationName, oObject, iIndex, oView, bSkipAdjustIndex) {},

		/**
		 * Removes all objects from the aggregation of the given control.
		 * See {@link sap.ui.base.ManagedObject#removeAllAggregation} method.
		 *
		 * @abstract
		 * @param {sap.ui.base.ManagedObject|Element} vParent - Control representation
		 * @param {string} sAggregationName - Aggregation name
		 * @returns {Promise} resolves when async processing is done
		 * @public
		 */
		removeAllAggregation: function (vParent, sAggregationName) {},

		/**
		 * Gets the binding template from an aggregation.
		 * See {@link sap.ui.base.ManagedObject#getBindingInfo} method.
		 *
		 * @abstract
		 * @param {sap.ui.base.ManagedObject|Element} vControl - Control representation
		 * @param {string} sAggregationName - Aggregation name
		 * @returns {Promise} resolves when async processing is done
		 * @public
		 */
		getBindingTemplate: function (vControl, sAggregationName) {},

		/**
		 * See {@link sap.ui.base.ManagedObject#updateAggregation} method.
		 *
		 * @abstract
		 * @param {sap.ui.base.ManagedObject|Element} vParent - Control representation
		 * @param {string} sAggregationName - Aggregation name
		 * @returns {Promise} resolves when async processing is done
		 * @public
		 */
		updateAggregation: function (vParent, sAggregationName) {},

		/**
		 * Finds the index of the control in its parent aggregation.
		 *
		 * @abstract
		 * @param {sap.ui.base.ManagedObject|Element} vControl - Control representation
		 * @returns {Promise<int>} Index of the control wrapped in a Promise
		 * @public
		 */
		findIndexInParentAggregation: function (vControl) {},

		/**
		 * Removes all objects from the aggregation of the given control.
		 *
		 * @abstract
		 * @param {sap.ui.base.ManagedObject|Element} vControl - Control representation
		 * @param {sap.ui.base.ManagedObject|Element} [vParent] - Control representation of the parent only needed in XML case
		 * @returns {Promise<string>} Parent aggregation name wrapped in a Promise
		 * @public
		 */
		getParentAggregationName: function (vControl, vParent) {},

		/**
		 * Finds the aggregation by the given aggregation name.
		 *
		 * @abstract
		 * @param {sap.ui.base.ManagedObject|Element} oControl - Control representation
		 * @param {string} sAggregationName - Aggregation name to be found
		 * @returns {Promise} Aggregation object
		 */
		findAggregation: function(oControl, sAggregationName) {},

		/**
		 * Validates if the control has the correct type for the aggregation.
		 *
		 * @abstract
		 * @param {sap.ui.base.ManagedObject|Element} vControl - Control whose type is to be checked
		 * @param {object} mAggregationMetadata - Aggregation info object
		 * @param {sap.ui.base.ManagedObject|Element} vParent - Parent of the control
		 * @param {string} sFragment - Path to the fragment that contains the control whose type is to be checked
		 * @param {int} iIndex - Index of the current control in the parent aggregation
		 * @returns {Promise<boolean>} <code>true</code> if the type matches wrapped in a Promise
		 * @public
		 */
		validateType: function(vControl, mAggregationMetadata, vParent, sFragment, iIndex) {},

		/**
		 * Loads a fragment and turns the result into an array of nodes; also prefixes all the controls with a given namespace;
		 * throws an error if there is at least one control in the fragment without a stable ID or has a duplicate ID in the given view.
		 *
		 * @abstract
		 * @param {string} sFragment - XML fragment as string
		 * @param {string} sNamespace - Namespace of the app
		 * @param {sap.ui.core.mvc.View} oView - View for the fragment
		 * @returns {Element[]|sap.ui.core.Element[]} Array with the nodes/instances of the controls of the fragment
		 * @public
		 */
		instantiateFragment: function(sFragment, sNamespace, oView) {},

		/**
		 * Loads a fragment, processes the XML templating and turns the result into an array of nodes or controls.
		 * See {@link sap.ui.core.util.XMLPreprocessor.process}
		 *
		 * @abstract
		 * @param {string} sFragmentName - XML fragment name (e.g. some.path.fragmentName)
		 * @param {object} [mPreprocessorSettings={}] - Map/JSON object with initial property values, etc.
		 * @param {object} mPreprocessorSettings.bindingContexts - Binding contexts relevant for template pre-processing
		 * @param {object} mPreprocessorSettings.models - Models relevant for template pre-processing
		 * @param {sap.ui.core.mvc.View} oView - View for the fragment, only needed on JS side
		 * @returns {Promise.<Element[]|sap.ui.core.Element[]>} Array with the nodes/instances of the controls of the fragment
		 * @public
		 */
		templateControlFragment: function(sFragmentName, mPreprocessorSettings, oView) {},

		/**
		 * Cleans up the resources associated with this object and all its aggregated children.
		 * See {@link sap.ui.base.ManagedObject#destroy} method.
		 *
		 * After an object has been destroyed, it can no longer be used!
		 * Applications should call this method if they don't need the object any longer.
		 *
		 * @abstract
		 * @param {sap.ui.base.ManagedObject|Element} vControl - Control representation
		 * @param {boolean} [bSuppressInvalidate] if true, this ManagedObject is not marked as changed
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
		getChangeHandlerModulePath: function(vControl) {
			return this._getFlexCustomData(vControl, "flexibility");
		},

		/**
		 * Gets the "sap.ui.fl" namespaced special settings in the custom data.
		 *
		 * The method is not to be used directly, but to be implemented by modifiers
		 *
		 * @param {sap.ui.base.ManagedObject|Element} vControl - Control representation
		 * @protected
		 * @abstract
		 */
		_getFlexCustomData : function(vControl) {},

		/**
		 * Object containing delegate information.
		 *
		 * @typedef {object} sap.ui.core.util.reflection.FlexDelegateInfo
		 * @property {string[]} names Module names of the delegates
		 * @property {string} modelType Module type of the delegate
		 * @property {string} [delegateType] Delegate type ("readonly", "writeonly" or "complete")
		 * @property {object} payload Additional information for the delegate
		 * @property {string} [payload.path] Relative/absolute path to a node in a UI5 model, optional if it can be derived by the delegate, e.g. from binding context
		 * @property {string} [payload.modelName] Runtime model name, optional if default model is used (allows to support named models)
		 * @property {any} [payload.something] Payload can contain additional delegate-specific keys and values (not just "something" as a key, the key can be defined as well as the values)
		 * @private
		 * @ui5-restricted sap.ui.fl, sap.ui.rta, sap.ui.model.meta, implementations of sap.ui.fl.interfaces.Delegate, control change handler and provider
		 */

		/**
		 * Gets the flexibility delegate information placed at a control.
		 *
		 * @param {sap.ui.base.ManagedObject|Element} vControl - Control representation
		 * @returns {sap.ui.core.util.reflection.FlexDelegateInfo} Delegate information
		 * @public
		 */
		getFlexDelegate: function(vControl) {
			var mDelegateInfo;
			var sDelegate = this._getFlexCustomData(vControl, "delegate");
			if (typeof sDelegate === "string") {
				try {
					mDelegateInfo = JSON.parse(sDelegate);
					if (mDelegateInfo.payload === undefined){
						mDelegateInfo.payload = {};
					}
				} catch (oError) {
					Log.error("Flex Delegate for control " + this.getId(vControl) + " is malformed", oError.message);
				}
			}
			return mDelegateInfo;
		},

		/**
		 * Attaches event on the specified <code>ManagedObject</code>.
		 * To not rely on globals the function has to be passed in addition to the path.
		 *
		 * @abstract
		 * @param {sap.ui.base.ManagedObject|Element} vControl - Control representation
		 * @param {string} sEventName - Event name
		 * @param {string} sFunctionPath - Absolute path to a function
		 * @param {object} vData - Predefined values for event handler function
		 * @param {function} fnCallback - Callback function that is located at the function path
		 * @returns {Promise} Resolves when async processing is done
		 * @public
		 */
		attachEvent: function(vControl, sEventName, sFunctionPath, vData, fnCallback) {},

		/**
		 * Detaches event from the specified ManagedObject.
		 * To not rely on globals the function has to be passed in addition to the path.
		 *
		 * @abstract
		 * @param {sap.ui.base.ManagedObject|Element} vControl - Control representation
		 * @param {string} sEventName - Event name
		 * @param {string} sFunctionPath - Absolute path to a function
		 * @param {function} fnCallback - Callback function that is located at the function path
		 * @returns {Promise} Resolves when async processing is done
		 * @public
		 */
		detachEvent: function(vControl, sEventName, sFunctionPath, fnCallback) {},

		/**
		 * Returns an object containing parent control, aggregation name and index for controls to be added of the given extension point.
		 *
		 * @abstract
		 * @param {string} sExtensionPointName - Name of the extension point
		 * @param {sap.ui.core.mvc.View|Element} oView - View control or XML node of the view
		 * @returns {Promise<{parent: object, aggregation: string, index: number, defaultContent: array}>} - Object containing parent control, aggregation name, index and the defaultContent of the extensionpoint if exists. It is wrapped in a Promise
		 * @experimental
		 */
		getExtensionPointInfo: function(sExtensionPointName, oView) {}
	};
});
