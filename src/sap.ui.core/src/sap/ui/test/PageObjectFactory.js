/*!
 * ${copyright}
 */

sap.ui.define([
	'jquery.sap.global',
	'sap/ui/test/Opa',
	'sap/ui/base/Object',
	"sap/base/Log"
], function($, Opa, Ui5Object, Log) {
		"use strict";

		/**
		 * @class Page Object Factory
		 * @extends sap.ui.base.Object
		 * @protected
		 * @alias sap.ui.test.PageObjectFactory
		 * @author SAP SE
		 * @since 1.26
		 */
		var fnPageObjectFactory = Ui5Object.extend("sap.ui.test.PageObjectFactory");

		/**
		 * Create a page object configured as arrangement, action and assertion to the Opa.config.
		 * Use it to structure your arrangement, action and assertion based on parts of the screen to avoid name clashes and help structuring your tests.
		 * @see sap.ui.test.Opa5.createPageObjects
		 * @protected
		 * @function
		 * @static
		 */
		fnPageObjectFactory.create = function(mPageObjects, Opa5) {
			var oPageObject = {};
			for (var sPageObjectName in mPageObjects) {
				if (!mPageObjects.hasOwnProperty(sPageObjectName)) {
					continue;
				}

				var fnBaseClass =  mPageObjects[sPageObjectName].baseClass || Opa5;
				var sNamespace = mPageObjects[sPageObjectName].namespace || "sap.ui.test.opa.pageObject";
				var sViewName = mPageObjects[sPageObjectName].viewName || "";

				var mPageObjectActions = mPageObjects[sPageObjectName].actions;
				_registerOperationObject(mPageObjectActions, "actions", sPageObjectName, fnBaseClass, oPageObject, sNamespace, sViewName);

				var mPageObjectAssertions = mPageObjects[sPageObjectName].assertions;
				_registerOperationObject(mPageObjectAssertions, "assertions", sPageObjectName, fnBaseClass, oPageObject, sNamespace, sViewName);
			}
			return oPageObject;
		};

		/*
		 * Privates
		 */

		function _registerOperationObject (mPageObjectOperation, sOperationType, sPageObjectName, fnBaseClass, oPageObject, sNamespace, sViewName) {
			if (mPageObjectOperation){

				var sClassName = _createClassName(sNamespace, sPageObjectName, sOperationType);

				var oOperationsPageObject = _createPageObject(mPageObjectOperation, sClassName, fnBaseClass, sViewName);

				_registerPageObject(oOperationsPageObject, sOperationType, sPageObjectName, oPageObject);
			}
		}

		function _createClassName(sNamespace, sPageObjectName, sOperationType) {
			var sClassName = sNamespace + "." + sPageObjectName + "." + sOperationType;
			//TODO: global jquery call found
			var oObj = $.sap.getObject(sClassName,NaN);
			if (oObj){
				Log.error("Opa5 Page Object namespace clash: You have loaded multiple page objects with the same name. To prevent overriding themself, specify the namespace parameter.");
			}
			return sClassName;
		}

		function _createPageObject (mPageObjectOperation, sClassName, fnBaseClass, sViewName){

			var OperationsPageObject = fnBaseClass.extend(sClassName);

			for (var sOperation in mPageObjectOperation) {
				if (mPageObjectOperation.hasOwnProperty(sOperation)) {
					OperationsPageObject.prototype[sOperation] = mPageObjectOperation[sOperation];
				}
			}

			var oOperationsPageObject = new OperationsPageObject();
			if (sViewName && oOperationsPageObject.waitFor) {
				var fnOriginalWaitFor = oOperationsPageObject.waitFor;
				oOperationsPageObject.waitFor = function (oOptions) {
					return fnOriginalWaitFor.call(this, $.extend(true, { viewName : sViewName}, oOptions));
				};
			}
			return oOperationsPageObject;
		}

		function _registerPageObject (oOperationsPageObject, sOperationType, sPageObjectName, oPageObject){
			if (sOperationType === "actions"){
				Opa.config.arrangements[sPageObjectName] = oOperationsPageObject;
				Opa.config.actions[sPageObjectName] = oOperationsPageObject;

			}else if (sOperationType === "assertions"){
				Opa.config.assertions[sPageObjectName] = oOperationsPageObject;
			}

			oPageObject[sPageObjectName] = oPageObject[sPageObjectName] || {};
			oPageObject[sPageObjectName][sOperationType] = oOperationsPageObject;
		}



		return fnPageObjectFactory;
});