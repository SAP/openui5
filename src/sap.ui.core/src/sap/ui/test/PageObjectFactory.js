/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/ui/thirdparty/jquery',
	'sap/ui/test/Opa',
	'sap/ui/base/Object',
	"sap/base/Log"
], function($, Opa, Ui5Object, Log) {
		"use strict";

		/**
		 * @class Page Object Factory.
		 * @extends sap.ui.base.Object
		 * @protected
		 * @alias sap.ui.test.PageObjectFactory
		 * @author SAP SE
		 * @since 1.26
		 */
		var PageObjectFactory = Ui5Object.extend("sap.ui.test.PageObjectFactory");

		/**
		 * Creates a set of page objects, each consisting of actions and assertions, and adds them to
		 * the Opa configuration.
		 *
		 * Use page objects to structure your actions and assertions based on parts of the screen.
		 * This helps to avoid name clashes and to structure your tests.
		 *
		 * @see sap.ui.test.Opa5.createPageObjects
		 * @protected
		 * @param {Object<string,sap.ui.test.PageObjectDefinition>} mPageDefinitions Definitions of 1 or more page objects
		 * @param {sap.ui.test.Opa5} Opa5 Opa5 class, provided as parameter to avoid a circular dependency
		 * @returns {Object<string,Object>} Map of created page objects
		 */
		PageObjectFactory.create = function(mPageDefinitions, Opa5) {
			var mPageObjects = {};

			for (var sPageObjectName in mPageDefinitions) {
				if (mPageDefinitions.hasOwnProperty(sPageObjectName) && $.isEmptyObject(mPageObjects[sPageObjectName])) {

					mPageObjects[sPageObjectName] =  PageObjectFactory._createPageObject({
						name: sPageObjectName,
						baseClass: mPageDefinitions[sPageObjectName].baseClass || Opa5,
						namespace: mPageDefinitions[sPageObjectName].namespace || "sap.ui.test.opa.pageObject",
						view: _getViewData(mPageDefinitions[sPageObjectName]),
						actions: mPageDefinitions[sPageObjectName].actions,
						assertions: mPageDefinitions[sPageObjectName].assertions
					});
				}
			}

			return mPageObjects;
		};

		/**
		 * Create a single page object and add it to OPA configuration
		 * @private
		 * @function
		 * @param {object} mPage data for one page object
		 * @returns {object} page object
		 * @static
		 */
		PageObjectFactory._createPageObject = function (mPage) {
			var oPageObject = {};

			["actions", "assertions"].forEach(function (sOperationType) {
				var OperationPrototype = _createOperationPrototype(sOperationType, mPage);
				var oOperation = new OperationPrototype();
				_configureWaitFor(oOperation, mPage.view);
				_mixinTestLibraries(oOperation, sOperationType);
				_registerOperation(oOperation, sOperationType, mPage.name);
				oPageObject[sOperationType] = oOperation;
			});

			return oPageObject;
		};

		// inside the page object, arrangements, actions and assertions are instances of a certain prototype
		// by default, this prototype extends OPA5 (and therefore has a waitFor method)
		// create the prototype and assign to it all functions of the desired type that are defined for the page object
		function _createOperationPrototype(sOperationType, mPage) {
			var sClassName = _createClassName(mPage.namespace, mPage.name, sOperationType);
			var OperationPrototype = mPage.baseClass.extend(sClassName);

			for (var sMethod in mPage[sOperationType]) {
				if (mPage[sOperationType].hasOwnProperty(sMethod)) {
					OperationPrototype.prototype[sMethod] = mPage[sOperationType][sMethod];
				}
			}

			return OperationPrototype;
		}

		// create class name for an operation object
		function _createClassName(sNamespace, sPageObjectName, sOperationType) {
			var sClassName = sNamespace + "." + sPageObjectName + "." + sOperationType;
			var oObj = $.sap.getObject(sClassName,NaN);
			if (oObj){
				Log.error("Opa5 Page Object namespace clash: You have loaded multiple page objects with the same name '" + sClassName + "'. " +
					"To prevent override, specify the namespace parameter.");
			}
			return sClassName;
		}

		// add default values to the waitFor method of an operation instance
		function _configureWaitFor(oOperation, mView){
			if (!$.isEmptyObject(mView) && oOperation.waitFor) {
				var fnOriginalWaitFor = oOperation.waitFor;
				oOperation.waitFor = function (oOptions) {
					return fnOriginalWaitFor.call(this, $.extend(true, {}, mView, oOptions));
				};
			}
		}

		// add the operation to OPA config, so that later it can be used in opaTest
		function _registerOperation(oOperation, sOperationType, sPageObjectName) {
			if (sOperationType === "actions") {
				Opa.config.arrangements[sPageObjectName] = oOperation;
				Opa.config.actions[sPageObjectName] = oOperation;
			} else if (sOperationType === "assertions") {
				Opa.config.assertions[sPageObjectName] = oOperation;
			}
		}

		// add test library methods to page objects
		// the methods are defined by a test library in Opa.config.testLibBase
		// add methods of all libraries that are configured by the test with Opa.config.testLibs
		// don't add methods of libraries whose modules are required, but are not configured in Opa.config.testLibs
		// the test libraries must be loaded and configured before the page object is created! (otherwise their methods won't be added)
		// the idea is to expose methods that the page objects can use to form more complex operations
		// the test library methods will be accessible via a property named after the test library, example:
		// - inside the page object: this.myTestLib.myMethod()
		// - in OPA config: Opa.config.actions.onTheViewModePage.myTestLib.myMethod()
		function _mixinTestLibraries(oOperation, sOperationType) {
			if (Opa.config.testLibs) {
				for (var sTestLib in Opa.config.testLibs) { // the test library is configured by the test
					if (Opa.config.testLibBase && !$.isEmptyObject(Opa.config.testLibBase[sTestLib])) { // the test library exposes methods
						// add a plain object property to the operation prototype, that will contain all methods of the desired type
						// the property name is with the same as the test library name
						var oOperationPrototype = Object.getPrototypeOf(oOperation);
						oOperationPrototype[sTestLib] = {};

						var mTestLibMethods = Opa.config.testLibBase[sTestLib][sOperationType];
						if (mTestLibMethods) { // the test library exposes methods of the desired type
							// all methods should be bound to the operation instance
							// to ensure that their waitFor has correctly configured waitFor default values
							for (var sMethod in mTestLibMethods) {
								if (mTestLibMethods.hasOwnProperty(sMethod)) {
									oOperationPrototype[sTestLib][sMethod] = mTestLibMethods[sMethod].bind(oOperation);
								}
							}
						}
					}
				}
			}
		}

		function _getViewData(mPageObject) {
			var mView = {};
			["viewName", "viewId"].forEach(function (sProp) {
				if (mPageObject[sProp]) {
					mView[sProp] = mPageObject[sProp];
				}
			});
			return mView;
		}

		return PageObjectFactory;
});
