/*!
 * ${copyright}
 */
sap.ui.define([
	'sap/ui/core/library',
	'./FormHelper'
],
(
	coreLibrary,
	FormHelper
) => {
	"use strict";

	const TitleLevel = coreLibrary.TitleLevel;

	/**
	 * Utility class with functions to manage titles in the Form
	 *
	 * @namespace
	 * @author SAP SE
	 * @private
	 * @ui5-restricted sap.ui.layout.form
	 * @since 1.152
	 * @alias sap.ui.layout.form.FormTitleUtil
	 */
	const FormTitleUtil = {

		/**
		 * Handles a change on the <code>title</code> aggregation
		 *
		 * Needs to be called on scope of {@link sap.ui.layout.form.Form Form} or {@link sap.ui.layout.form.FormContainer FormContainer}
		 *
		 * @param {object} oChanges Change from <code>ManagedObjectObserver</code>
		 * @private
		 * @ui5-restricted sap.ui.layout.form
		 */
		observeTitleChange: function(oChanges) {
			if (oChanges.object == this) { // Form/FormContainer changed
				if (oChanges.type === "parent") {
					_parentChanged.call(this, oChanges.mutation);
				} else if (oChanges.name === "title") {
					_titleChanged.call(this, oChanges);
				} else if (oChanges.name == "expandable") {
					_expandableChanged.call(this, oChanges.current);
				}
			} else { // title setting changed
				_titleUpdated.call(this, oChanges);
			}
		},

		/**
		 * Applies the default title levels to the used titles.
		 *
		 * Needs to be called after the theme specific levels are determined with scope of {@link sap.ui.layout.form.FormLayout FormLayout}.
		 *
		 * @private
		 * @ui5-restricted sap.ui.layout.form
		 */
		applyTitleLevels: function() {
			const oForm = this.getParent();
			if (oForm?.isA("sap.ui.layout.form.Form")) { // in generic tests FormLayout is asigned to UiArea
				_setDefaultLevel.call(oForm, this._sFormTitleLevel, this._sFormTitleStyle);

				oForm.getFormContainers().forEach((oFormContainer) => {
					_setDefaultLevel.call(oFormContainer, this._sFormSubTitleLevel, this._sFormSubTitleStyle);
				});
			}
		}

	};

	function _titleChanged(oChanges) {

		let oRenderingTitle = this.getAggregation("_renderingTitle");
		const vTitle = oChanges.child;

		if (oChanges.mutation === "insert") {
			const oInitPromise = FormHelper.init();
			if (oInitPromise) { // module needs to be loaded -> call FormHelper async
				oInitPromise.then(() => {
					_titleChanged.call(this, oChanges);
				});
				return;
			}

			if (oRenderingTitle) { // in some edge cases ManagedObjectObserver don't fire a "remove" but Insert again -> just destroy rendering title and create a new one
				oRenderingTitle.destroy();
				oRenderingTitle = null;
			}

			const oLevel = _getDefaultLevel.call(this);

			oRenderingTitle = FormHelper.createRenderingTitle(vTitle, this.getId() + "--title", oLevel.level, oLevel.style);
			if (oRenderingTitle) { // if Title contains not supportes settings (icon, emphasized) just render it by Form
				if (!this.isA("sap.ui.layout.form.FormContainer") || !this.getExpandable()) {
					oRenderingTitle.addStyleClass("sapUiFormTitle"); // to render the correct size
				}
				this.setAggregation("_renderingTitle", oRenderingTitle);
			}
			if (typeof vTitle !== "string") {
				this._oObserver.observe(vTitle, {
					properties: true,
					aggregations: true
				});
				vTitle.getRenderedDomRef = function() { // for RTA-overlay
					const oRenderingTitle = this.getParent()?.getAggregation("_renderingTitle");
					return oRenderingTitle?.getDomRef() || this.getDomRef();
				};
			}
		} else if (oRenderingTitle) { // remove
			this.destroyAggregation("_renderingTitle", true);
			if (typeof vTitle !== "string") {
				this._oObserver.unobserve(vTitle);
				delete vTitle.getRenderedDomRef;
			}
		}

	}

	function _titleUpdated(oChanges) {

		const oRenderingTitle = this.getAggregation("_renderingTitle");

		if (oRenderingTitle) {
			const oTitle = oChanges.object.isA("sap.ui.core.Title") ? oChanges.object : oChanges.object.getParent(); // If tooltip changed use parent

			if (oChanges.name === "tooltip" && typeof oChanges.child !== "string") {
				if (oChanges.mutation === "insert") {
					this._oObserver.observe(oChanges.child, {
						properties: true
					});
				} else {
					this._oObserver.unobserve(oChanges.child);
				}
			}

			const oLevel = _getDefaultLevel.call(this);

			FormHelper.updateRenderingTitle(oTitle, oRenderingTitle, oLevel.level, oLevel.style); // at this point in time FormHelper must be initialized (As RenderingTitle exist)
		} else { // no internal title -> check if it can be created now
			_titleChanged.call(this, {object: this, mutation: "insert", child: oChanges.object});
		}

	}

	function _expandableChanged(bExpandable) {

		const oRenderingTitle = this.getAggregation("_renderingTitle");

		if (oRenderingTitle) {
			oRenderingTitle.toggleStyleClass("sapUiFormTitle", !bExpandable); // to render the correct size
		}

	}

	function _parentChanged(sMutation) { // only for FormContainers

		if (sMutation === "set") { // assigned to Form -> update Levels
			const oLevel = _getDefaultLevel.call(this);
			_setDefaultLevel.call(this, oLevel.level, oLevel.style);
		}

	}

	function _getDefaultLevel() {

		const oLevel = {level: "", style: ""};
		if (this.isA("sap.ui.layout.form.Form")) {
			const oLayout = this.getLayout();
			oLevel.level = oLayout?._sFormTitleLevel || TitleLevel.H4;
			oLevel.style = oLayout?._sFormTitleStyle || TitleLevel.Auto;
		} else if (this.isA("sap.ui.layout.form.FormContainer")) {
			const oLayout = this.getParent()?.getLayout?.(); // as parent might be an XMLView in case a fragment is used
			oLevel.level = oLayout?._sFormSubTitleLevel || TitleLevel.H5;
			oLevel.style = oLayout?._sFormSubTitleStyle || TitleLevel.Auto;
		}

		return oLevel;

	}

	function _setDefaultLevel(sLevel, sStyle) {

		const oRenderingTitle = this.getAggregation("_renderingTitle");
		if (oRenderingTitle) {
			const vTitle = this.getTitle();
			if (vTitle) {
				FormHelper.updateRenderingTitle(vTitle, oRenderingTitle, sLevel, sStyle); // at this point in time FormHelper must be initialized (As RenderingTitle exist)
			} else { // as destroyTitle don't call Observer -> remove it now.
				_titleChanged.call(this, {object: this, mutation: "remove", child: ""});
			}
		}

	}

	return FormTitleUtil;
});