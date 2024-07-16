/*!
 * ${copyright}
 */
sap.ui.define([
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

	const CustomButtons = Control.extend("sap.ui.mdc.sample.FieldCustomContent.CustomButtons", {
		metadata: {
			interfaces: ["sap.ui.core.IFormContent"],
			library: "sap.ui.mdc",

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
				_buttons: {
					type: "sap.m.ToggleButton",
					multiple: true,
					visibility: "hidden"
				}
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
		renderer : {
			apiVersion: 2,
			render: function(oRm, oControl) {

				const aButtons = oControl.getAggregation("_buttons", []);
				oRm.openStart("div", oControl);
				oRm.style("width", "100%");
				oRm.openEnd();

				for (let i = 0; i < aButtons.length; i++) {
					oRm.renderControl(aButtons[i]);
				}

				oRm.close("div");
			}
		}
	});

	const iCount = 5;

	// apply the message mixin so all message on the input will get the associated label-texts injected
	MessageMixin.call(CustomButtons.prototype);

	CustomButtons.prototype.init = function() {

		this._oManagedObjectModel = new ManagedObjectModel(this);

		this._oObserver = new ManagedObjectObserver(this._observeChanges.bind(this));

		this._oObserver.observe(this, {
			properties: ["conditions"]
		});


		for (let i = 0; i < iCount; i++) {
			const oButton = new ToggleButton(this.getId() + "-B" + i, {
				text: i,
				enabled: {path: "$this>/enabled"},
				width: (100 / iCount) + "%",
				press: _handlePress.bind(this)
			});

			oButton.setModel(this._oManagedObjectModel, "$this");
			this.addAggregation("_buttons", oButton);
		}

	};

	CustomButtons.prototype.exit = function() {

		if (this._oManagedObjectModel) {
			this._oManagedObjectModel.destroy();
			delete this._oManagedObjectModel;
		}

		this._oObserver.disconnect();
		this._oObserver = undefined;

	};

	CustomButtons.prototype._observeChanges = function(oChanges) {

		if (oChanges.name === "conditions") {
			const aButtons = this.getAggregation("_buttons");
			const aConditions = oChanges.current;
			let i = 0;

			for (i = 0; i < aButtons.length; i++) {
				aButtons[i].setPressed(false);
			}
			for (i = 0; i < aConditions.length; i++) {
				const iValue = aConditions[i].values[0];
				if (iValue < iCount && aButtons[iValue]) {
					aButtons[iValue].setPressed(true);
				}
			}
		}

	};

	CustomButtons.prototype.getFocusDomRef = function() {

		const aButtons = this.getAggregation("_buttons");
		return aButtons[0].getFocusDomRef();

	};

	CustomButtons.prototype.getIdForLabel = function() {

		const aButtons = this.getAggregation("_buttons");
		return aButtons[0].getIdForLabel();

	};

	CustomButtons.prototype.getAccessibilityInfo = function() {

		let sText = "";
		for (let i = 0; i < iCount; i++) {
			sText = sText + i + " ";
		}

		return {description: sText};

	};

	function _handlePress(oEvent) {

		const oButton = oEvent.getSource();
		const bPressed = oEvent.getParameter("pressed");
		const aConditions = this.getConditions();
		const iIndex = this.indexOfAggregation("_buttons", oButton);
		let bFound = false;

		for (let i = 0; i < aConditions.length; i++) {
			if (aConditions[i].values[0] === iIndex) {
				bFound = true;
				if (!bPressed) {
					aConditions.splice(i, 1);
				}
				break;
			}
		}

		if (bPressed && !bFound) {
			const oCondition = Condition.createCondition(OperatorName.EQ, [iIndex], undefined, undefined, ConditionValidated.NotValidated);
			aConditions.push(oCondition);
		}
		FilterOperatorUtil.checkConditionsEmpty(aConditions);
		this.setConditions(aConditions);
		this.fireChange();

	}

	return CustomButtons;

});
