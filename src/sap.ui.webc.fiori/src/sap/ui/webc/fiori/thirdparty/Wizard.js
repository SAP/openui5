sap.ui.define(['sap/ui/webc/common/thirdparty/base/UI5Element', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer', 'sap/ui/webc/common/thirdparty/base/i18nBundle', 'sap/ui/webc/common/thirdparty/base/delegate/ItemNavigation', 'sap/ui/webc/common/thirdparty/base/types/NavigationMode', 'sap/ui/webc/common/thirdparty/base/types/Float', 'sap/ui/webc/common/thirdparty/base/util/clamp', 'sap/ui/webc/common/thirdparty/base/delegate/ResizeHandler', 'sap/ui/webc/common/thirdparty/base/Device', 'sap/ui/webc/common/thirdparty/base/util/debounce', 'sap/ui/webc/common/thirdparty/base/util/FocusableElements', 'sap/ui/webc/main/thirdparty/Button', 'sap/ui/webc/main/thirdparty/ResponsivePopover', './generated/i18n/i18n-defaults', './WizardTab', './WizardStep', './generated/templates/WizardTemplate.lit', './generated/templates/WizardPopoverTemplate.lit', './generated/themes/Wizard.css', './generated/themes/WizardPopover.css'], function (UI5Element, litRender, i18nBundle, ItemNavigation, NavigationMode, Float, clamp, ResizeHandler, Device, debounce, FocusableElements, Button, ResponsivePopover, i18nDefaults, WizardTab, WizardStep, WizardTemplate_lit, WizardPopoverTemplate_lit, Wizard_css, WizardPopover_css) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var UI5Element__default = /*#__PURE__*/_interopDefaultLegacy(UI5Element);
	var litRender__default = /*#__PURE__*/_interopDefaultLegacy(litRender);
	var ItemNavigation__default = /*#__PURE__*/_interopDefaultLegacy(ItemNavigation);
	var NavigationMode__default = /*#__PURE__*/_interopDefaultLegacy(NavigationMode);
	var Float__default = /*#__PURE__*/_interopDefaultLegacy(Float);
	var clamp__default = /*#__PURE__*/_interopDefaultLegacy(clamp);
	var ResizeHandler__default = /*#__PURE__*/_interopDefaultLegacy(ResizeHandler);
	var debounce__default = /*#__PURE__*/_interopDefaultLegacy(debounce);
	var Button__default = /*#__PURE__*/_interopDefaultLegacy(Button);
	var ResponsivePopover__default = /*#__PURE__*/_interopDefaultLegacy(ResponsivePopover);

	const MIN_STEP_WIDTH_NO_TITLE = 64;
	const MIN_STEP_WIDTH_WITH_TITLE = 200;
	const EXPANDED_STEP = "data-ui5-wizard-expanded-tab";
	const AFTER_EXPANDED_STEP = "data-ui5-wizard-expanded-tab-next";
	const AFTER_CURRENT_STEP = "data-ui5-wizard-after-current-tab";
	const BEFORE_EXPANDED_STEP = "data-ui5-wizard-expanded-tab-prev";
	const STEP_SWITCH_THRESHOLDS = {
		MIN: 0.5,
		DEFAULT: 0.7,
		MAX: 1,
	};
	const metadata = {
		tag: "ui5-wizard",
		managedSlots: true,
		properties:  {
			accessibleName: {
				type: String,
				defaultValue: undefined,
			},
			width: {
				type: Float__default,
			},
			 stepSwitchThreshold: {
				type: Float__default,
				defaultValue: STEP_SWITCH_THRESHOLDS.DEFAULT,
			},
			contentHeight: {
				type: Float__default,
			},
			_groupedTabs: {
				type: String,
				multiple: true,
			},
		},
		slots:  {
			"default": {
				propertyName: "steps",
				type: HTMLElement,
				"individualSlots": true,
				invalidateOnChildChange: true,
			},
		},
		events:  {
			"step-change": {
				detail: {
					step: { type: HTMLElement },
					previousStep: { type: HTMLElement },
					changeWithClick: { Boolean },
				},
			},
		},
	};
	class Wizard extends UI5Element__default {
		constructor() {
			super();
			this.stepScrollOffsets = [];
			this._groupedTabs = [];
			this.selectedStepIndex = 0;
			this.previouslySelectedStepIndex = 0;
			this.selectionRequestedByClick = false;
			this._prevWidth = 0;
			this._prevContentHeight = 0;
			this.selectionRequestedByScroll = false;
			this._itemNavigation = new ItemNavigation__default(this, {
				navigationMode: NavigationMode__default.Horizontal,
				getItemsCallback: () => this.enabledStepsInHeaderDOM,
			});
			this._onStepResize = this.onStepResize.bind(this);
			this.i18nBundle = i18nBundle.getI18nBundle("@ui5/webcomponents-fiori");
		}
		static get metadata() {
			return metadata;
		}
		static get render() {
			return litRender__default;
		}
		get classes() {
			return {
				popover: {
					"ui5-wizard-responsive-popover": true,
					"ui5-wizard-popover": !Device.isPhone(),
					"ui5-wizard-dialog": Device.isPhone(),
				},
			};
		}
		static get styles() {
			return Wizard_css;
		}
		static get staticAreaStyles() {
			return WizardPopover_css;
		}
		static get template() {
			return WizardTemplate_lit;
		}
		static get dependencies() {
			return [
				WizardTab,
				WizardStep,
				ResponsivePopover__default,
				Button__default,
			];
		}
		static async onDefine() {
			await i18nBundle.fetchI18nBundle("@ui5/webcomponents-fiori");
		}
		static get PHONE_BREAKPOINT() {
			return 599;
		}
		static get SCROLL_DEBOUNCE_RATE() {
			return 25;
		}
		static get CONTENT_TOP_OFFSET() {
			return 32;
		}
		static get staticAreaTemplate() {
			return WizardPopoverTemplate_lit;
		}
		onExitDOM() {
			this.detachStepsResizeObserver();
		}
		onBeforeRendering() {
			this.syncSelection();
		}
		onAfterRendering() {
			this.storeStepScrollOffsets();
			if (this.previouslySelectedStepIndex !== this.selectedStepIndex) {
				this.scrollToSelectedStep();
			}
			this.attachStepsResizeObserver();
			this.previouslySelectedStepIndex = this.selectedStepIndex;
		}
		syncSelection() {
			if (this.stepsCount === 0) {
				return;
			}
			if (this.selectedStepsCount === 0) {
				this.selectFirstStep();
				console.warn("Selecting the first step: no selected step is defined.");
			}
			if (this.selectedStepsCount > 1) {
				this.selectLastSelectedStep();
				console.warn(`Selecting the last step defined as selected: multiple selected steps are defined.`);
			}
			if (this.selectedStep && this.selectedStep.disabled) {
				console.warn("The selected step is disabled: you need to enable it in order to interact with the step.");
			}
			this.selectedStepIndex = this.getSelectedStepIndex();
		}
		selectFirstStep() {
			this.deselectAll();
			this.slottedSteps[0].selected = true;
			this.slottedSteps[0].disabled = false;
		}
		selectLastSelectedStep() {
			const lastSelectedStep = this.lastSelectedStep;
			if (lastSelectedStep) {
				this.deselectAll();
				lastSelectedStep.selected = true;
				lastSelectedStep.disabled = false;
			}
		}
		deselectAll() {
			this.slottedSteps.forEach(step => {
				step.selected = false;
			});
		}
		storeStepScrollOffsets() {
			this.stepScrollOffsets = this.slottedSteps.map(step => {
				const contentItem = this.getStepWrapperByRefId(step._id);
				return contentItem.offsetTop + contentItem.offsetHeight - Wizard.CONTENT_TOP_OFFSET;
			});
		}
		onSelectionChangeRequested(event) {
			this.selectionRequestedByClick = true;
			this.changeSelectionByStepAction(event.target);
		}
		onScroll(event) {
			if (this.selectionRequestedByClick) {
				this.selectionRequestedByClick = false;
				return;
			}
			debounce__default(this.changeSelectionByScroll.bind(this, event.target.scrollTop), Wizard.SCROLL_DEBOUNCE_RATE);
		}
		onStepInHeaderFocused(event) {
			this._itemNavigation.setCurrentItem(event.target);
		}
		onStepResize() {
			this.width = this.getBoundingClientRect().width;
			this.contentHeight = this.getContentHeight();
			if (this._prevWidth !== this.width || this.contentHeight !== this._prevContentHeight) {
				this._closeRespPopover();
			}
			this._prevWidth = this.width;
			this._prevContentHeight = this.contentHeight;
		}
		attachStepsResizeObserver() {
			this.stepsDOM.forEach(stepDOM => {
				ResizeHandler__default.deregister(stepDOM, this._onStepResize);
				ResizeHandler__default.register(stepDOM, this._onStepResize);
			});
		}
		detachStepsResizeObserver() {
			this.stepsDOM.forEach(stepDOM => {
				ResizeHandler__default.deregister(stepDOM, this._onStepResize);
			});
		}
		_adjustHeaderOverflow() {
			let counter = 0;
			let isForward = true;
			const iWidth = this.width;
			const iCurrStep = this.getSelectedStepIndex();
			const iStepsToShow = this.steps.length ? Math.floor(iWidth / MIN_STEP_WIDTH_WITH_TITLE) : Math.floor(iWidth / MIN_STEP_WIDTH_NO_TITLE);
			const tabs = this.shadowRoot.querySelectorAll("[ui5-wizard-tab]");
			if (!tabs.length) {
				return;
			}
			[].forEach.call(tabs, (step, index) => {
				step.setAttribute(EXPANDED_STEP, false);
				step.setAttribute(BEFORE_EXPANDED_STEP, false);
				step.setAttribute(AFTER_EXPANDED_STEP, false);
				if (index > iCurrStep) {
					tabs[index].setAttribute(AFTER_CURRENT_STEP, true);
				} else {
					tabs[index].removeAttribute(AFTER_CURRENT_STEP);
				}
			});
			if (tabs[iCurrStep]) {
				tabs[iCurrStep].setAttribute(EXPANDED_STEP, true);
			}
			for (let i = 1; i < iStepsToShow; i++) {
				if (isForward) {
					counter += 1;
				}
				if (isForward && tabs[iCurrStep + counter]) {
					tabs[iCurrStep + counter].setAttribute(EXPANDED_STEP, true);
					isForward = !isForward;
				} else if (!isForward && tabs[iCurrStep - counter]) {
					tabs[iCurrStep - counter].setAttribute(EXPANDED_STEP, true);
					isForward = !isForward;
				} else if (tabs[iCurrStep + counter + 1]) {
					counter += 1;
					tabs[iCurrStep + counter].setAttribute(EXPANDED_STEP, true);
					isForward = true;
				} else if (tabs[iCurrStep - counter]) {
					tabs[iCurrStep - counter].setAttribute(EXPANDED_STEP, true);
					counter += 1;
					isForward = false;
				}
			}
			for (let i = 0; i < tabs.length; i++) {
				if (tabs[i].getAttribute(EXPANDED_STEP) === "true" && tabs[i - 1] && tabs[i - 1].getAttribute(EXPANDED_STEP) === "false") {
					tabs[i - 1].setAttribute(BEFORE_EXPANDED_STEP, true);
				}
				if (tabs[i].getAttribute(EXPANDED_STEP) === "false" && tabs[i - 1] && tabs[i - 1].getAttribute(EXPANDED_STEP) === "true") {
					tabs[i].setAttribute(AFTER_EXPANDED_STEP, true);
					break;
				}
			}
		}
		_isGroupAtStart(selectedStep) {
			const iStepNumber = this.stepsInHeaderDOM.indexOf(selectedStep);
			return selectedStep.getAttribute(EXPANDED_STEP) === "false" && selectedStep.getAttribute(BEFORE_EXPANDED_STEP) === "true" && iStepNumber > 0;
		}
		_isGroupAtEnd(selectedStep) {
			const iStepNumber = this.stepsInHeaderDOM.indexOf(selectedStep);
			return selectedStep.getAttribute(EXPANDED_STEP) === "false" && selectedStep.getAttribute(AFTER_EXPANDED_STEP) === "true" && (iStepNumber + 1 < this.steps.length);
		}
		async _showPopover(oDomTarget, bAtStart) {
			const tabs = Array.from(this.shadowRoot.querySelectorAll("[ui5-wizard-tab]"));
			this._groupedTabs = [];
			const iFromStep = bAtStart ? 0 : this.stepsInHeaderDOM.indexOf(oDomTarget);
			const iToStep = bAtStart ? this.stepsInHeaderDOM.indexOf(oDomTarget) : tabs.length - 1;
			for (let i = iFromStep; i <= iToStep; i++) {
				this._groupedTabs.push(tabs[i]);
			}
			const responsivePopover = await this._respPopover();
			responsivePopover.showAt(oDomTarget);
		}
		async _onGroupedTabClick(event) {
			if (this._isGroupAtStart(event.target)) {
				return this._showPopover(event.target, true);
			}
			if (this._isGroupAtEnd(event.target)) {
				return this._showPopover(event.target, false);
			}
		}
		_onOverflowStepButtonClick(event) {
			const tabs = Array.from(this.shadowRoot.querySelectorAll("[ui5-wizard-tab]"));
			const stepRefId = event.target.getAttribute("data-ui5-header-tab-ref-id");
			const stepToSelect = this.slottedSteps[stepRefId - 1];
			const selectedStep = this.selectedStep;
			const newlySelectedIndex = this.slottedSteps.indexOf(stepToSelect);
			this.switchSelectionFromOldToNewStep(selectedStep, stepToSelect, newlySelectedIndex, true);
			this._closeRespPopover();
			tabs[newlySelectedIndex].focus();
		}
		async _closeRespPopover() {
			const responsivePopover = await this._respPopover();
			responsivePopover && responsivePopover.close();
		}
		async _respPopover() {
			const staticAreaItem = await this.getStaticAreaItemDomRef();
			return staticAreaItem.querySelector(`.ui5-wizard-responsive-popover`);
		}
		changeSelectionByScroll(scrollPos) {
			const newlySelectedIndex = this.getClosestStepIndexByScrollPos(scrollPos);
			if (this.selectedStepIndex === newlySelectedIndex) {
				return;
			}
			if (newlySelectedIndex >= 0 && newlySelectedIndex <= this.stepsCount - 1) {
				const stepToSelect = this.slottedSteps[newlySelectedIndex];
				this.switchSelectionFromOldToNewStep(this.selectedStep, stepToSelect, newlySelectedIndex, false);
				this.selectionRequestedByScroll = true;
			}
		}
		async changeSelectionByStepAction(stepInHeader) {
			const stepRefId = stepInHeader.getAttribute("data-ui5-content-ref-id");
			const selectedStep = this.selectedStep;
			const stepToSelect = this.getStepByRefId(stepRefId);
			const bExpanded = stepInHeader.getAttribute(EXPANDED_STEP) === "true";
			const newlySelectedIndex = this.slottedSteps.indexOf(stepToSelect);
			const firstFocusableElement = await FocusableElements.getFirstFocusableElement(stepToSelect.firstElementChild);
			firstFocusableElement.focus();
			if (selectedStep === stepToSelect) {
				this.scrollToContentItem(this.selectedStepIndex);
				return;
			}
			if (bExpanded || (!bExpanded && (newlySelectedIndex === 0 || newlySelectedIndex === this.steps.length - 1))) {
				this.switchSelectionFromOldToNewStep(selectedStep, stepToSelect, newlySelectedIndex, true);
			}
		}
		getContentHeight() {
			let contentHeight = 0;
			this.stepsDOM.forEach(step => {
				contentHeight += step.getBoundingClientRect().height;
			});
			return contentHeight;
		}
		getStepAriaLabelText(step, ariaLabel) {
			return this.i18nBundle.getText(i18nDefaults.WIZARD_STEP_ARIA_LABEL, ariaLabel);
		}
		get stepsDOM() {
			return Array.from(this.shadowRoot.querySelectorAll(".ui5-wiz-content-item"));
		}
		get _stepsInHeader() {
			return this.getStepsInfo();
		}
		get _steps() {
			const lastEnabledStepIndex = this.getLastEnabledStepIndex();
			return this.steps.map((step, idx) => {
				step.stretch = idx === lastEnabledStepIndex;
				return step;
			});
		}
		get stepsCount() {
			return this.slottedSteps.length;
		}
		get selectedStep() {
			if (this.selectedStepsCount) {
				return this.selectedSteps[0];
			}
			return null;
		}
		get lastSelectedStep() {
			if (this.selectedStepsCount) {
				return this.selectedSteps[this.selectedStepsCount - 1];
			}
			return null;
		}
		get selectedSteps() {
			return this.slottedSteps.filter(step => step.selected);
		}
		get enabledSteps() {
			return this.slottedSteps.filter(step => !step.disabled);
		}
		get selectedStepsCount() {
			return this.selectedSteps.length;
		}
		get slottedSteps() {
			return this.getSlottedNodes("steps");
		}
		get contentDOM() {
			return this.shadowRoot.querySelector(`.ui5-wiz-content`);
		}
		get stepsInHeaderDOM() {
			return Array.from(this.shadowRoot.querySelectorAll("[ui5-wizard-tab]"));
		}
		get enabledStepsInHeaderDOM() {
			return this.stepsInHeaderDOM.filter(step => !step.disabled);
		}
		get phoneMode() {
			if (Device.isPhone()) {
				return true;
			}
			return this.width <= Wizard.PHONE_BREAKPOINT;
		}
		get navAriaRoleDescription() {
			return this.i18nBundle.getText(i18nDefaults.WIZARD_NAV_ARIA_ROLE_DESCRIPTION);
		}
		get navAriaLabelText() {
			return this.i18nBundle.getText(i18nDefaults.WIZARD_NAV_ARIA_LABEL);
		}
		get navAriaDescribedbyText() {
			return this.i18nBundle.getText(i18nDefaults.WIZARD_LIST_ARIA_DESCRIBEDBY);
		}
		get listAriaLabelText() {
			return this.i18nBundle.getText(i18nDefaults.WIZARD_LIST_ARIA_LABEL);
		}
		get actionSheetStepsText() {
			return this.i18nBundle.getText(i18nDefaults.WIZARD_ACTIONSHEET_STEPS_ARIA_LABEL);
		}
		get navStepDefaultHeading() {
			return this.i18nBundle.getText(i18nDefaults.WIZARD_NAV_STEP_DEFAULT_HEADING);
		}
		get optionalStepText() {
			return this.i18nBundle.getText(i18nDefaults.WIZARD_OPTIONAL_STEP_ARIA_LABEL);
		}
		get activeStepText() {
			return this.i18nBundle.getText(i18nDefaults.WIZARD_STEP_ACTIVE);
		}
		get inactiveStepText() {
			return this.i18nBundle.getText(i18nDefaults.WIZARD_STEP_INACTIVE);
		}
		get ariaLabelText() {
			return this.accessibleName || this.i18nBundle.getText(i18nDefaults.WIZARD_NAV_ARIA_ROLE_DESCRIPTION);
		}
		get effectiveStepSwitchThreshold() {
			return clamp__default(this.stepSwitchThreshold, STEP_SWITCH_THRESHOLDS.MIN, STEP_SWITCH_THRESHOLDS.MAX);
		}
		getStepsInfo() {
			const lastEnabledStepIndex = this.getLastEnabledStepIndex();
			const stepsCount = this.stepsCount;
			const selectedStepIndex = this.getSelectedStepIndex();
			let inintialZIndex = this.steps.length + 10;
			let accInfo;
			this._adjustHeaderOverflow();
			return this.steps.map((step, idx) => {
				const pos = idx + 1;
				const hideSeparator = (idx === stepsCount - 1) && !step.branching;
				const isOptional = step.subtitleText ? this.optionalStepText : "";
				const stepStateText = step.disabled ? this.inactiveStepText : this.activeStepText;
				const ariaLabel = (step.titleText ? `${pos} ${step.titleText} ${stepStateText} ${isOptional}` : `${this.navStepDefaultHeading} ${pos} ${stepStateText} ${isOptional}`).trim();
				const isAfterCurrent = (idx > selectedStepIndex);
				accInfo = {
					"ariaSetsize": stepsCount,
					"ariaPosinset": pos,
					"ariaLabel": this.getStepAriaLabelText(step, ariaLabel),
				};
				return {
					icon: step.icon,
					titleText: step.titleText,
					subtitleText: step.subtitleText,
					number: pos,
					selected: step.selected,
					disabled: step.disabled,
					hideSeparator,
					activeSeparator: (idx < lastEnabledStepIndex) && !step.disabled,
					branchingSeparator: step.branching,
					pos,
					accInfo,
					refStepId: step._id,
					tabIndex: this.selectedStepIndex === idx ? "0" : "-1",
					styles: `z-index: ${isAfterCurrent ? --inintialZIndex : 1}`,
				};
			});
		}
		getSelectedStepIndex() {
			if (this.selectedStep) {
				return this.slottedSteps.indexOf(this.selectedStep);
			}
			return 0;
		}
		getLastEnabledStepIndex() {
			let lastEnabledStepIndex = 0;
			this.slottedSteps.forEach((step, idx) => {
				if (!step.disabled) {
					lastEnabledStepIndex = idx;
				}
			});
			return lastEnabledStepIndex;
		}
		getStepByRefId(refId) {
			return this.slottedSteps.find(step => step._id === refId);
		}
		getStepWrapperByRefId(refId) {
			return this.shadowRoot.querySelector(`[data-ui5-content-item-ref-id=${refId}]`);
		}
		getStepWrapperByIdx(idx) {
			return this.getStepWrapperByRefId(this.steps[idx]._id);
		}
		scrollToSelectedStep() {
			if (!this.selectionRequestedByScroll) {
				this.scrollToContentItem(this.selectedStepIndex);
			}
			this.selectionRequestedByScroll = false;
		}
		scrollToContentItem(stepIndex) {
			this.contentDOM.scrollTop = this.getClosestScrollPosByStepIndex(stepIndex);
		}
		getClosestScrollPosByStepIndex(stepIndex) {
			if (stepIndex === 0) {
				return 0;
			}
			for (let closestStepIndex = stepIndex - 1; closestStepIndex >= 0; closestStepIndex--) {
				if (this.stepScrollOffsets[closestStepIndex] > 0) {
					return this.stepScrollOffsets[closestStepIndex];
				}
			}
			return 0;
		}
		getClosestStepIndexByScrollPos(scrollPos) {
			for (let closestStepIndex = 0; closestStepIndex <= this.stepScrollOffsets.length - 1; closestStepIndex++) {
				const stepScrollOffset = this.stepScrollOffsets[closestStepIndex];
				const step = this.getStepWrapperByIdx(closestStepIndex);
				const switchStepBoundary = step.offsetTop + (step.offsetHeight * this.effectiveStepSwitchThreshold);
				if (stepScrollOffset > 0 && scrollPos < stepScrollOffset) {
					if (scrollPos > switchStepBoundary) {
						return closestStepIndex + 1;
					}
					return closestStepIndex;
				}
			}
			return this.selectedStepIndex;
		}
		switchSelectionFromOldToNewStep(selectedStep, stepToSelect, stepToSelectIndex, changeWithClick) {
			if (selectedStep && stepToSelect) {
				selectedStep.selected = false;
				stepToSelect.selected = true;
				this.fireEvent("step-change", {
					step: stepToSelect,
					previousStep: selectedStep,
					changeWithClick,
				});
				this.selectedStepIndex = stepToSelectIndex;
			}
		}
		sortAscending(a, b) {
			if (a < b) {
				return -1;
			}
			if (a > b) {
				return 1;
			}
			return 0;
		}
	}
	Wizard.define();

	return Wizard;

});
