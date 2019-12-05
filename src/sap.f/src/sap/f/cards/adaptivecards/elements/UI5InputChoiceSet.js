/*!
 * ${copyright}
 */
sap.ui.define(["sap/ui/integration/thirdparty/adaptivecards"], function (AdaptiveCards) {
	"use strict";

	function UI5ChoiceSet (){
		AdaptiveCards.ChoiceSetInput.apply(this, arguments);
	}

	UI5ChoiceSet.prototype = Object.create(AdaptiveCards.ChoiceSetInput.prototype);

	UI5ChoiceSet.prototype.internalRender = function () {
		if (!this.isMultiSelect) {
			// render ui5-select
			if (this.isCompact) {
				this._selectElement = document.createElement("ui5-select");
				this._selectElement.setAttribute('ac-select', '');
				this._selectElement.id = this.id;
				// placeholder?
				// empty initial value?
				this._selectElement.addEventListener("change", function () {
					this.valueChanged();
				}.bind(this));

				var oPlaceholder = document.createElement("ui5-option");
				oPlaceholder.setAttribute('ac-select-placeholder', '');
                oPlaceholder.selected = true;
                oPlaceholder.value = "";

                if (this.placeholder) {
                    oPlaceholder.innerHTML = this.placeholder;
				}

				this._selectElement.appendChild(oPlaceholder);

				for (var i = 0; i < this.choices.length; i++) {
				    var oOption = document.createElement("ui5-option");
				    oOption.value = this.choices[i].value;
				    oOption.innerHTML = this.choices[i].title;

				    if (this.choices[i].value === this.defaultValue) {
						oOption.selected = true;
				    }

				    this._selectElement.appendChild(oOption);
				}

				return this._selectElement;
			}
			// render container with ui5-radiobuttons
			// wrap?
			var oRbContainer = document.createElement("div");
			oRbContainer.style = "display: flex;flex-direction: column;flex-wrap: nowrap;justify-content: center;align-items: flex-start;height: fit-content;";
			oRbContainer.id = this.id;
			oRbContainer.addEventListener("select", function () {
				this.valueChanged();
			}.bind(this));
			this._toggleInputs = [];
			for (var j = 0; j < this.choices.length; j++) {
				var oRb = document.createElement("ui5-radiobutton");
				oRb.value = this.choices[j].value;
				oRb.text = this.choices[j].title;
				oRb.name = this.id;

				if (this.choices[j].value === this.defaultValue) {
					oRb.selected = true;
				}

				this._toggleInputs.push(oRb);

				oRbContainer.appendChild(oRb);
			}

			return oRbContainer;
		}
		// render container with ui5-checkbox
		var defaultValues = this.defaultValue ? this.defaultValue.split(",") : null;
		var oCbContainer = document.createElement("div");
		oCbContainer.style = "display: flex;flex-direction: column;flex-wrap: nowrap;justify-content: center;align-items: flex-start;height: fit-content;";
		oCbContainer.id = this.id;
		oCbContainer.addEventListener("change", function () { this.valueChanged(); }.bind(this));
		this._toggleInputs = [];
		for (var k = 0; k < this.choices.length; k++) {
			var oCb = document.createElement("ui5-checkbox");
			oCb.value = this.choices[k].value;
			oCb.text = this.choices[k].title;
			oCb.name = this.id;
			oCb.wrap = this.wrap;

			if (defaultValues && defaultValues.indexOf(this.choices[k].value) >= 0) {
				oCb.checked = true;
			}

			this._toggleInputs.push(oCb);

			oCbContainer.appendChild(oCb);
		}

		return oCbContainer;
	};

	Object.defineProperty(UI5ChoiceSet.prototype, "value" , {
		get: function value() {
			var i;
			if (!this.isMultiSelect) {
				if (this.isCompact) {
					return this._selectElement.selectedOption && !this._selectElement.selectedOption.hasAttribute('ac-select-placeholder') ? this._selectElement.selectedOption.value : null;
				} else {
					if (!this._toggleInputs || this._toggleInputs.length === 0) {
						return null;
					}

					for (i = 0; i < this._toggleInputs.length; i++) {
						if (this._toggleInputs[i].selected) {
							return this._toggleInputs[i].value;
						}
					}

					return null;
				}
			} else {
				if (!this._toggleInputs || this._toggleInputs.length === 0) {
					return null;
				}

				var result = "";

				for (i = 0; i < this._toggleInputs.length; i++) {
					if (this._toggleInputs[i].checked) {
						if (result !== "") {
							result += this.hostConfig.choiceSetInputValueSeparator;
						}

						result += this._toggleInputs[i].value;
					}
				}

				return result === "" ? null : result;
			}
		}
	});

	return UI5ChoiceSet;
});