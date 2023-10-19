/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/integration/thirdparty/adaptivecards",
	"sap/ui/integration/cards/adaptivecards/overwrites/inputsGeneralOverwrites"
], function (AdaptiveCards, InputsOverwrites) {
	"use strict";

	function UI5ChoiceSet (){
		AdaptiveCards.ChoiceSetInput.apply(this, arguments);
	}
	/**
	 * Constructor for a new <code>UI5InputChoiceSet</code>.
	 *
	 * @class
	 * An object that overwrites Microsoft's Adaptive Card <code>Input.ChoiceSet</code> element by replacing it with
	 * <code>ui5-select</code>, or container with <code>ui5-radio-button</code>, or <code>ui5-checkbox</code> web components.
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @private
	 * @since 1.74
	 */

	UI5ChoiceSet.prototype = Object.create(AdaptiveCards.ChoiceSetInput.prototype);


	UI5ChoiceSet.prototype.overrideInternalRender = function () {
		var oInput = AdaptiveCards.TextInput.prototype.overrideInternalRender.call(this, arguments);

		InputsOverwrites.overwriteLabel(this);
		InputsOverwrites.overwriteRequired(this);

		return oInput;
	};

	UI5ChoiceSet.prototype.internalRender = function () {
		if (!this.isMultiSelect) {
			if (this.isCompact) {
				//if this.isMultiSelect is false and this.isCompact is true, we need to render an ui5-select web component
				this._selectElement = document.createElement("ui5-select");
				this._selectElement.id = this.id;
				this._selectElement.addEventListener("change", function () {
					this.valueChanged();
				}.bind(this));

				var oDocFragment = document.createDocumentFragment();
				for (var i = 0; i < this.choices.length; i++) {
					var oOption = document.createElement("ui5-option");
					oOption.value = this.choices[i].value;
					oOption.textContent  = this.choices[i].title;

					if (this.choices[i].value === this.defaultValue) {
						oOption.selected = true;
					}

					oDocFragment.appendChild(oOption);
				}

				this._selectElement.appendChild(oDocFragment);
				return this._selectElement;
			}
			//if this.isMultiSelect is false and this.isCompact is false, we need to render a container with ui5-radio-button web components
			var oRbContainer = document.createElement("div");
			oRbContainer.classList.add("sapFCardAdaptiveContentChoiceSetWrapper");
			oRbContainer.id = this.id;
			oRbContainer.setAttribute("role", "radiogroup");
			oRbContainer.addEventListener("change", function () {
				this.valueChanged();
			}.bind(this));
			this._toggleInputs = [];
			for (var j = 0; j < this.choices.length; j++) {
				var oRb = document.createElement("ui5-radio-button");
				oRb.value = this.choices[j].value;
				oRb.text = this.choices[j].title;
				oRb.name = this.id;
				oRb.wrappingType = this.wrap ? "Normal" : "None";

				if (this.choices[j].value === this.defaultValue) {
					oRb.checked = true;
				}

				this._toggleInputs.push(oRb);
				oRbContainer.appendChild(oRb);
			}

			return oRbContainer;
		}
		//if this.isMultiSelect is true and this.isCompact is false, we need to render a container with ui5-checkbox web components
		var defaultValues = this.defaultValue ? this.defaultValue.split(",") : null;
		var oCbContainer = document.createElement("div");
		oCbContainer.classList.add("sapFCardAdaptiveContentChoiceSetWrapper");
		oCbContainer.setAttribute("role", "group");
		oCbContainer.id = this.id;
		oCbContainer.addEventListener("change", function () { this.valueChanged(); }.bind(this));
		this._toggleInputs = [];
		for (var k = 0; k < this.choices.length; k++) {
			var oCb = document.createElement("ui5-checkbox");
			oCb.value = this.choices[k].value;
			oCb.text = this.choices[k].title;
			oCb.name = this.id;
			oCb.wrappingType = this.wrap ? "Normal" : "None";

			if (defaultValues && defaultValues.indexOf(this.choices[k].value) >= 0) {
				oCb.checked = true;
			}

			this._toggleInputs.push(oCb);
			oCbContainer.appendChild(oCb);
		}

		return oCbContainer;
	};

	/**
	 * Overwrites getValue method of Microsoft's Adaptive Card <code>Input.ChoiceSet</code>
	 *
	 * That method is overwritten in order to get the correct value
	 * @private
	 */
	Object.defineProperty(UI5ChoiceSet.prototype, "value" , {
		get: function value() {
			var i;
			if (!this.isMultiSelect) {
				if (this.isCompact) {
					return this._selectElement.selectedOption ? this._selectElement.selectedOption.value : null;
				} else {
					if (!this._toggleInputs || this._toggleInputs.length === 0) {
						return null;
					}

					for (i = 0; i < this._toggleInputs.length; i++) {
						if (this._toggleInputs[i].checked) {
							return this._toggleInputs[i].value;
						}
					}
					return null;
				}
			} else {
				if (!this._toggleInputs || this._toggleInputs.length === 0) {
					return null;
				}

				var sResult = "";

				for (i = 0; i < this._toggleInputs.length; i++) {
					if (this._toggleInputs[i].checked) {
						if (sResult !== "") {
							sResult += this.hostConfig.choiceSetInputValueSeparator;
						}

						sResult += this._toggleInputs[i].value;
					}
				}
				return sResult === "" ? null : sResult;
			}
		}
	});

	UI5ChoiceSet.prototype.updateInputControlAriaLabelledBy = function () {
		var sAttribute = (!this.isMultiSelect && this.isCompact) ? "accessible-name-ref" : "aria-labelledby";
		InputsOverwrites.overwriteAriaLabelling(this, sAttribute);
	};

	UI5ChoiceSet.prototype.showValidationErrorMessage = function () {
		if (!this._toggleInputs || !this._toggleInputs.length) {
			return;
		}

		this._toggleInputs.forEach(function(oToggleInput){
			oToggleInput.valueState = "Error";
		});
	};

	UI5ChoiceSet.prototype.resetValidationFailureCue = function () {
		AdaptiveCards.TextInput.prototype.resetValidationFailureCue.call(this, arguments);

		if (!this._toggleInputs || !this._toggleInputs.length) {
			return;
		}

		this._toggleInputs.forEach(function (oToggleInput) {
			oToggleInput.valueState = "None";
		});
	};

	return UI5ChoiceSet;
});