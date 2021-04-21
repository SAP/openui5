/*
* ! ${copyright}
*/
sap.ui.define([
], function() {
	"use strict";

	/**
	 *  @class Utility class for state handling of MDC controls.
	 *  The <code>StateUtil</code> class is offering a generic way to retrieve states and set a desired state for a given MDC control.
	 *  The <code>StateUtil</code> class is tightly coupled to the SAPUI5 flexibility integration of MDC controls.
	 *  To use the APIs of <code>Stateutil</code>, the given MDC control instance needs to fully enable all available <code>p13nMode</code> options.
	 *  This way, <code>Stateutil</code> can create the required changes and retrieve the relevant state of each control.
	 *
	 * @author SAP SE
	 * @private
	 * @ui5-restricted sap.fe
	 * @MDC_PUBLIC_CANDIDATE
	 * @experimental As of version 1.77.0
	 * @since 1.77.0
	 * @alias sap.ui.mdc.p13n.StateUtil
	 */
	var StateUtil = {


		/**
		*	Creates and applies the necessary changes for a given control and state.
		*   <b>Note:</b>The changes are created in the same order as the objects are passed into
		*   the state object attributes. For example, by adding two objects
		*   into the <code>items</code> attribute of the <code>oState</code> object, the first entry is created,
		*   and the second entry is created on top of the first change.
		*   The item state is applied for each provided object in the given order in the array and uses
		*	the provided position. If no index or only an invalid index has been provided,
		*   the item is added to the array after the last item in the affected control's </code>item</code> aggregation.
		*	In addition the following attributes can be used to remove a state:
		*
		*	<ul>
		*	<li><code>sorted</code> - Set to <code>false</code>  in the <code>sorters</code> scope to remove a sorter/code>.</li>
		*	<li><code>grouped</code> - Set to <code>false</code>  in the <code>groupLevels</code> scope to remove a grouping.</li>
		*	<li><code>visible</code> - Set to <code>false</code>  to remove an aggregation item.</li>
		*	<li><code>aggregated</code> - Set to <code>false</code>  to remove an aggregation.</li>
		*	</ul>
		*
		* @private
		* @ui5-restricted sap.fe
		* @MDC_PUBLIC_CANDIDATE
		*
		* @param {object} oControl The control that is used to create changes and to which changes are made
		* @param {object} oState The state in which the control is represented
		*
		* @example
		* oState = {
		* 		filter: {
		* 			"Category": [
		* 				{
		* 					"operator": EQ,
		* 					"values": [
		* 						"Books"
		* 					]
		* 				}
		* 			]
		* 		},
		* 		items: [
		*			{name: "Category", position: 3},
		*			{name: "Country", visible: false}
		*       ],
		*       sorters: [
		*			{name: "Category", "descending": false},
		*			{name: "NoCategory", "descending": false, "sorted": false}
		*       ],
		*		groupLevels: [
		*			{name: "Category"},
		*			{name: "Country", grouped: false}
		*       ],
		*		aggregations: {
		*			Region: {},
		*			Country: {
		*				aggregated: false
		*			}
		*		}
		* }
		*
		* @returns {Promise} <code>Promise</code> that resolves after all changes have been applied
		*/
		applyExternalState: function(oControl, oState){
			return oControl.getEngine().applyState(oControl, StateUtil._internalizeKeys(oState));
		},

		/**
		 *  Retrieves the externalized state for a given control instance.
		 *  The retrieved state is equivalent to the <code>getCurrentState</code> API for the given control,
		 *  after all necessary changes have been applied (for example, variant appliance and <code>p13n, StateUtil</code> changes).
		 *  After the returned <code>Promise</code> has been resolved, the returned state is in sync with the according
		 *  state object of the MDC control (for example, <code>filterConditions</code> for the <code>FilterBar</code> control).
		 *
		 * @private
		 * @ui5-restricted sap.fe
		 * @MDC_PUBLIC_CANDIDATE
		 * @param {object} oControl The control instance implementing IxState to retrieve the externalized state
		 *
		 * @returns {Promise} <code>Promise</code> that resolves after the current state has been retrieved
		 */
		retrieveExternalState: function(oControl) {
			return oControl.getEngine().retrieveState(oControl).then(function(oEngineState){
				return StateUtil._externalizeKeys(oEngineState);
			});
		},

		_externalizeKeys: function(oInternalState) {
			var mKeysForState = {
				Sort: "sorters",
				Group: "groupLevels",
				Aggregate: "aggregations",
				Filter: "filter",
				Item: "items",
				Column: "items"
			};
			var oTransformedState = {};

			Object.keys(oInternalState).forEach(function(sProvidedEngineKey){
				var sExternalKey = mKeysForState[sProvidedEngineKey];
				var sTransformedKey = sExternalKey || sProvidedEngineKey;//no external key --> provide internal key
				oTransformedState[sTransformedKey] = oInternalState[sProvidedEngineKey];
			});

			return oTransformedState;
		},

		_internalizeKeys: function(oExternalState) {
			var mKeysForEngine = {
				sorters: ["Sort"],
				groupLevels: ["Group"],
				aggregations: ["Aggregate"],
				filter: ["Filter"],
				items: ["Item", "Column"]
			};

			var oTransformedState = {};

			Object.keys(oExternalState).forEach(function(sProvidedEngineKey){
				if (mKeysForEngine[sProvidedEngineKey]) {
					mKeysForEngine[sProvidedEngineKey].forEach(function(sTransformedKey){
						oTransformedState[sTransformedKey] = oExternalState[sProvidedEngineKey];
					});
				}
			});

			return oTransformedState;
		}

	};

	return StateUtil;
});
