/*!
 * ${copyright}
 */

sap.ui.define([
], function (
) {
	"use strict";

	/**
	 * Factory for the creation of <code>BasePropertyEditor</code> instances.
	 *
	 * @namespace sap.ui.integration.designtime.baseEditor.propertyEditor.PropertyEditorFactory
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @static
	 * @since 1.75
	 * @private
	 * @experimental Since 1.75
	 * @ui5-restricted
	 */

	var PropertyEditorFactory = {};

	var oLoadingPromisses = {};
	var oPropertyEditorClasses = {};

	/**
	 * Registers classes for the given editor types. If an editor type is already registered,
	 * it will be skipped and must first be deregistered using the <code>PropertyEditorFactory.deregisterType</code>
	 * function.
	 * @param {Object<string, string>} mTypes - Map containing pairs of editor type and the path to load the class from
	 * @returns {Promise<object>} Resolves with a map with name and object of the registered PropertyEditors
	 * @public
	 * @function
	 * @name sap.ui.integration.designtime.baseEditor.propertyEditor.PropertyEditorFactory.registerTypes
	 */
	PropertyEditorFactory.registerTypes = function (mTypes) {
		Object.keys(mTypes).forEach(function (sPropertyEditorType) {
			if (!oLoadingPromisses[sPropertyEditorType]) {
				oLoadingPromisses[sPropertyEditorType] = new Promise(function (resolve, reject) {
					sap.ui.require(
						[mTypes[sPropertyEditorType]],
						resolve,
						reject
					);
				}).then(function(oPropertyEditor) {
					oPropertyEditorClasses[oPropertyEditor.getMetadata().getName()] = oPropertyEditor;
					return oPropertyEditor;
				});
			}
		});

		return Promise.all(Object.values(oLoadingPromisses)).then(function() {
			return oPropertyEditorClasses;
		});
	};

	/**
	* Deregisters a type and removes the loaded property editor class.
	* @param {string} sType - Editor type to deregister
	* @public
	* @function
	* @name sap.ui.integration.designtime.baseEditor.propertyEditor.PropertyEditorFactory.deregisterType
	*/
	PropertyEditorFactory.deregisterType = function (sType) {
		if (oLoadingPromisses[sType]) {
			delete oLoadingPromisses[sType];
		}
	};

	/**
	* Deregisters all editor types and removes the loaded classes.
	* @public
	* @function
	* @name sap.ui.integration.designtime.baseEditor.propertyEditor.PropertyEditorFactory.deregisterAllTypes
	*/
	PropertyEditorFactory.deregisterAllTypes = function () {
		oLoadingPromisses = {};
	};

	/**
	* Creates a new <code>BasePropertyEditor</code> instance of the given editor type.
	* @param {string} sPropertyType - Type of the property editor to create
	* @returns {Promise<sap.ui.integration.designtime.baseEditor.propertyEditor.BasePropertyEditor>} Promise resolving to the created editor
	* @public
	* @function
	* @name sap.ui.integration.designtime.baseEditor.propertyEditor.PropertyEditorFactory.create
	*/
	PropertyEditorFactory.create = function (sPropertyType) {
		return new Promise(function (resolve, reject) {
			if (!sPropertyType) {
				reject("No editor type was specified in the property configuration.");
				return;
			}
			if (!oLoadingPromisses[sPropertyType]) {
				reject("Editor type was not registered");
				return;
			}
			oLoadingPromisses[sPropertyType]
				.then(function (PropertyEditorClass) {
					return resolve(new PropertyEditorClass());
				})
				.catch(function (vError) {
					return reject(vError);
				});
		});
	};

	PropertyEditorFactory.getByClassName = function(sType) {
		return oPropertyEditorClasses[sType];
	};

	/**
	 * Retrieves all registered types.
	 * @returns {Object<string, Promise<sap.ui.integration.designtime.baseEditor.propertyEditor.BasePropertyEditor>>} List of registered types
	 */
	PropertyEditorFactory.getTypes = function () {
		return Object.assign({}, oLoadingPromisses);
	};

	/**
	 * Checks if specified type is registered already in the factory.
	 * @param {string} sPropertyType - Property editor type, e.g. "string" / "icon" / etc.
	 * @returns {boolean} <code>true</code> if the specified type is registered
	 */
	PropertyEditorFactory.hasType = function (sPropertyType) {
		return Object.keys(PropertyEditorFactory.getTypes()).includes(
			sPropertyType
		);
	};

	return PropertyEditorFactory;
});