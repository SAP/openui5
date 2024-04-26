/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/m/p13n/Engine"
], (Engine) => {
	"use strict";

	/**
	 *  @class Utility class for state handling of MDC controls.
	 *  The <code>StateUtil</code> class is offering a generic way to retrieve states and set a desired state for a given MDC control.
	 *  The <code>StateUtil</code> class is tightly coupled to the SAPUI5 flexibility integration of MDC controls.
	 *  To use the APIs of <code>Stateutil</code>, the given MDC control instance needs to fully enable all available <code>p13nMode</code> options.
	 *  This way, <code>Stateutil</code> can create the required changes and retrieve the relevant state of each control.
	 *
	 * @author SAP SE
	 * @public
	 * @since 1.77.0
	 * @alias sap.ui.mdc.p13n.StateUtil
	 */
	const StateUtil = {


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
		 * 	<li><code>filtered</code> - Set to <code>false</code> in the <code>filter</code> scope on condition level to remove one specific condition for the given key.</li>
		 *	<li><code>sorted</code> - Set to <code>false</code>  in the <code>sorters</code> scope to remove a sorter/code>.</li>
		 *	<li><code>grouped</code> - Set to <code>false</code>  in the <code>groupLevels</code> scope to remove a grouping.</li>
		 *	<li><code>visible</code> - Set to <code>false</code>  to remove an aggregation item.</li>
		 *	<li><code>aggregated</code> - Set to <code>false</code>  to remove an aggregation.</li>
		 *	</ul>
		 *
		 *	<b>Note:</b>To improve the performance, you should avoid additional calls of the control’s delegate.
		 *	To do this, the <code>propertyInfo</code> property of the relevant control can be enriched with the properties used in the provided state.
		 *
		 *
		 * @public
		 *
		 * @param {sap.ui.mdc.Control} oControl The control that is used to create changes and to which changes are made
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
		 * 				},
		 *				{
		 * 					"operator": EQ,
		 * 					"values": [
		 * 						"Hardware"
		 * 					],
		 *					"filtered": false
		 * 				}
		 * 			]
		 * 		},
		 * 		items: [
		 *			{key: "Category", position: 3},
		 *			{key: "Country", visible: false}
		 *       ],
		 *       sorters: [
		 *			{key: "Category", "descending": false},
		 *			{key: "NoCategory", "descending": false, "sorted": false}
		 *       ],
		 *		groupLevels: [
		 *			{key: "Category"},
		 *			{key: "Country", grouped: false}
		 *       ],
		 *		aggregations: {
		 *			Region: {},
		 *			Country: {
		 *				aggregated: false
		 *			}
		 *		},
		 *		//The supplementaryConfig can be used to modify control specific attributes, for example the column width in the Table
		 *		supplementaryConfig: {
		 *			aggregations: {
		 *				columns: {
		 *					Category: {
		 *						width: "150px"
		 *					}
		 *				}
		 *			}
		 *		}
		 * }
		 *
		 * @returns {Promise} <code>Promise</code> that resolves after all changes have been applied
		 */
		applyExternalState: function(oControl, oState) {
			const oInternalState = Engine.getInstance().internalizeKeys(oControl, oState);
			return Engine.getInstance().applyState(oControl, oInternalState, false);
		},

		/**
		 *  Retrieves the externalized state for a given control instance.
		 *  The retrieved state is equivalent to the <code>getCurrentState</code> API for the given control,
		 *  after all necessary changes have been applied (for example, variant appliance and <code>p13n, StateUtil</code> changes).
		 *  After the returned <code>Promise</code> has been resolved, the returned state is in sync with the according
		 *  state object of the MDC control (for example, <code>filterConditions</code> for the <code>FilterBar</code> control).
		 *
		 * @public
		 * @param {sap.ui.mdc.Control} oControl The control instance implementing IxState to retrieve the externalized state
		 *
		 * @returns {Promise} <code>Promise</code> that resolves after the current state has been retrieved
		 */
		retrieveExternalState: function(oControl) {
			return Engine.getInstance().retrieveState(oControl).then((oEngineState) => {
				return Engine.getInstance().externalizeKeys(oControl, oEngineState);
			});
		},

		/**
		 * Resets the state by discarding all personalization changes created. When using a <code>VariantManagement</control>, the state
		 * is being reset to the currently selected variant. When using a <code>PersistenceProvider</code> control with its <code>mode</code>
		 * property configured to </code>auto</code>, the state is reset as provided in the XML view.
		 *
		 * @param {sap.ui.mdc.Control} oControl The control instance to be reset
		 *
		 * @returns {Promise} <code>Promise</code> that resolves after the state has been reset
		 */
		resetState: function(oControl) {
			const aInternalKeys = Engine.getInstance().getRegisteredControllers(oControl);
			return Engine.getInstance().reset(oControl, aInternalKeys);
		},

		/**
		 * Creates a delta between two states.
		 *
		 *
		 * @public
		 * @param {sap.ui.mdc.Control} oControl The control instance implementing IxState
		 * @param {object} oOldState The prior state
		 * @param {object} oNewState The new state
		 *
		 * @returns {Promise} <code>Promise</code> that resolves after the current state has been diffed
		 */
		diffState: function(oControl, oOldState, oNewState) {
			return Engine.getInstance().diffState(oControl, Engine.getInstance().internalizeKeys(oControl, oOldState), Engine.getInstance().internalizeKeys(oControl, oNewState))
				.then((oEngineStateDiff) => {
					return Engine.getInstance().externalizeKeys(oControl, oEngineStateDiff);
				});
		},

		/**
		 * Attaches an event handler to the <code>StateUtil</code>.
		 * The event handler may be fired every time a user triggers a personalization change for a control instance during runtime.
		 *
		 * @public
		 * @param {function} fnListener fnFunction The handler function to call when the event occurs
		 */
		attachStateChange: function(fnListener) {
			Engine.getInstance().stateHandlerRegistry.attachChange(fnListener);
		},

		/**
		 * Removes a previously attached state change event handler from the <code>StateUtil</code> class.
		 * The passed parameters must match those used for registration with {@link StateUtil#attachChange} beforehand.
		 *
		 * @public
		 * @param {function} fnListener fnFunction The handler function to detach from the event
		 */
		detachStateChange: function(fnListener) {
			Engine.getInstance().stateHandlerRegistry.detachChange(fnListener);
		}

	};

	return StateUtil;
});