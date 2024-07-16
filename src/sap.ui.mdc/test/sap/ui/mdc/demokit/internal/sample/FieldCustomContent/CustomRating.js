/*!
 * ${copyright}
 */
sap.ui.define([
	'sap/ui/core/Control',
	'sap/ui/core/message/MessageMixin',
	'sap/ui/model/base/ManagedObjectModel',
	'sap/ui/base/ManagedObjectObserver',
	'sap/m/RatingIndicator',
	'sap/m/Button',
	'sap/ui/mdc/condition/Condition'
], function(
	Control,
	MessageMixin,
	ManagedObjectModel,
	ManagedObjectObserver,
	RatingIndicator,
	Button,
	Condition
) {
	"use strict";

	const CustomRating = Control.extend("sap.ui.mdc.sample.FieldCustomContent.CustomRating", {
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
				enabled: { type: "boolean", group: "Behavior", defaultValue: true },

				/**
				 * Defines whether the control can be modified by the user or not.
				 * <b>Note:</b> A user can tab to non-editable control, highlight it, and copy the text from it.
				 */
				editable: { type: "boolean", group: "Behavior", defaultValue: true },

				/**
				 * The RatingIndicator in displayOnly mode is not interactive, not editable, not focusable, and not in the tab chain. This setting is used for forms in review mode.
				 */
				displayOnly : {type : "boolean", group : "Behavior", defaultValue : false}
			 },

			aggregations: {
				_rating: {
					type: "sap.m.RatingIndicator",
					multiple: false,
					visibility: "hidden"
				},
				_button: {
					type: "sap.m.Button",
					multiple: false,
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
				}
			},

			defaultProperty: "conditions"
		},
		renderer : {
			apiVersion: 2,
			render: function(oRm, oControl) {

				const oRating = oControl.getAggregation("_rating");
				const oButton = oControl.getAggregation("_button");
				oRm.openStart("div", oControl);
				oRm.style("width", "100%");
				oRm.openEnd();

				oRm.renderControl(oRating);
				oRm.renderControl(oButton);

				oRm.close("div");
			}
		}
	});

	// apply the message mixin so all message on the input will get the associated label-texts injected
	MessageMixin.call(CustomRating.prototype);

	CustomRating.prototype.init = function() {

		this._oManagedObjectModel = new ManagedObjectModel(this);

		this._oObserver = new ManagedObjectObserver(this._observeChanges.bind(this));

		this._oObserver.observe(this, {
			properties: ["conditions"]
		});

		const oRating = new RatingIndicator(this.getId() + "-RI", {
			editable: {path: "$this>/editable"},
			enabled: {path: "$this>/enabled"},
			tooltip: {path: "$this>/tooltip"},
			maxValue: 10,
			change: _handleChange.bind(this),
			liveChange: _handleLiveChange.bind(this)
		});

		oRating.setModel(this._oManagedObjectModel, "$this");
		this.setAggregation("_rating", oRating);

		const oButton = new Button(this.getId() + "-B", {
			icon: "sap-icon://delete",
			enabled: {parts: [{path: "$this>/enabled"}, {path: "$this>/editable"}], formatter: _determineButtonEnabled},
			width: "2rem",
			press: _handlePress.bind(this)
		});

		oButton.setModel(this._oManagedObjectModel, "$this");
		this.setAggregation("_button", oButton);

	};

	CustomRating.prototype.exit = function() {

		if (this._oManagedObjectModel) {
			this._oManagedObjectModel.destroy();
			delete this._oManagedObjectModel;
		}

		this._oObserver.disconnect();
		this._oObserver = undefined;

	};

	CustomRating.prototype._observeChanges = function(oChanges) {

		if (oChanges.name === "conditions") {
			const oRating = this.getAggregation("_rating");
			const aConditions = oChanges.current;
			let vValue = null;
			if (aConditions && aConditions.length > 0) {
				vValue = aConditions[0].values[0];
				vValue = vValue / 1000;
			}
			oRating.setValue(vValue);
		}

	};

	CustomRating.prototype.getFocusDomRef = function() {

		const oRating = this.getAggregation("_rating");
		return oRating.getFocusDomRef();

	};

	CustomRating.prototype.getIdForLabel = function() {

		const oRating = this.getAggregation("_rating");
		return oRating.getIdForLabel();

	};

	CustomRating.prototype.getAccessibilityInfo = function() {

		const oRating = this.getAggregation("_rating");
		return oRating.getAccessibilityInfo();

	};

	function _handleChange(oEvent) {

		let vValue = oEvent.getParameter("value");
		vValue = vValue * 1000;

		const oCondition = Condition.createItemCondition(vValue);
		this.setConditions([oCondition]);

		this.fireChange({value: vValue});

	}

	function _handleLiveChange(oEvent) {

		let vValue = oEvent.getParameter("value");
		vValue = vValue * 1000;

		const aConditions = this.getConditions();
		let vPreviousValue;
		if (aConditions.length > 0) {
			vPreviousValue = aConditions[0].values[0];
		}

		this.fireLiveChange({value: vValue, previousValue: vPreviousValue});

	}

	function _handlePress(oEvent) {

		this.setConditions([]);
		this.fireChange({value: null});

	}

	function _determineButtonEnabled(bEnabled, bEditable) {

		if (bEnabled && bEditable) {
			return true;
		} else {
			return false;
		}

	}

	return CustomRating;

});
