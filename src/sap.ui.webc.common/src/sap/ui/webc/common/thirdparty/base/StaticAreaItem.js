sap.ui.define(['./StaticArea', './updateShadowRoot', './Render', './util/getEffectiveContentDensity', './CustomElementsScopeUtils', './locale/getEffectiveDir'], function (StaticArea, updateShadowRoot, Render, getEffectiveContentDensity, CustomElementsScopeUtils, getEffectiveDir) { 'use strict';

	class StaticAreaItem extends HTMLElement {
		constructor() {
			super();
			this._rendered = false;
			this.attachShadow({ mode: "open" });
		}
		setOwnerElement(ownerElement) {
			this.ownerElement = ownerElement;
			this.classList.add(this.ownerElement._id);
			if (this.ownerElement.hasAttribute("data-ui5-static-stable")) {
				this.setAttribute("data-ui5-stable", this.ownerElement.getAttribute("data-ui5-static-stable"));
			}
		}
		update() {
			if (this._rendered) {
				this._updateContentDensity();
				this._updateDirection();
				updateShadowRoot(this.ownerElement, true);
			}
		}
		_updateContentDensity() {
			if (getEffectiveContentDensity(this.ownerElement) === "compact") {
				this.classList.add("sapUiSizeCompact");
				this.classList.add("ui5-content-density-compact");
			} else {
				this.classList.remove("sapUiSizeCompact");
				this.classList.remove("ui5-content-density-compact");
			}
		}
		_updateDirection() {
			const dir = getEffectiveDir(this.ownerElement);
			if (dir) {
				this.setAttribute("dir", dir);
			} else {
				this.removeAttribute("dir");
			}
		}
		async getDomRef() {
			this._updateContentDensity();
			if (!this._rendered) {
				this._rendered = true;
				updateShadowRoot(this.ownerElement, true);
			}
			await Render.renderFinished();
			return this.shadowRoot;
		}
		static getTag() {
			const pureTag = "ui5-static-area-item";
			const suffix = CustomElementsScopeUtils.getEffectiveScopingSuffixForTag(pureTag);
			if (!suffix) {
				return pureTag;
			}
			return `${pureTag}-${suffix}`;
		}
		static createInstance() {
			if (!customElements.get(StaticAreaItem.getTag())) {
				customElements.define(StaticAreaItem.getTag(), StaticAreaItem);
			}
			return document.createElement(this.getTag());
		}
	}

	return StaticAreaItem;

});
