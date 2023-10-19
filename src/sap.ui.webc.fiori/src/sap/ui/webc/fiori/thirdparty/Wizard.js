sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/common/thirdparty/base/decorators/property", "sap/ui/webc/common/thirdparty/base/decorators/slot", "sap/ui/webc/common/thirdparty/base/decorators/event", "sap/ui/webc/common/thirdparty/base/decorators/customElement", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer", "sap/ui/webc/common/thirdparty/base/i18nBundle", "sap/ui/webc/common/thirdparty/base/delegate/ItemNavigation", "sap/ui/webc/common/thirdparty/base/types/NavigationMode", "sap/ui/webc/common/thirdparty/base/types/Float", "sap/ui/webc/common/thirdparty/base/util/clamp", "sap/ui/webc/common/thirdparty/base/delegate/ResizeHandler", "sap/ui/webc/common/thirdparty/base/Device", "sap/ui/webc/common/thirdparty/base/util/debounce", "sap/ui/webc/common/thirdparty/base/util/FocusableElements", "sap/ui/webc/main/thirdparty/Button", "sap/ui/webc/main/thirdparty/ResponsivePopover", "sap/ui/webc/main/thirdparty/generated/themes/BrowserScrollbar.css", "./types/WizardContentLayout", "./generated/i18n/i18n-defaults", "./WizardTab", "./WizardStep", "./generated/templates/WizardTemplate.lit", "./generated/templates/WizardPopoverTemplate.lit", "./generated/themes/Wizard.css", "./generated/themes/WizardPopover.css"], function (_exports, _UI5Element, _property, _slot, _event, _customElement, _LitRenderer, _i18nBundle, _ItemNavigation, _NavigationMode, _Float, _clamp, _ResizeHandler, _Device, _debounce, _FocusableElements, _Button, _ResponsivePopover, _BrowserScrollbar, _WizardContentLayout, _i18nDefaults, _WizardTab, _WizardStep, _WizardTemplate, _WizardPopoverTemplate, _Wizard, _WizardPopover) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _UI5Element = _interopRequireDefault(_UI5Element);
  _property = _interopRequireDefault(_property);
  _slot = _interopRequireDefault(_slot);
  _event = _interopRequireDefault(_event);
  _customElement = _interopRequireDefault(_customElement);
  _LitRenderer = _interopRequireDefault(_LitRenderer);
  _ItemNavigation = _interopRequireDefault(_ItemNavigation);
  _NavigationMode = _interopRequireDefault(_NavigationMode);
  _Float = _interopRequireDefault(_Float);
  _clamp = _interopRequireDefault(_clamp);
  _ResizeHandler = _interopRequireDefault(_ResizeHandler);
  _debounce = _interopRequireDefault(_debounce);
  _Button = _interopRequireDefault(_Button);
  _ResponsivePopover = _interopRequireDefault(_ResponsivePopover);
  _BrowserScrollbar = _interopRequireDefault(_BrowserScrollbar);
  _WizardContentLayout = _interopRequireDefault(_WizardContentLayout);
  _WizardTab = _interopRequireDefault(_WizardTab);
  _WizardStep = _interopRequireDefault(_WizardStep);
  _WizardTemplate = _interopRequireDefault(_WizardTemplate);
  _WizardPopoverTemplate = _interopRequireDefault(_WizardPopoverTemplate);
  _Wizard = _interopRequireDefault(_Wizard);
  _WizardPopover = _interopRequireDefault(_WizardPopover);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  var __decorate = void 0 && (void 0).__decorate || function (decorators, target, key, desc) {
    var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
  var Wizard_1;

  // Texts

  // Step in header and content

  // Template and Styles

  const MIN_STEP_WIDTH_NO_TITLE = 64;
  const MIN_STEP_WIDTH_WITH_TITLE = 200;
  const EXPANDED_STEP = "data-ui5-wizard-expanded-tab";
  const AFTER_EXPANDED_STEP = "data-ui5-wizard-expanded-tab-next";
  const AFTER_CURRENT_STEP = "data-ui5-wizard-after-current-tab";
  const BEFORE_EXPANDED_STEP = "data-ui5-wizard-expanded-tab-prev";
  const STEP_SWITCH_THRESHOLDS = {
    MIN: 0.5,
    DEFAULT: 0.7,
    MAX: 1
  };
  const RESPONSIVE_BREAKPOINTS = {
    "0": "S",
    "599": "M",
    "1023": "L",
    "1439": "XL"
  };
  /**
   * @class
   *
   * <h3 class="comment-api-title">Overview</h3>
   *
   * The <code>ui5-wizard</code> helps users to complete a complex task by dividing it into sections and guiding them through it.
   * It has two main areas - a navigation area at the top showing the step sequence and a content area below it.
   *
   * <h3>Structure</h3>
   * <h4>Navigation area</h4>
   * The top most area of the <code>ui5-wizard</code> is occupied by the navigation area.
   * It shows the sequence of steps, where the recommended number of steps is between 3 and 8 steps.
   * <ul>
   * <li> Steps can have different visual representations - numbers or icons.</li>
   * <li> Steps might have labels for better readability - titleText and subTitleText.</li>
   * <li> Steps are defined by using the <code>ui5-wizard-step</code> as slotted element within the <code>ui5-wizard</code>.</li>
   * </ul>
   *
   * <b>Note:</b> If no selected step is defined, the first step will be auto selected.
   * <br>
   * <b>Note:</b> If multiple selected steps are defined, the last step will be selected.
   *
   * <h3>CSS Shadow Parts</h3>
   *
   * <ui5-link target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/CSS/::part">CSS Shadow Parts</ui5-link> allow developers to style elements inside the Shadow DOM.
   * <br>
   * The <code>ui5-wizard</code> exposes the following CSS Shadow Parts:
   * <ul>
   * <li>navigator - Used to style the progress navigator of the <code>ui5-wizard</code>.</li>
   * <li>step-content - Used to style a <code>ui5-wizard-step</code> container.</li>
   * </ul>
   *
   * <h3>Keyboard Handling</h3>
   * The user can navigate using the following keyboard shortcuts:
   * <br>
   *
   * <h4>Wizard Progress Navigation</h4>
   * <ul>
   * 	<li>[LEFT], [DOWN] - Focus moves backward to the WizardProgressNavAnchors.</li>
   * 	<li>[UP], [RIGHT] - Focus moves forward to the WizardProgressNavAnchor.</li>
   * 	<li>[SPACE] or [ENTER], [RETURN] - Selects an active step</li>
   * 	<li>[HOME] or [PAGE UP] - Focus goes to the first step</li>
   * 	<li>[END] or [PAGE DOWN] - Focus goes to the last step</li>
   * </ul>
   *
   * <h4>Fast Navigation</h4>
   * This component provides a build in fast navigation group which can be used via <code>F6 / Shift + F6</code> or <code> Ctrl + Alt(Option) + Down /  Ctrl + Alt(Option) + Up</code>.
   * In order to use this functionality, you need to import the following module:
   * <code>import "@ui5/webcomponents-base/dist/features/F6Navigation.js"</code>
   *
   * <h4>Content</h4>
   * The content occupies the main part of the page. It can hold any type of HTML elements.
   * It's defined by using the <code>ui5-wizard-step</code> as slotted element within the <code>ui5-wizard</code>.
   *
   * <h3>Scrolling</h3>
   * The component handles user scrolling by selecting the closest step, based on the current scroll position
   * and scrolls to particular place, when the user clicks on the step within the navigation area.
   * <br><br>
   *
   * <b>Important:</b> In order the component's scrolling behaviour to work, it has to be limited from the outside parent element in terms of height.
   * The component or its parent has to be given percentage or absolute height. Otherwise, the component will be scrolled out with the entire page.
   * <br><br>
   * <b>For example:</b>
   * <br><br>
   * <code>&lt;ui5-dialog style="height: 80%"&gt;<br></code>
   * <code>&#9;&lt;ui5-wizard&gt;&lt;/ui5-wizard&gt;<br></code>
   * <code>&lt;/ui5-dialog&gt;</code>
   *
   * <h4>Moving to next step</h4>
   * The <code>ui5-wizard-step</code> provides the necessary API and it's up to the user of the component to use it to move to the next step.
   * You have to set its <code>selected</code> property (and remove the <code>disabled</code> one if set) to <code>true</code>.
   * The <code>ui5-wizard</code> will automatically scroll to the content of the newly selected step.
   * <br><br>
   *
   * The Fiori 3 guidelines recommends having a "nextStep" button in the content area.
   * You can place a button, or any other type of element to trigger step change, inside the <code>ui5-wizard-step</code>,
   * and show/hide it when certain fields are filled or user defined criteria is met.
   *
   * <h3>Usage</h3>
   * <h4>When to use:</h4>
   * When the user has to accomplish a long or unfamiliar task.
   *
   * <h4>When not to use:</h4>
   * When the task has less than 3 steps.
   *
   * <h3>Responsive Behavior</h3>
   * On small widths the step's titleText, subtitleText and separators in the navigation area shrink and from particular point the steps are grouped together and overlap.
   * Tapping on them will show a popover to select the step to navigate to. On mobile device, the grouped steps are presented within a dialog.
   *
   * <h3>ES6 Module Import</h3>
   * <code>import "@ui5/webcomponents-fiori/dist/Wizard.js";</code> (includes &lt;ui5-wizard-step/&gt;)
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webc.fiori.Wizard
   * @extends sap.ui.webc.base.UI5Element
   * @tagname ui5-wizard
   * @since 1.0.0-rc.10
   * @appenddocs sap.ui.webc.fiori.WizardStep
   * @public
   */
  let Wizard = Wizard_1 = class Wizard extends _UI5Element.default {
    constructor() {
      super();
      // Stores the scroll offsets of the steps,
      // e.g. the steps' starting point.
      this.stepScrollOffsets = [];
      // Stores references to the grouped steps.
      this._groupedTabs = [];
      // Keeps track of the currently selected step index.
      this.selectedStepIndex = 0;
      // Keeps track of the previously selected step index.
      this.previouslySelectedStepIndex = 0;
      // Indicates that selection will be changed
      // due to user click.
      this.selectionRequestedByClick = false;
      // Stores the previous width
      this._prevWidth = 0;
      // Stores the previous height
      this._prevContentHeight = 0;
      // Indicates that selection will be changed
      // due to user scroll.
      this.selectionRequestedByScroll = false;
      this._itemNavigation = new _ItemNavigation.default(this, {
        navigationMode: _NavigationMode.default.Auto,
        getItemsCallback: () => this.enabledStepsInHeaderDOM
      });
      this._onStepResize = this.onStepResize.bind(this);
    }
    get classes() {
      return {
        popover: {
          "ui5-wizard-responsive-popover": true,
          "ui5-wizard-popover": !(0, _Device.isPhone)(),
          "ui5-wizard-dialog": (0, _Device.isPhone)()
        }
      };
    }
    static async onDefine() {
      Wizard_1.i18nBundle = await (0, _i18nBundle.getI18nBundle)("@ui5/webcomponents-fiori");
    }
    static get SCROLL_DEBOUNCE_RATE() {
      return 25;
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
    /**
     * Normalizes the step selection as follows:
     * (1) If there is no selected step - the first step is going to be selected.
     * (2) If the selected steps are more than one - the last step is going to be selected.
     * (3) If the selected step is also disabled - log a warning.
     * @private
     */
    syncSelection() {
      if (this.stepsCount === 0) {
        return;
      }
      // If no selected steps -> select the first step.
      if (this.selectedStepsCount === 0) {
        this.selectFirstStep();
        console.warn("Selecting the first step: no selected step is defined."); // eslint-disable-line
      }
      // If there are multiple selected steps -> keep the last selected one.
      if (this.selectedStepsCount > 1) {
        this.selectLastSelectedStep();
        console.warn(`Selecting the last step defined as selected: multiple selected steps are defined.`); // eslint-disable-line
      }
      // If the selected step is defined as disabled - log warning.
      if (this.selectedStep && this.selectedStep.disabled) {
        console.warn("The selected step is disabled: you need to enable it in order to interact with the step."); // eslint-disable-line
      }
      // Place for improvement: If the selected step is not the first, enable all the prior steps
      this.selectedStepIndex = this.getSelectedStepIndex();
    }
    /**
     * Selects the first step.
     * @private
     */
    selectFirstStep() {
      this.deselectAll();
      this.slottedSteps[0].selected = true;
      this.slottedSteps[0].disabled = false;
    }
    /**
     * Selects the last step from multiple selected ones.
     * @private
     */
    selectLastSelectedStep() {
      const lastSelectedStep = this.lastSelectedStep;
      if (lastSelectedStep) {
        this.deselectAll();
        lastSelectedStep.selected = true;
        lastSelectedStep.disabled = false;
      }
    }
    /**
     * Deselects all steps.
     * @private
     */
    deselectAll() {
      this.slottedSteps.forEach(step => {
        step.selected = false;
      });
    }
    /**
     * Stores the scroll offsets of the steps,
     * e.g. the steps' starting point.
     *
     * <b>Note:</b> the disabled ones has negative offsets.
     * @private
     */
    storeStepScrollOffsets() {
      this.stepScrollOffsets = this.slottedSteps.map(step => {
        const contentItem = this.getStepWrapperByRefId(step._id);
        return contentItem.offsetTop + contentItem.offsetHeight;
      });
    }
    /**
     * Handles user click on steps' tabs within the header.
     * <b>Note:</b> the handler is bound in the template.
     * @param {MouseEvent} e
     * @private
     */
    onSelectionChangeRequested(e) {
      this.selectionRequestedByClick = true;
      this.changeSelectionByStepAction(e.target);
    }
    /**
     * Handles user scrolling with debouncing.
     * <b>Note:</b> the handler is bound in the template.
     * @param {MouseEvent} e
     * @private
     */
    onScroll(e) {
      if (this.selectionRequestedByClick) {
        this.selectionRequestedByClick = false;
        return;
      }
      (0, _debounce.default)(this.changeSelectionByScroll.bind(this, e.target.scrollTop), Wizard_1.SCROLL_DEBOUNCE_RATE);
    }
    /**
     * Handles when a step in the header is focused in order to update the <code>ItemNavigation</code>.
     * <b>Note:</b> the handler is bound in the template.
     * @param {FocusEvent} e
     * @private
     */
    onStepInHeaderFocused(e) {
      this._itemNavigation.setCurrentItem(e.target);
    }
    /**
     * Handles resize in order to:
     * (1) sync steps' scroll offset and selection
     * (2) adapt navition step header
     * @private
     */
    onStepResize() {
      this.width = this.getBoundingClientRect().width;
      this.contentHeight = this.getContentHeight();
      if (this._prevWidth !== this.width || this.contentHeight !== this._prevContentHeight) {
        this._closeRespPopover();
      }
      this._prevWidth = this.width;
      this._prevContentHeight = this.contentHeight;
      this._calcCurrentBreakpoint();
    }
    attachStepsResizeObserver() {
      this.stepsDOM.forEach(stepDOM => {
        _ResizeHandler.default.deregister(stepDOM, this._onStepResize);
        _ResizeHandler.default.register(stepDOM, this._onStepResize);
      });
    }
    detachStepsResizeObserver() {
      this.stepsDOM.forEach(stepDOM => {
        _ResizeHandler.default.deregister(stepDOM, this._onStepResize);
      });
    }
    _calcCurrentBreakpoint() {
      const breakpointDimensions = Object.keys(RESPONSIVE_BREAKPOINTS).reverse();
      const breakpoint = breakpointDimensions.find(size => Number(size) < this.width);
      this._breakpoint = breakpoint ? RESPONSIVE_BREAKPOINTS[breakpoint] : RESPONSIVE_BREAKPOINTS["0"];
    }
    /**
     * Updates the expanded attribute for each ui5-wizard-tab based on the ui5-wizard width
     * @private
     */
    _adjustHeaderOverflow() {
      let counter = 0;
      let isForward = true;
      const tabs = this.stepsInHeaderDOM;
      if (!tabs.length) {
        return;
      }
      const iWidth = this.progressNavigatorListDOM.getBoundingClientRect().width;
      const iCurrStep = this.getSelectedStepIndex();
      const iStepsToShow = this.steps.length ? Math.floor(iWidth / MIN_STEP_WIDTH_WITH_TITLE) : Math.floor(iWidth / MIN_STEP_WIDTH_NO_TITLE);
      [...tabs].forEach((step, index) => {
        step.setAttribute(EXPANDED_STEP, "false");
        step.setAttribute(BEFORE_EXPANDED_STEP, "false");
        step.setAttribute(AFTER_EXPANDED_STEP, "false");
        // Add "data-ui5-wizard-after-current-tab" to all tabs after the current one
        if (index > iCurrStep) {
          tabs[index].setAttribute(AFTER_CURRENT_STEP, "true");
        } else {
          tabs[index].removeAttribute(AFTER_CURRENT_STEP);
        }
      });
      // Add "data-ui5-wizard-expanded-tab" to the current step
      if (tabs[iCurrStep]) {
        tabs[iCurrStep].setAttribute(EXPANDED_STEP, "true");
      }
      // Set the "data-ui5-wizard-expanded-tab" to the steps that are expanded
      // The algorithm is as follows:
      // 1. A step towards the end is expanded
      // 	1.2. If there are no available steps towards the end a step towards the beginning is expanded
      // 2. A step towards the beginning is expanded
      // 	2.2. If there are no available steps towards the beginning a step towards the end is expanded
      for (let i = 1; i < iStepsToShow; i++) {
        if (isForward) {
          counter += 1;
        }
        if (isForward && tabs[iCurrStep + counter]) {
          tabs[iCurrStep + counter].setAttribute(EXPANDED_STEP, "true");
          isForward = !isForward;
        } else if (!isForward && tabs[iCurrStep - counter]) {
          tabs[iCurrStep - counter].setAttribute(EXPANDED_STEP, "true");
          isForward = !isForward;
        } else if (tabs[iCurrStep + counter + 1]) {
          counter += 1;
          tabs[iCurrStep + counter].setAttribute(EXPANDED_STEP, "true");
          isForward = true;
        } else if (tabs[iCurrStep - counter]) {
          tabs[iCurrStep - counter].setAttribute(EXPANDED_STEP, "true");
          counter += 1;
          isForward = false;
        }
      }
      // mark the topmost steps of both groups (in the beginning and the end),
      // using the "data-ui5-wizard-after-current-tab" and "data-ui5-wizard-expanded-tab-prev" attributes
      for (let i = 0; i < tabs.length; i++) {
        if (tabs[i].getAttribute(EXPANDED_STEP) === "true" && tabs[i - 1] && tabs[i - 1].getAttribute(EXPANDED_STEP) === "false") {
          tabs[i - 1].setAttribute(BEFORE_EXPANDED_STEP, "true");
        }
        if (tabs[i].getAttribute(EXPANDED_STEP) === "false" && tabs[i - 1] && tabs[i - 1].getAttribute(EXPANDED_STEP) === "true") {
          tabs[i].setAttribute(AFTER_EXPANDED_STEP, "true");
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
      return selectedStep.getAttribute(EXPANDED_STEP) === "false" && selectedStep.getAttribute(AFTER_EXPANDED_STEP) === "true" && iStepNumber + 1 < this.steps.length;
    }
    async _showPopover(oDomTarget, isAtStart) {
      const tabs = Array.from(this.stepsInHeaderDOM);
      this._groupedTabs = [];
      const iFromStep = isAtStart ? 0 : this.stepsInHeaderDOM.indexOf(oDomTarget);
      const iToStep = isAtStart ? this.stepsInHeaderDOM.indexOf(oDomTarget) : tabs.length - 1;
      for (let i = iFromStep; i <= iToStep; i++) {
        this._groupedTabs.push(tabs[i]);
      }
      const responsivePopover = await this._respPopover();
      responsivePopover.showAt(oDomTarget);
    }
    async _onGroupedTabClick(e) {
      const eTarget = e.target;
      if (this._isGroupAtStart(eTarget)) {
        return this._showPopover(eTarget, true);
      }
      if (this._isGroupAtEnd(eTarget)) {
        return this._showPopover(eTarget, false);
      }
    }
    _onOverflowStepButtonClick(e) {
      const tabs = Array.from(this.stepsInHeaderDOM);
      const eTarget = e.target;
      const stepRefId = eTarget.getAttribute("data-ui5-header-tab-ref-id");
      const stepToSelect = this.slottedSteps[Number(stepRefId) - 1];
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
    /**
     * Called upon <code>onScroll</code>.
     * Selects the closest step, based on the user scroll position.
     * @param {Integer} scrollPos the current scroll position
     * @private
     */
    changeSelectionByScroll(scrollPos) {
      const newlySelectedIndex = this.getClosestStepIndexByScrollPos(scrollPos);
      const stepToSelect = this.slottedSteps[newlySelectedIndex];
      // Skip if already selected - stop.
      if (this.selectedStepIndex === newlySelectedIndex) {
        return;
      }
      // If the calculated index is in range,
      // change selection and fire "step-change".
      if (!stepToSelect.disabled && newlySelectedIndex >= 0 && newlySelectedIndex <= this.stepsCount - 1) {
        this.switchSelectionFromOldToNewStep(this.selectedStep, stepToSelect, newlySelectedIndex, false);
        this.selectionRequestedByScroll = true;
      }
    }
    /**
     * Called upon <code>onSelectionChangeRequested</code>.
     * Selects the external step (ui5-wizard-step),
     * based on the clicked or activated via keyboard step in the header (ui5-wizard-tab).
     * @param {WizardTab} stepInHeader the step equivalent in the header
     * @private
     */
    async changeSelectionByStepAction(stepInHeader) {
      const stepRefId = stepInHeader.getAttribute("data-ui5-content-ref-id");
      const selectedStep = this.selectedStep;
      const stepToSelect = this.getStepByRefId(stepRefId);
      const bExpanded = stepInHeader.getAttribute(EXPANDED_STEP) === "true";
      const newlySelectedIndex = this.slottedSteps.indexOf(stepToSelect);
      const firstElementChild = stepToSelect.firstElementChild;
      const firstFocusableElement = await (0, _FocusableElements.getFirstFocusableElement)(firstElementChild);
      if (firstFocusableElement) {
        // Focus the first focusable element within the step content corresponding to the currently focused tab
        firstFocusableElement.focus();
      }
      // If the currently selected (active) step is clicked,
      // just scroll to its starting point and stop.
      if (selectedStep === stepToSelect) {
        this.scrollToContentItem(this.selectedStepIndex);
        return;
      }
      if (bExpanded || !bExpanded && (newlySelectedIndex === 0 || newlySelectedIndex === this.steps.length - 1)) {
        // Change selection and fire "step-change".
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
      return Wizard_1.i18nBundle.getText(_i18nDefaults.WIZARD_STEP_ARIA_LABEL, ariaLabel);
    }
    get stepsDOM() {
      return Array.from(this.shadowRoot.querySelectorAll(".ui5-wiz-content-item"));
    }
    get progressNavigatorListDOM() {
      return this.shadowRoot.querySelector(".ui5-wiz-nav-list");
    }
    get _stepsInHeader() {
      return this.getStepsInfo();
    }
    get _steps() {
      const lastEnabledStepIndex = this.getLastEnabledStepIndex();
      const stepsInfo = this.getStepsInfo();
      return this.steps.map((step, idx) => {
        step.stretch = idx === lastEnabledStepIndex;
        step.stepContentAriaLabel = `${this.navStepDefaultHeading} ${stepsInfo[idx].number} ${stepsInfo[idx].titleText}`;
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
      return this.stepsInHeaderDOM;
    }
    get navAriaRoleDescription() {
      return Wizard_1.i18nBundle.getText(_i18nDefaults.WIZARD_NAV_ARIA_ROLE_DESCRIPTION);
    }
    get navAriaLabelText() {
      return Wizard_1.i18nBundle.getText(_i18nDefaults.WIZARD_NAV_ARIA_LABEL);
    }
    get navAriaDescribedbyText() {
      return Wizard_1.i18nBundle.getText(_i18nDefaults.WIZARD_LIST_ARIA_DESCRIBEDBY);
    }
    get listAriaLabelText() {
      return Wizard_1.i18nBundle.getText(_i18nDefaults.WIZARD_LIST_ARIA_LABEL);
    }
    get actionSheetStepsText() {
      return Wizard_1.i18nBundle.getText(_i18nDefaults.WIZARD_ACTIONSHEET_STEPS_ARIA_LABEL);
    }
    get navStepDefaultHeading() {
      return Wizard_1.i18nBundle.getText(_i18nDefaults.WIZARD_NAV_STEP_DEFAULT_HEADING);
    }
    get optionalStepText() {
      return Wizard_1.i18nBundle.getText(_i18nDefaults.WIZARD_OPTIONAL_STEP_ARIA_LABEL);
    }
    get activeStepText() {
      return Wizard_1.i18nBundle.getText(_i18nDefaults.WIZARD_STEP_ACTIVE);
    }
    get inactiveStepText() {
      return Wizard_1.i18nBundle.getText(_i18nDefaults.WIZARD_STEP_INACTIVE);
    }
    get ariaLabelText() {
      return Wizard_1.i18nBundle.getText(_i18nDefaults.WIZARD_NAV_ARIA_ROLE_DESCRIPTION);
    }
    get effectiveStepSwitchThreshold() {
      return (0, _clamp.default)(this.stepSwitchThreshold, STEP_SWITCH_THRESHOLDS.MIN, STEP_SWITCH_THRESHOLDS.MAX);
    }
    /**
     * Returns an array of data objects, based on the user defined steps
     * to later build the steps (tabs) within the header.
     * @returns {Array<StepInfo>}
     * @private
     */
    getStepsInfo() {
      const lastEnabledStepIndex = this.getLastEnabledStepIndex();
      const stepsCount = this.stepsCount;
      const selectedStepIndex = this.getSelectedStepIndex();
      let inintialZIndex = this.steps.length + 10;
      let accInfo;
      this._adjustHeaderOverflow();
      return this.steps.map((step, idx) => {
        const pos = idx + 1;
        // Hide separator if it's the last step and it's not a branching one
        const hideSeparator = idx === stepsCount - 1 && !step.branching;
        const isOptional = step.subtitleText ? this.optionalStepText : "";
        const stepStateText = step.disabled ? this.inactiveStepText : this.activeStepText;
        const ariaLabel = (step.titleText ? `${pos} ${step.titleText} ${stepStateText} ${isOptional}` : `${this.navStepDefaultHeading} ${pos} ${stepStateText} ${isOptional}`).trim();
        const isAfterCurrent = idx > selectedStepIndex;
        accInfo = {
          "ariaSetsize": stepsCount,
          "ariaPosinset": pos,
          "ariaLabel": this.getStepAriaLabelText(step, ariaLabel)
        };
        const stepInfo = {
          icon: step.icon,
          titleText: step.titleText,
          subtitleText: step.subtitleText,
          number: pos,
          selected: step.selected,
          disabled: step.disabled,
          hideSeparator,
          activeSeparator: idx < lastEnabledStepIndex && !step.disabled,
          branchingSeparator: step.branching,
          pos,
          accInfo,
          refStepId: step._id,
          tabIndex: this.selectedStepIndex === idx ? "0" : "-1",
          styles: {
            zIndex: isAfterCurrent ? --inintialZIndex : 1
          }
        };
        return stepInfo;
      });
    }
    /**
     * Returns the index of the selected step.
     * @returns {Integer}
     * @private
     */
    getSelectedStepIndex() {
      if (this.selectedStep) {
        return this.slottedSteps.indexOf(this.selectedStep);
      }
      return 0;
    }
    /**
     * Returns the index of the last enabled step.
     * @returns {Integer}
     * @private
     */
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
    /**
     * Scrolls to the content of the selected step, used in <code>onAfterRendering</cod>.
     * @private
     */
    scrollToSelectedStep() {
      if (!this.selectionRequestedByScroll) {
        this.scrollToContentItem(this.selectedStepIndex);
      }
      this.selectionRequestedByScroll = false;
    }
    /**
     * Scrolls to the content item within the <code>ui5-wizard</code> shadowDOM
     * by given step index.
     *
     * @private
     * @param {Integer} stepIndex the index of a step
     */
    scrollToContentItem(stepIndex) {
      this.contentDOM.scrollTop = this.getClosestScrollPosByStepIndex(stepIndex);
    }
    /**
     * Returns to closest scroll position for the given step index.
     *
     * @private
     * @param {Integer} stepIndex the index of a step
     */
    getClosestScrollPosByStepIndex(stepIndex) {
      if (stepIndex === 0) {
        return 0;
      }
      // It's possible to have [enabled - 0, disabled - 1, enabled - 2, disabled - 3] step definition and similar.
      // Consider selection of the third step at index 2, the wizard should scroll where the previous step ends,
      // but in this case the 2nd step is disabled, so we have to fallback to the first possible step.
      for (let closestStepIndex = stepIndex - 1; closestStepIndex >= 0; closestStepIndex--) {
        if (this.stepScrollOffsets[closestStepIndex] > 0) {
          return this.stepScrollOffsets[closestStepIndex];
        }
      }
      return 0;
    }
    /**
     * Returns the closest step index by given scroll position.
     * @private
     * @param {Integer} scrollPos the scroll position
     */
    getClosestStepIndexByScrollPos(scrollPos) {
      for (let closestStepIndex = 0; closestStepIndex <= this.stepScrollOffsets.length - 1; closestStepIndex++) {
        const stepScrollOffset = this.stepScrollOffsets[closestStepIndex];
        const step = this.getStepWrapperByIdx(closestStepIndex);
        const switchStepBoundary = step.offsetTop + step.offsetHeight * this.effectiveStepSwitchThreshold;
        if (stepScrollOffset > 0 && scrollPos < stepScrollOffset) {
          if (scrollPos > switchStepBoundary) {
            return closestStepIndex + 1;
          }
          return closestStepIndex;
        }
      }
      return this.selectedStepIndex;
    }
    /**
     * Switches the selection from the old step to the newly selected step.
     *
     * @param {WizardStep} selectedStep the old step
     * @param {WizardStep} stepToSelect the step to be selected
     * @param {Integer} stepToSelectIndex the index of the newly selected step
     * @param {boolean} changeWithClick the selection changed due to user click in the step navigation
     * @private
     */
    switchSelectionFromOldToNewStep(selectedStep, stepToSelect, stepToSelectIndex, changeWithClick) {
      if (selectedStep && stepToSelect) {
        // keep the selection if next step is disabled
        if (!stepToSelect.disabled) {
          selectedStep.selected = false;
          stepToSelect.selected = true;
        }
        this.fireEvent("step-change", {
          step: stepToSelect,
          previousStep: selectedStep,
          changeWithClick
        });
        this.selectedStepIndex = stepToSelectIndex;
      }
    }
    /**
     * Sorter method for sorting an array in ascending order.
     * @private
     */
    sortAscending(a, b) {
      if (a < b) {
        return -1;
      }
      if (a > b) {
        return 1;
      }
      return 0;
    }
  };
  __decorate([(0, _property.default)({
    type: _WizardContentLayout.default,
    defaultValue: _WizardContentLayout.default.MultipleSteps
  })], Wizard.prototype, "contentLayout", void 0);
  __decorate([(0, _property.default)({
    validator: _Float.default
  })], Wizard.prototype, "width", void 0);
  __decorate([(0, _property.default)({
    validator: _Float.default,
    defaultValue: STEP_SWITCH_THRESHOLDS.DEFAULT
  })], Wizard.prototype, "stepSwitchThreshold", void 0);
  __decorate([(0, _property.default)({
    validator: _Float.default
  })], Wizard.prototype, "contentHeight", void 0);
  __decorate([(0, _property.default)({
    type: Object,
    multiple: true
  })], Wizard.prototype, "_groupedTabs", void 0);
  __decorate([(0, _property.default)()], Wizard.prototype, "_breakpoint", void 0);
  __decorate([(0, _slot.default)({
    "default": true,
    type: HTMLElement,
    "individualSlots": true,
    invalidateOnChildChange: true
  })], Wizard.prototype, "steps", void 0);
  Wizard = Wizard_1 = __decorate([(0, _customElement.default)({
    tag: "ui5-wizard",
    languageAware: true,
    fastNavigation: true,
    renderer: _LitRenderer.default,
    styles: [_BrowserScrollbar.default, _Wizard.default],
    staticAreaStyles: _WizardPopover.default,
    template: _WizardTemplate.default,
    staticAreaTemplate: _WizardPopoverTemplate.default,
    dependencies: [_WizardTab.default, _WizardStep.default, _ResponsivePopover.default, _Button.default]
  })
  /**
   * Fired when the step is changed by user interaction - either with scrolling,
   * or by clicking on the steps within the component header.
   *
   * @event sap.ui.webc.fiori.Wizard#step-change
   * @param {sap.ui.webc.fiori.IWizardStep} step The new step.
   * @param {sap.ui.webc.fiori.IWizardStep} previousStep The previous step.
   * @param {boolean} changeWithClick The step change occurs due to user's click or 'Enter'/'Space' key press on step within the navigation.
   * @public
   */, (0, _event.default)("step-change", {
    detail: {
      step: {
        type: HTMLElement
      },
      previousStep: {
        type: HTMLElement
      },
      changeWithClick: {
        Boolean
      }
    }
  })], Wizard);
  Wizard.define();
  var _default = Wizard;
  _exports.default = _default;
});