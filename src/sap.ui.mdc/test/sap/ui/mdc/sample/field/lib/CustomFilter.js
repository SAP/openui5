/*!
 * ${copyright}
 */
sap.ui.define([
	'sap/ui/mdc/enums/FieldEditMode',
	"sap/ui/mdc/enums/OperatorName",
	'sap/ui/mdc/condition/Condition',
	'sap/ui/core/Control',
	'sap/base/util/deepEqual',
	'sap/base/util/merge',
	'sap/ui/dom/containsOrEquals',
	'sap/ui/model/base/ManagedObjectModel',
	'sap/ui/base/ManagedObjectObserver',
	'sap/m/ToggleButton'
], function(
	FieldEditMode,
	OperatorName,
	Condition,
	Control,
	deepEqual,
	merge,
	containsOrEquals,
	ManagedObjectModel,
	ManagedObjectObserver,
	ToggleButton
) {
	"use strict";

	var CustomFilter = Control.extend("sap.ui.mdc.sample.field.lib.CustomFilter", {
		metadata: {
			interfaces: ["sap.ui.core.IFormContent"],
			library: "sap.ui.mdc",

			properties: {
				/**
				 * Whether the field is editable.
				 */
				editMode: {
					type: "sap.ui.mdc.enums.FieldEditMode",
					group: "Data",
					defaultValue: FieldEditMode.Editable
				},

				/**
				 * Whether the field is required.
				 * TODO: create a type FieldControl (auto, false, true) false might lead to error
				 */
				required: {
					type: "boolean",
					group: "Data",
					defaultValue: false
				},

				/**
				 * Sets the maximum amount of conditions that are allowed for this field.
				 *
				 * The default value of -1 indicates that an unlimited amount of conditions can defined.
				 */
				maxConditions: {
					type: "int",
					group: "Behavior",
					defaultValue: -1
				},

				/**
				 * Sets the conditions that represents the values of the field
				 *
				 * This should be bound to a ConditionModel using the fieldPath
				 */
				conditions: {
					type: "object[]",
					group: "Data",
					defaultValue: []
				}
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
						value: { type: "string" },

						/**
						 * Flag indecates if the entered <code>value</code> is valid.
						 */
						valid: { type: "boolean" }
					}
				},
				/**
				 * This event is fired when the value of the field is changed - e.g. at each keypress
				 *
				 * <b>Note</b> This event is only triggered if the used content control has a liveChange event
				 */
				liveChange : {
					parameters : {
						/**
						 * The new value of the input.
						 */
						value : {type : "string"},

						/**
						 * Indicate that ESC key triggered the event.
						 */
						escPressed : {type : "boolean"},

						/**
						 * The value of the input before pressing ESC key.
						 */
						previousValue : {type : "string"}
					}
				},
				/**
				 * Fired if the help is triggered
				 */
				openHelp: {}
			},

			defaultProperty: "value"
		},
		renderer : {
			apiVersion: 2,
			render: function(oRm, oControl) {

				var aButtons = oControl.getAggregation("_buttons", []);
				oRm.openStart("div", oControl);
				oRm.style("width", "100%");
				oRm.openEnd();

				for (var i = 0; i < aButtons.length; i++) {
					var oButton = aButtons[i];
					oRm.renderControl(oButton);
				}

				oRm.close("div");
			}
		}
	});

	CustomFilter.prototype.init = function() {

		this._oObserver = new ManagedObjectObserver(this._observeChanges.bind(this));

		this._oObserver.observe(this, {
			properties: ["editMode", "maxConditions", "conditions"]
		});

		var oButton1 = new ToggleButton(this.getId() + "-1", {
			text: "Available",
			width: "33%",
			type: "Accept",
			press: _handlePress.bind(this)
		});

		this.addAggregation("_buttons", oButton1);

		var oButton2 = new ToggleButton(this.getId() + "-2", {
			text: "Discontinued",
			width: "33%",
			type: "Reject",
			press: _handlePress.bind(this)
		});

		this.addAggregation("_buttons", oButton2);

		var oButton3 = new ToggleButton(this.getId() + "-3", {
			text: "Out of Stock",
			width: "33%",
			type: "Emphasized",
			press: _handlePress.bind(this)
		});

		this.addAggregation("_buttons", oButton3);

	};

	CustomFilter.prototype.exit = function() {

		this._oObserver.disconnect();
		this._oObserver = undefined;

	};

	CustomFilter.prototype._observeChanges = function(oChanges) {

//		if (oChanges.name === "editMode") {
//		}
//
//		if (oChanges.name === "maxConditions") {
//		}

		if (oChanges.name === "conditions") {
			_handleConditionsChange.call(this, oChanges.current, oChanges.old);
		}

	};

	function _handleConditionsChange(aConditions, aConditionsOld) {

//		var iMaxConditions = this.getMaxConditions();
		var aButtons = this.getAggregation("_buttons", []);
		var aPressed = [false, false, false];
		var i = 0;

		for (i = 0; i < aConditions.length; i++) {
			var oCondition = merge({}, aConditions[i]); // to not change the original condition
			if (oCondition.operator === OperatorName.EQ) {
				if (oCondition.values[0] === "S1") {
					aPressed[0] = true;
				} else if (oCondition.values[0] === "S2") {
					aPressed[1] = true;
				} else if (oCondition.values[0] === "S3") {
					aPressed[2] = true;
				}
			}
		}

		for (i = 0; i < aButtons.length; i++) {
			var oButton = aButtons[i];
			if (oButton.getPressed() !== aPressed[i]) {
				oButton.setPressed(aPressed[i]);
			}
		}

	}

	function _handlePress(oEvent) {

		var oButton = oEvent.oSource;
		var bPressed = oEvent.getParameter("pressed");
		var iIndex = this.indexOfAggregation("_buttons", oButton);
		var aConditions = merge([], this.getConditions());
		var bChanged = false;
		var iMaxConditions = this.getMaxConditions();

		if (iIndex >= 0) {
			var sKey = "S" + (iIndex + 1);
			var bFound = false;
			for (var i = 0; i < aConditions.length; i++) {
				var oCondition = aConditions[i];
				if (oCondition.operator === OperatorName.EQ && oCondition.values[0] === sKey) {
					bFound = true;
					if (!bPressed) {
						aConditions.splice(i, 1);
						bChanged = true;
					}
					break;
				}
			}
			if (bPressed && !bFound) {
				aConditions.push(Condition.createItemCondition(sKey));
				bChanged = true;
			}
		}

		if (bChanged) {
			if (iMaxConditions > 0 && iMaxConditions <= aConditions.length) {
				// remove first conditions to meet maxConditions
				aConditions.splice(0, aConditions.length - iMaxConditions);
			}
			this.setConditions(aConditions);
			this.fireChange({value: "", valid: true});
		}

	}

	return CustomFilter;

});
