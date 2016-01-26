/*!
 * ${copyright}
 */

sap.ui.define(['sap/ui/base/ManagedObject', 'sap/ui/qunit/QUnitUtils', 'sap/ui/test/Opa5'], function (ManagedObject, QUnitUtils, Opa5) {
	"use strict";

	/**
	 * @class Actions for Opa5 - needs to implement an executeOn function that should simulate a user interaction on a control
	 * @abstract
	 * @extends sap.ui.base.ManagedObject
	 * @public
	 * @name sap.ui.test.actions.Action
	 * @author SAP SE
	 * @since 1.34
	 */
	return ManagedObject.extend("sap.ui.test.actions.Action", {

		metadata : {
			publicMethods : [ "executeOn" ]
		},

		/**
		 * Checks if the matcher is matching - will get an instance of sap.ui.Control as parameter
		 * Should be overwritten by subclasses
		 *
		 * @param {sap.ui.core.Control} element the {@link sap.ui.core.Element} or a control (extends element) the action will be executed on
		 * @protected
		 * @name sap.ui.test.actions.Action#executeOn
		 * @function
		 */
		executeOn : function () {
			return true;
		},

		_getUtils : function () {
			return Opa5.getUtils() || QUnitUtils;
		},
		_sLogPrefix : "Opa5 actions"
	});

}, /* bExport= */ true);