/*!
 * ${copyright}
 */
sap.ui.define(["sap/ui/integration/thirdparty/adaptivecards"], function (AdaptiveCards) {
	"use strict";

	return function (baseCssClass) {
		if (baseCssClass === 0) {
			baseCssClass = "ac-pushButton";
		}
		// Cache hostConfig for perf
		var hostConfig = this.parent.hostConfig;
		var buttonElement = document.createElement("ui5-button");
		this.addCssClasses(buttonElement);
		buttonElement.setAttribute("aria-label", this.title);
		buttonElement.type = "button";
		buttonElement.style.display = "flex";
		buttonElement.style.alignItems = "center";
		buttonElement.style.justifyContent = "center";
		var hasTitle = !AdaptiveCards.isNullOrEmpty(this.title);
		var titleElement = document.createElement("div");
		titleElement.style.overflow = "hidden";
		titleElement.style.textOverflow = "ellipsis";
		if (!(hostConfig.actions.iconPlacement === AdaptiveCards.ActionIconPlacement.AboveTitle || hostConfig.actions.allowTitleToWrap)) {
			titleElement.style.whiteSpace = "nowrap";
		}
		if (hasTitle) {
			titleElement.innerText = this.title;
		}
		if (AdaptiveCards.isNullOrEmpty(this.iconUrl)) {
			buttonElement.classList.add("noIcon");
			buttonElement.appendChild(titleElement);
		} else {
			var iconElement = document.createElement("img");
			iconElement.src = this.iconUrl;
			iconElement.style.width = hostConfig.actions.iconSize + "px";
			iconElement.style.height = hostConfig.actions.iconSize + "px";
			iconElement.style.flex = "0 0 auto";
			if (hostConfig.actions.iconPlacement === AdaptiveCards.ActionIconPlacement.AboveTitle) {
				buttonElement.classList.add("iconAbove");
				buttonElement.style.flexDirection = "column";
				if (hasTitle) {
					iconElement.style.marginBottom = "4px";
				}
			} else {
				buttonElement.classList.add("iconLeft");
				if (hasTitle) {
					iconElement.style.marginRight = "4px";
				}
			}
			buttonElement.appendChild(iconElement);
			buttonElement.appendChild(titleElement);
		}
		this._renderedElement = buttonElement;
	};
});
