/*!
 * ${copyright}
 */
sap.ui.define([
	'sap/m/SegmentedButton',
	'sap/m/SegmentedButtonRenderer',
	'sap/ui/core/Control',
	'sap/ui/core/message/MessageMixin',
	'sap/ui/model/base/ManagedObjectModel',
	'sap/ui/base/ManagedObjectObserver',
	'sap/m/ToggleButton',
	'sap/ui/mdc/condition/Condition',
	'sap/ui/mdc/enums/ConditionValidated',
	'sap/ui/mdc/enums/OperatorName',
	'sap/ui/mdc/condition/FilterOperatorUtil'
], function(
    SegmentedButton,
    SegmentedButtonRenderer,
	Control,
	MessageMixin,
	ManagedObjectModel,
	ManagedObjectObserver,
	ToggleButton,
	Condition,
	ConditionValidated,
	OperatorName,
	FilterOperatorUtil
) {
	"use strict";

	const CustomSegmentedButton = SegmentedButton.extend("mdc.sample.controls.CustomSegmentedButton", {
        metadata: {
			properties: {
				/**
				 * Interacts directly with conditions of Field or FilterField
				 */
				 conditions: { type: "object[]", group: "Data", defaultValue: [], bindable: "bindable", byValue: true },

				/**
				 * Indicates whether the user can interact with the control or not.
				 * <b>Note:</b> Disabled controls cannot be focused and they are out of the tab-chain.
				 */
				enabled: { type: "boolean", group: "Behavior", defaultValue: true }
			 },

			aggregations: {
                items : { type : "sap.m.SegmentedButtonItem", multiple : true, singularName : "item", bindable : "bindable" }
			},

			events: {
				/**
				 * This event is fired when the value property of the field is changed
				 *
				 * <b>Note</b> This event is only triggered if the used content control has a change event
				 */
				change: {
					parameters: {
						/**
						 * The selected <code>value</code>.
						 */
						value: { type: "string" }
					}
				}
			},

			defaultProperty: "conditions"
		},
        renderer: SegmentedButtonRenderer
    });

    CustomSegmentedButton.prototype.init = function() {

		this._oManagedObjectModel = new ManagedObjectModel(this);

		this._oObserver = new ManagedObjectObserver(this._observeChanges.bind(this));

		this._oObserver.observe(this, {
			properties: ["conditions"]
		});

        this.attachSelectionChange(this._handleSelectionChange);
        SegmentedButton.prototype.init.apply(this, arguments);
	};

    CustomSegmentedButton.prototype.clone = function () {
		this.detachSelectionChange(this._handleSelectionChange);
		const oClone = SegmentedButton.prototype.clone.apply(this, arguments);
		this.attachSelectionChange(this._handleSelectionChange);
		return oClone;
	};

    CustomSegmentedButton.prototype._observeChanges = function (oChanges) {
        if (oChanges.name === "conditions") {
			const aConditions = oChanges.current;
			if (aConditions[0]) {
				this.setSelectedKey(aConditions[0].values[0]);
			}
		}
    };

    CustomSegmentedButton.prototype._handleSelectionChange = function(oEvent) {

		const oSegmentedButtonItem = oEvent.getParameter("item");
        const sSelectedId = oSegmentedButtonItem.getKey();

        const oCondition = Condition.createCondition(OperatorName.EQ, [sSelectedId], undefined, undefined, ConditionValidated.NotValidated);

		FilterOperatorUtil.checkConditionsEmpty([oCondition]);
		this.setConditions([oCondition]);
		this.fireChange();

	};

    return CustomSegmentedButton;
});