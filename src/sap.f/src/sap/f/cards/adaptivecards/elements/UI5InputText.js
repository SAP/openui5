/*!
 * ${copyright}
 */
sap.ui.define(["sap/ui/integration/thirdparty/adaptivecards"], function (AdaptiveCards) {
	"use strict";
	function UI5InputText() {
		AdaptiveCards.TextInput.apply(this, arguments);
	}
	UI5InputText.prototype = Object.create(AdaptiveCards.TextInput.prototype);
	UI5InputText.prototype.internalRender = function () {
		if (this.isMultiline) {
			var oTextArea = document.createElement("ui5-textarea");
			oTextArea.id = this.id;
			oTextArea.placeholder = this.placeholder || "";
			oTextArea.value = this.defaultValue || "";
			oTextArea.maxLength = this.maxLength || null;
			oTextArea.maxLength = this.maxLength || null;
			oTextArea.addEventListener("change", function () {
				this.valueChanged();
			}.bind(this));
			return oTextArea;
		}
		var oInput = document.createElement("ui5-input");
		switch (this.style) {
			case 1:
				oInput.type = "Tel";
				break;
			case 2:
				oInput.type = "URL";
				break;
			case 3:
				oInput.type = "Email";
				break;
			default:
				oInput.type = "Text";
			}
		oInput.id = this.id;
		oInput.placeholder = this.placeholder || "";
		oInput.value = this.defaultValue || "";
		//oInput.maxLength = this.maxLength || null;
		oInput.addEventListener("change", function () {
			this.valueChanged();
		}.bind(this));
		return oInput;
	};
	return UI5InputText;
});