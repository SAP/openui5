/*
* ! ${copyright}
*/
sap.ui.define([
	'./AdaptationController', './FlexUtil', 'sap/ui/fl/apply/api/FlexRuntimeInfoAPI', 'sap/ui/mdc/condition/FilterOperatorUtil', 'sap/base/Log'
], function(AdaptationController, FlexUtil, FlexRuntimeInfoAPI, FilterOperatorUtil, Log) {
	"use strict";
	var oAdaptationController = new AdaptationController();

	/**
	 *  Utility class for state handling of MDC Controls.
	 *  The StateUtil is offering a generic way to retrieve and apply a desired state to a given MDC Control.
	 *  The StateUtil class is tightly coupled to the flex integration of MDC Controls,
	 *  to use Stateutil API's the given MDC Control instance needs to fully enable all available p13nMode
	 *  options in order for the StateUtil to create the required changes and retrieve the according state
	 *  of the control.
	 *
	 *
	 * @author SAP SE
	 * @public
	 * @since 1.77.0
	 * @alias sap.ui.mdc.p13n.StateUtil
	 */
	var StateUtil = {


		/**
		*	Creates and applies the necessary changes for a given control and state.
		*   Please note that the changes are created in the order that the objects are
		*   being passed into the state object attributes. For example by adding two objects
		*   into the "items" attribute of the oState object, the first entry will be created,
		*   and the second entry will be created on top of the first created change.
		*   The item state will apply each provided object in the given order un the array and will
		*   use the provided position. In case no index has been provided or an invalid index,
		*   the item will be added to the array after the last present item. In addition
		*   the attribute "visible" can be set to false to remove the item.
		*
		* @param {object} oControl the control which will be used to create and apply changes on
		* @param {object} oState the state in which the control should be represented
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
		*       ]
		* }
		*/
		applyExternalState: function(oControl, oState){
			return new Promise(function(resolve, reject) {

				var bValidInterface = this.checkXStateInterface(oControl);

				if (!bValidInterface) {
					reject("The control needs to implement IxState");
				}

				StateUtil.retrieveExternalState(oControl).then(function(oCurrentState){

					/* The support for the known StateUtil operations (defined above as oState) depend whether the
					/* getCurrentState method returns the corresponding attribute. This depends on the Controls
					/* p13nMode configuration --> For instance a Table without atleast p13nMode="Sort" can not create sort
					/* changes via StateUtil.
					*/
					var bSortSupported = oCurrentState.hasOwnProperty("sorters");
					var bFilterSupported = oCurrentState.hasOwnProperty("filter");
					var bItemSupported = oCurrentState.hasOwnProperty("items");
					var oSortPromise, oConditionPromise, oItemPromise, aChanges = [];

					//TODO: ORDER OF CHANGES ??? --> Which changes should come first?...
					if (bSortSupported && oState.sorters){
						oSortPromise = oAdaptationController.createSortChanges(oState.sorters, false);
					}

					if (bFilterSupported && oState.filter){
						this.checkConditionOperatorSanity(oState.filter);
						oConditionPromise =	oAdaptationController.createConditionChanges(oState.filter);
					}

					if (bItemSupported && oState.items && oState.items.length > 0){
						oItemPromise = oAdaptationController.createItemChanges(oState.items);
					}

					//resolve after all changes have been
					Promise.all([oSortPromise, oConditionPromise, oItemPromise]).then(function(aRawChanges){
						aRawChanges.forEach(function(aSpecificChanges){
							if (aSpecificChanges && aSpecificChanges.length > 0){
								aChanges = aChanges.concat(aSpecificChanges);
							}
						});
						resolve(FlexUtil.handleChanges(aChanges));
					});
				}.bind(this), reject);

			}.bind(this));

		},

		/**
		 *  Retrieves the externalized state for a given control instance.
		 *  The retrieved state is equivalent to the "getCurrentState" API for the given Control,
		 *  after all necessary changes have been applied (e.g. variant appliance and P13n/StateUtil changes).
		 *  After the returned Promise has been resolved, the returned State is in sync with the according
		 *  state object of the MDC control (for example "filterConditions" for the FilterBar).
		 *
		 * @param {object} oControl The control instance implementing IxState to retrieve the externalized state
		 */
		retrieveExternalState: function(oControl) {

			return new Promise(function(resolve, reject) {

				//needs to be set in order to create and delta the changes as expected
				oAdaptationController.setAdaptationControl(oControl);
				oAdaptationController.setStateRetriever(oControl.getCurrentState);
				oAdaptationController.setItemConfig(oControl.getAdaptationConfigAttribute("itemConfig"));

				var bValidInterface = this.checkXStateInterface(oControl);

				if (!bValidInterface){
					reject("The control needs to implement then interface IxState.");
				}

				//ensure the propertyinfo is available
				oControl.initialized().then(function() {

					//ensure that all changes have been applied
					FlexRuntimeInfoAPI.waitForChanges({
						element: oControl
					}).then(function() {

						//currently only filter is supported
						resolve(oControl.getCurrentState());

					});

				});

			}.bind(this));
		},

		/**
		* Checks if a control is fulfilling the requirements to use <code>StateUtil</code>
		*
		* @param {object} oControl The control instance to be checked for corrext IxState implementation
		* @private
		*/
		checkXStateInterface: function(oControl) {

			//check if a control instance is available
			if (!oControl) {
				return false;
			}

			//check if flex is enabled
			if (!FlexRuntimeInfoAPI.isFlexSupported({element: oControl})) {
				return false;
			}

			//check for IxState 'initialized'
			if (!oControl.isA("sap.ui.mdc.IxState")) {
				return false;
			}

			return true;
		},

		checkConditionOperatorSanity: function(mConditions) {
			//TODO: consider to harmonize this sanity check with 'getCurrentState' cleanups
			for (var sFieldPath in mConditions) {
				var aConditions = mConditions[sFieldPath];
				for (var i = 0; i < aConditions.length; i++) {
					var oCondition = aConditions[i];
					var sOperator = oCondition.operator;
					if (!FilterOperatorUtil.getOperator(sOperator)){
						aConditions.splice(i, 1);
						/*
						 * in case the unknown operator has been removed, we need to check
						 * if this caused the object to be empty to not create unnecessary remove changes
						 * this should only be done within this check, as empty objects have a special meaning in the 'filter'
						 * object within the external state to reset the given conditions for a single property
						 */
						if (mConditions[sFieldPath].length == 0) {
							delete mConditions[sFieldPath];
						}
						Log.warning("The provided conditions for field '" + sFieldPath + "' contain unsupported operators - these conditions will be neglected.");
					}
				}
			}
		}

	};

	return StateUtil;
});
