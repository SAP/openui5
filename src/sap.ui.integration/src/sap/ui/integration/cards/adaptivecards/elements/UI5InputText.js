/*!
 * ${copyright}
 */
sap.ui.define(["sap/ui/integration/thirdparty/adaptivecards"], function (AdaptiveCards) {
	"use strict";
	function UI5InputText() {
		AdaptiveCards.TextInput.apply(this, arguments);
	}
	/**
	 * Constructor for a new <code>UI5InputText</code>.
	 *
	 * @class
	 * An object that overwrites Microsoft's Adaptive Card <code>Input.Text</code> element by replacing it with
	 * <code>ui5-input</code> or <code>ui5-textarea<code> UI5 web component.
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @private
	 * @since 1.74
	 */
	UI5InputText.prototype = Object.create(AdaptiveCards.TextInput.prototype);
	UI5InputText.prototype.internalRender = function () {
		//when this.isMultiline is true, we have to render an ui5-textarea instead of ui5-input
		if (this.isMultiline) {
			var oTextArea = document.createElement("ui5-textarea");
			oTextArea.id = this.id;
			oTextArea.placeholder = this.placeholder || "";
			oTextArea.value = this.defaultValue || "";
			oTextArea.maxlength = this.maxLength || null;

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
		oInput.maxlength = this.maxLength || null;
		oInput.addEventListener("change", function () {
			this.valueChanged();
		}.bind(this));
		return oInput;
	};
	return UI5InputText;
});