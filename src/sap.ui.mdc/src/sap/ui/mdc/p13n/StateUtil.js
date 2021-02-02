/*
* ! ${copyright}
*/
sap.ui.define([
	'sap/ui/mdc/p13n/Engine'
], function(Engine) {
	"use strict";


	/**
	 *  @class Utility class for state handling of MDC Controls.
	 *  The StateUtil is offering a generic way to retrieve and apply a desired state to a given MDC Control.
	 *  The StateUtil class is tightly coupled to the flex integration of MDC Controls,
	 *  to use Stateutil API's the given MDC Control instance needs to fully enable all available p13nMode
	 *  options in order for the StateUtil to create the required changes and retrieve the according state
	 *  of the control.
	 *
	 *
	 * @author SAP SE
	 * @public
	 * @ui5-restricted sap.fe
	 * @experimental As of version 1.77.0
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
			return Engine.getInstance().applyExternalState(oControl, oState);
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
			return Engine.getInstance().retrieveExternalState(oControl);
		}

	};

	return StateUtil;
});
