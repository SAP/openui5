/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/test/actions/Action"
], function (Action) {
	"use strict";

	/**
	 * @class
	 * The <code>Drop</code> action is used to simulate drop on a control.
	 * The control should be droppable, as defined by its dnd aggregation configuration.
	 * The dropped control should be defined in a preceding {@link sap.ui.test.actions.Drag} action.
	 *
	 * The <code>Drop</code> action targets a special DOM element representing the
	 * control. This DOM element can be customized.
	 *
	 * For most most controls, the target will be the DOM focus reference.
	 * You can choose a different DOM element by specifying its ID suffix.
	 * You can do this by directly passing the ID suffix to the Drop constructor,
	 * or by defining a control adapter function.
	 * You can also set the traget to be the root DOM element of a given aggregation,
	 * by specifying the aggregation name in the Drop constructor.
	 *
	 * * The <code>Drop</code> action is not supported in IE11!
	 *
	 * @extends sap.ui.test.actions.Action
	 * @public
	 * @name sap.ui.test.actions.Drop
	 * @author SAP SE
	 * @since 1.76
	 */
	var Drop = Action.extend("sap.ui.test.actions.Drop", {

		metadata : {
			properties: {
				/**
				 * name of the droppable aggregation, whose root to use as drop target.
				 * This makes sense only for some controls, where this root DOM element is droppable.
				 */
				aggregationName: "string",
				/**
				 * specify a position for the drop event, relative to the position of the control's representative DOM element.
				 * This makes sense only for the case when dropping right on top of the DOM element makes no sense,
				 * and instead, the drop should happen right before or after the element. e.g. sap.m.IconTabBar.
				 * Default position is "center", meaning the drop will be directly on the element.
				 * Set `before` to true, to drop the source immediately before the target element.
				 */
				before: "boolean",
				/**
				 * Set `after` to true, to drop the source immediately before the target element.
				 */
				after: "boolean"
			},
			publicMethods : [ "executeOn" ]
		},

		/**
		 * Starts a drop event sequence for this control, such that a predefined source will be dropped on the control.
		 * To start a drag sequence ad define the dragged source, trigger a {@link sap.ui.test.actions.Drag} action on the source.
		 * Logs an error if control is not visible (i.e. has no DOM representation)
		 *
		 * @param {sap.ui.core.Control} oControl the control on which the drop events are triggered
		 * @public
		 */
		executeOn: function (oControl) {
			var oActionDomRef;

			if (this.getIdSuffix()) {
				// use the user-defined target
				oActionDomRef = oControl.$(this.getIdSuffix())[0];
			} else if (this.getAggregationName()) {
				// use the root of a user-defined aggregation
				oActionDomRef = oControl.getDomRefForSetting(this.getAggregationName());
			} else {
				// infer the droppable aggregation and get its root.
				// note that it's up to the control to have this root defined (-> it might not be found some times)
				var aAggregations = oControl.getMetadata().getAggregations();
				var sDropAggregation = Object.keys(aAggregations).filter(function (mAggregation) {
					return aAggregations[mAggregation].dnd.droppable;
				})[0];
				if (sDropAggregation) {
					oActionDomRef = oControl.getDomRefForSetting(sDropAggregation) || oControl["get" + sDropAggregation]()[0];
				}
			}

			// as a fallback, use the focus DOM reference
			oActionDomRef = oActionDomRef || this.$(oControl)[0];

			if (oActionDomRef) {
				// set the position of the drop within the target
				var mOptions = {};
				if (this.getBefore()) {
					mOptions.position = this.dropPosition.BEFORE;
				} else if (this.getAfter()) {
					mOptions.position = this.dropPosition.AFTER;
				} else {
					mOptions.position = this.dropPosition.CENTER;
				}

				this._createAndDispatchDragEvent("dragenter", oActionDomRef, mOptions);
				this._createAndDispatchDragEvent("dragover", oActionDomRef, mOptions);
				this._createAndDispatchDragEvent("drop", oActionDomRef, mOptions);
				this._createAndDispatchDragEvent("dragend", oActionDomRef, mOptions);
			}
		}
	});

	return Drop;
});
