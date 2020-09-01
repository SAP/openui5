sap.ui.define(['exports', './chunk-7ceb84db', './chunk-52e7820d', './chunk-f88e3e0b', './chunk-10d30a0b', './chunk-bc74bbec', './chunk-b003cdb5', './chunk-57e79e7c', './chunk-1be5f319', './chunk-04be579f', './chunk-928b5964', './chunk-b83f2514', './chunk-1b10f44e', './chunk-5daccaed', './chunk-35c39de2', './chunk-02a372c1', './chunk-39e0e4ab'], function (exports, __chunk_1, __chunk_2, __chunk_3, __chunk_5, __chunk_6, __chunk_7, __chunk_8, __chunk_9, __chunk_10, __chunk_12, __chunk_14, __chunk_15, __chunk_17, __chunk_20, __chunk_21, __chunk_22) { 'use strict';

	var name = "edit";
	var pathData = "M475 104q5 7 5 12 0 6-5 11L150 453q-4 4-8 4L32 480l22-110q0-5 4-9L384 36q4-4 11-4t11 4zm-121 99l-46-45L84 381l46 46zm87-88l-46-44-64 64 45 45z";
	var ltr = false;
	__chunk_1.registerIcon(name, {
	  pathData: pathData,
	  ltr: ltr
	});

	/**
	 * @lends sap.ui.webcomponents.main.types.ListItemType.prototype
	 * @public
	 */

	var ListItemTypes = {
	  /**
	   * Indicates the list item does not have any active feedback when item is pressed.
	   * @public
	   * @type {Inactive}
	   */
	  Inactive: "Inactive",

	  /**
	   * Indicates that the item is clickable via active feedback when item is pressed.
	   * @public
	   * @type {Active}
	   */
	  Active: "Active",

	  /**
	   * Enables detail button of the list item that fires detail-click event.
	   * @public
	   * @type {Detail}
	   */
	  Detail: "Detail"
	};
	/**
	 * @class
	 * Different types of ListItem.
	 * @constructor
	 * @author SAP SE
	 * @alias sap.ui.webcomponents.main.types.ListItemType
	 * @public
	 * @enum {string}
	 */

	var ListItemType =
	/*#__PURE__*/
	function (_DataType) {
	  __chunk_1._inherits(ListItemType, _DataType);

	  function ListItemType() {
	    __chunk_1._classCallCheck(this, ListItemType);

	    return __chunk_1._possibleConstructorReturn(this, __chunk_1._getPrototypeOf(ListItemType).apply(this, arguments));
	  }

	  __chunk_1._createClass(ListItemType, null, [{
	    key: "isValid",
	    value: function isValid(value) {
	      return !!ListItemTypes[value];
	    }
	  }]);

	  return ListItemType;
	}(__chunk_1.DataType);

	ListItemType.generataTypeAcessors(ListItemTypes);

	var RadioButtonGroup =
	/*#__PURE__*/
	function () {
	  function RadioButtonGroup() {
	    __chunk_1._classCallCheck(this, RadioButtonGroup);
	  }

	  __chunk_1._createClass(RadioButtonGroup, null, [{
	    key: "hasGroup",
	    value: function hasGroup(groupName) {
	      return this.groups.has(groupName);
	    }
	  }, {
	    key: "getGroup",
	    value: function getGroup(groupName) {
	      return this.groups.get(groupName);
	    }
	  }, {
	    key: "getSelectedRadioFromGroup",
	    value: function getSelectedRadioFromGroup(groupName) {
	      return this.selectedRadios.get(groupName);
	    }
	  }, {
	    key: "removeGroup",
	    value: function removeGroup(groupName) {
	      this.selectedRadios["delete"](groupName);
	      return this.groups["delete"](groupName);
	    }
	  }, {
	    key: "addToGroup",
	    value: function addToGroup(radioBtn, groupName) {
	      if (this.hasGroup(groupName)) {
	        this.enforceSingleSelection(radioBtn, groupName);
	        this.getGroup(groupName).push(radioBtn);
	      } else {
	        this.createGroup(radioBtn, groupName);
	      }
	    }
	  }, {
	    key: "removeFromGroup",
	    value: function removeFromGroup(radioBtn, groupName) {
	      if (!this.hasGroup(groupName)) {
	        return;
	      }

	      var group = this.getGroup(groupName);
	      var selectedRadio = this.getSelectedRadioFromGroup(groupName); // Remove the radio button from the given group

	      group.forEach(function (_radioBtn, idx, arr) {
	        if (radioBtn._id === _radioBtn._id) {
	          return arr.splice(idx, 1);
	        }
	      });

	      if (selectedRadio === radioBtn) {
	        this.selectedRadios.set(groupName, null);
	      } // Remove the group if it is empty


	      if (!group.length) {
	        this.removeGroup(groupName);
	      }
	    }
	  }, {
	    key: "createGroup",
	    value: function createGroup(radioBtn, groupName) {
	      if (radioBtn.selected) {
	        this.selectedRadios.set(groupName, radioBtn);
	      }

	      this.groups.set(groupName, [radioBtn]);
	    }
	  }, {
	    key: "selectNextItem",
	    value: function selectNextItem(item, groupName) {
	      var group = this.getGroup(groupName),
	          groupLength = group.length,
	          currentItemPosition = group.indexOf(item);

	      if (groupLength <= 1) {
	        return;
	      }

	      var nextItemToSelect = this._nextSelectable(currentItemPosition, group);

	      this.updateSelectionInGroup(nextItemToSelect, groupName);
	    }
	  }, {
	    key: "selectPreviousItem",
	    value: function selectPreviousItem(item, groupName) {
	      var group = this.getGroup(groupName),
	          groupLength = group.length,
	          currentItemPosition = group.indexOf(item);

	      if (groupLength <= 1) {
	        return;
	      }

	      var previousItemToSelect = this._previousSelectable(currentItemPosition, group);

	      this.updateSelectionInGroup(previousItemToSelect, groupName);
	    }
	  }, {
	    key: "selectItem",
	    value: function selectItem(item, groupName) {
	      this.updateSelectionInGroup(item, groupName);
	    }
	  }, {
	    key: "updateSelectionInGroup",
	    value: function updateSelectionInGroup(radioBtnToSelect, groupName) {
	      var selectedRadio = this.getSelectedRadioFromGroup(groupName);

	      this._deselectRadio(selectedRadio);

	      this._selectRadio(radioBtnToSelect);

	      this.selectedRadios.set(groupName, radioBtnToSelect);
	    }
	  }, {
	    key: "_deselectRadio",
	    value: function _deselectRadio(radioBtn) {
	      if (radioBtn) {
	        radioBtn.selected = false;
	      }
	    }
	  }, {
	    key: "_selectRadio",
	    value: function _selectRadio(radioBtn) {
	      if (radioBtn) {
	        radioBtn.focus();
	        radioBtn.selected = true;
	        radioBtn._selected = true;
	        radioBtn.fireEvent("select");
	      }
	    }
	  }, {
	    key: "_nextSelectable",
	    value: function _nextSelectable(pos, group) {
	      var groupLength = group.length;
	      var nextRadioToSelect = null;

	      if (pos === groupLength - 1) {
	        if (group[0].disabled || group[0].readonly) {
	          return this._nextSelectable(1, group);
	        }

	        nextRadioToSelect = group[0];
	      } else if (group[pos + 1].disabled || group[pos + 1].readonly) {
	        return this._nextSelectable(pos + 1, group);
	      } else {
	        nextRadioToSelect = group[pos + 1];
	      }

	      return nextRadioToSelect;
	    }
	  }, {
	    key: "_previousSelectable",
	    value: function _previousSelectable(pos, group) {
	      var groupLength = group.length;
	      var previousRadioToSelect = null;

	      if (pos === 0) {
	        if (group[groupLength - 1].disabled || group[groupLength - 1].readonly) {
	          return this._previousSelectable(groupLength - 1, group);
	        }

	        previousRadioToSelect = group[groupLength - 1];
	      } else if (group[pos - 1].disabled || group[pos - 1].readonly) {
	        return this._previousSelectable(pos - 1, group);
	      } else {
	        previousRadioToSelect = group[pos - 1];
	      }

	      return previousRadioToSelect;
	    }
	  }, {
	    key: "enforceSingleSelection",
	    value: function enforceSingleSelection(radioBtn, groupName) {
	      var selectedRadio = this.getSelectedRadioFromGroup(groupName);

	      if (radioBtn.selected) {
	        if (!selectedRadio) {
	          this.selectedRadios.set(groupName, radioBtn);
	        } else if (radioBtn !== selectedRadio) {
	          this._deselectRadio(selectedRadio);

	          this.selectedRadios.set(groupName, radioBtn);
	        }
	      } else if (radioBtn === selectedRadio) {
	        this.selectedRadios.set(groupName, null);
	      }
	    }
	  }, {
	    key: "groups",
	    get: function get() {
	      if (!this._groups) {
	        this._groups = new Map();
	      }

	      return this._groups;
	    }
	  }, {
	    key: "selectedRadios",
	    get: function get() {
	      if (!this._selectedRadios) {
	        this._selectedRadios = new Map();
	      }

	      return this._selectedRadios;
	    }
	  }]);

	  return RadioButtonGroup;
	}();

	function _templateObject4() {
	  var data = __chunk_1._taggedTemplateLiteral(["<circle class=\"ui5-radio-svg-outer\" cx=\"50%\" cy=\"50%\" r=\"50%\" /><circle class=\"ui5-radio-svg-inner\" cx=\"50%\" cy=\"50%\" r=\"22%\" />"]);

	  _templateObject4 = function _templateObject4() {
	    return data;
	  };

	  return data;
	}

	function _templateObject3() {
	  var data = __chunk_1._taggedTemplateLiteral(["<span id=\"", "-descr\" class=\"ui5-hidden-text\">", "</span>"]);

	  _templateObject3 = function _templateObject3() {
	    return data;
	  };

	  return data;
	}

	function _templateObject2() {
	  var data = __chunk_1._taggedTemplateLiteral(["<ui5-label id=\"", "-label\" class=\"ui5-radio-label\" for=\"", "\" ?wrap=\"", "\">", "</ui5-label>"]);

	  _templateObject2 = function _templateObject2() {
	    return data;
	  };

	  return data;
	}

	function _templateObject() {
	  var data = __chunk_1._taggedTemplateLiteral(["<div class=\"ui5-radio-root ", "\" role=\"radio\" aria-checked=\"", "\" aria-readonly=\"", "\" aria-disabled=\"", "\" aria-labelledby=\"", "\" aria-describedby=\"", "\" tabindex=\"", "\" dir=\"", "\" @click=\"", "\" @keydown=\"", "\" @keyup=\"", "\"><div class='ui5-radio-inner ", "'><svg class=\"ui5-radio-svg\" focusable=\"false\" aria-hidden=\"true\">", "</svg><input type='radio' ?checked=\"", "\" ?readonly=\"", "\" ?disabled=\"", "\" name=\"", "\" data-sap-no-tab-ref/></div>", "", "</div>"]);

	  _templateObject = function _templateObject() {
	    return data;
	  };

	  return data;
	}

	var block0 = function block0(context) {
	  return __chunk_2.scopedHtml(_templateObject(), __chunk_2.classMap(context.classes.main), __chunk_2.ifDefined(context.selected), __chunk_2.ifDefined(context.ariaReadonly), __chunk_2.ifDefined(context.ariaDisabled), __chunk_2.ifDefined(context.ariaLabelledBy), __chunk_2.ifDefined(context.ariaDescribedBy), __chunk_2.ifDefined(context.tabIndex), __chunk_2.ifDefined(context.effectiveDir), context._onclick, context._onkeydown, context._onkeyup, __chunk_2.classMap(context.classes.inner), blockSVG1(context), context.selected, context.readonly, context.disabled, __chunk_2.ifDefined(context.name), context.text ? block1(context) : undefined, context.hasValueState ? block2(context) : undefined);
	};

	var block1 = function block1(context) {
	  return __chunk_2.scopedHtml(_templateObject2(), __chunk_2.ifDefined(context._id), __chunk_2.ifDefined(context._id), context.wrap, __chunk_2.ifDefined(context.text));
	};

	var block2 = function block2(context) {
	  return __chunk_2.scopedHtml(_templateObject3(), __chunk_2.ifDefined(context._id), __chunk_2.ifDefined(context.valueStateText));
	};

	var blockSVG1 = function blockSVG1(context) {
	  return __chunk_2.scopedSvg(_templateObject4());
	};

	var main = function main(context, tags, suffix) {
	  __chunk_2.setTags(tags);
	  __chunk_2.setSuffix(suffix);
	  return block0(context);
	};

	__chunk_1.registerThemeProperties("@ui5/webcomponents-theme-base", "sap_fiori_3", __chunk_6.defaultThemeBase);
	__chunk_1.registerThemeProperties("@ui5/webcomponents", "sap_fiori_3", __chunk_7.defaultTheme);
	var radioButtonCss = ".ui5-hidden-text{position:absolute;clip:rect(1px,1px,1px,1px);user-select:none;left:0;top:0}:host(:not([hidden])){display:inline-block}:host{min-width:var(--_ui5_radiobutton_min_width);max-width:100%;text-overflow:ellipsis;overflow:hidden;color:var(--sapField_BorderColor)}:host([selected]){color:var(--_ui5_radiobutton_selected_fill)}:host([selected]) .ui5-radio-svg-inner{fill:currentColor}:host([selected]) .ui5-radio-svg-outer{stroke:var(--sapField_BorderColor)}:host([disabled]) .ui5-radio-root{opacity:var(--sapContent_DisabledOpacity)}:host(:not([disabled])) .ui5-radio-root:focus:before{content:\"\";display:block;position:absolute;top:var(--_ui5_rb_focus_dist);bottom:var(--_ui5_rb_focus_dist);left:var(--_ui5_rb_focus_dist);right:var(--_ui5_rb_focus_dist);pointer-events:none;border:var(--_ui5_radiobutton_border_width) dotted var(--sapContent_FocusColor)}:host(:not([value-state=Error]):not([value-state=Warning])) .ui5-radio-root:hover .ui5-radio-inner--hoverable .ui5-radio-svg-outer{fill:var(--_ui5_radiobutton_hover_fill);stroke:var(--sapField_Hover_BorderColor)}:host([text]) .ui5-radio-root:focus:before{right:0}:host([selected][readonly]) .ui5-radio-svg-inner{fill:var(--sapContent_NonInteractiveIconColor)}:host([readonly]) .ui5-radio-root .ui5-radio-svg-outer{fill:var(--sapField_ReadOnly_Background);stroke:var(--sapField_ReadOnly_BorderColor)}:host([value-state=Error]) .ui5-radio-svg-outer,:host([value-state=Warning]) .ui5-radio-svg-outer{stroke-width:2}:host([value-state=Error][selected]) .ui5-radio-svg-inner{fill:var(--_ui5_radiobutton_selected_error_fill)}:host([value-state=Error]) .ui5-radio-root:hover .ui5-radio-inner.ui5-radio-inner--hoverable:hover .ui5-radio-svg-outer,:host([value-state=Error]) .ui5-radio-svg-outer{stroke:var(--sapField_InvalidColor);fill:var(--sapField_InvalidBackground)}:host([value-state=Warning][selected]) .ui5-radio-svg-inner{fill:var(--_ui5_radiobutton_selected_warning_fill)}:host([value-state=Warning]) .ui5-radio-root:hover .ui5-radio-inner.ui5-radio-inner--hoverable:hover .ui5-radio-svg-outer,:host([value-state=Warning]) .ui5-radio-svg-outer{stroke:var(--sapField_WarningColor);fill:var(--sapField_WarningBackground)}:host([value-state=Error]) .ui5-radio-root,:host([value-state=Information]) .ui5-radio-root,:host([value-state=Warning]) .ui5-radio-root{stroke-dasharray:var(--_ui5_radiobutton_warning_error_border_dash)}.ui5-radio-root{height:var(--_ui5_rb_height);position:relative;display:flex;flex-wrap:nowrap;outline:none;max-width:100%}.ui5-radio-inner{display:flex;align-items:center;justify-content:center;flex-shrink:0;width:var(--_ui5_rb_inner_size);height:var(--_ui5_rb_inner_size);font-size:1rem;pointer-events:none;vertical-align:top}.ui5-radio-inner:focus{outline:none}.ui5-radio-inner input{-webkit-appearance:none;visibility:hidden;width:0;left:0;position:absolute;font-size:inherit;margin:0}[ui5-label].ui5-radio-label{display:flex;align-items:center;width:var(--_ui5_rb_label_width);padding-right:1px;vertical-align:top;cursor:default;max-width:100%;text-overflow:ellipsis;overflow:hidden;pointer-events:none}:host([wrap][text]) .ui5-radio-root{height:auto}:host([wrap][text]) [ui5-label].ui5-radio-label{padding:var(--_ui5_rb_label_side_padding) 0;word-break:break-all}.ui5-radio-svg{height:var(--_ui5_rb_svg_size);width:var(--_ui5_rb_svg_size);overflow:visible;pointer-events:none}.ui5-radio-svg-outer{fill:var(--sapField_Background);stroke:currentColor;stroke-width:1}.ui5-radio-svg-inner{fill:none}.ui5-radio-svg-inner,.ui5-radio-svg-outer{flex-shrink:0}:host([text]) [dir=rtl].ui5-radio-root:focus:before{left:0;right:var(--_ui5_rb_rtl_focus_right)}:host(.ui5-li-singlesel-radiobtn) .ui5-radio-root .ui5-radio-inner .ui5-radio-svg-outer{fill:var(--sapList_Background)}";

	/**
	 * @public
	 */

	var metadata = {
	  tag: "ui5-radiobutton",
	  languageAware: true,
	  properties:
	  /** @lends sap.ui.webcomponents.main.RadioButton.prototype */
	  {
	    /**
	     * Determines whether the <code>ui5-radiobutton</code> is disabled.
	     * <br><br>
	     * <b>Note:</b> A disabled <code>ui5-radiobutton</code> is completely noninteractive.
	     *
	     * @type {boolean}
	     * @defaultvalue false
	     * @public
	     */
	    disabled: {
	      type: Boolean
	    },

	    /**
	     * Determines whether the <code>ui5-radiobutton</code> is read-only.
	     * <br><br>
	     * <b>Note:</b> A read-only <code>ui5-radiobutton</code> is not editable,
	     * but still provides visual feedback upon user interaction.
	     *
	     * @type {boolean}
	     * @defaultvalue false
	     * @public
	     */
	    readonly: {
	      type: Boolean
	    },

	    /**
	     * Determines whether the <code>ui5-radiobutton</code> is selected or not.
	     * <br><br>
	     * <b>Note:</b> The property value can be changed with user interaction,
	     * either by cliking/tapping on the <code>ui5-radiobutton</code>,
	     * or by using the Space or Enter key.
	     *
	     * @type {boolean}
	     * @defaultvalue false
	     * @public
	     */
	    selected: {
	      type: Boolean
	    },

	    /**
	     * Defines the text of the <code>ui5-radiobutton</code>.
	     *
	     * @type  {string}
	     * @defaultvalue ""
	     * @public
	     */
	    text: {
	      type: String
	    },

	    /**
	     * Defines the value state of the <code>ui5-radiobutton</code>.
	     * <br><br>
	     * Available options are:
	     * <ul>
	     * <li><code>None</code></li>
	     * <li><code>Error</code></li>
	     * <li><code>Warning</code></li>
	     * </ul>
	     *
	     * @type {ValueState}
	     * @defaultvalue "None"
	     * @public
	     */
	    valueState: {
	      defaultValue: __chunk_21.ValueState.None,
	      type: __chunk_21.ValueState
	    },

	    /**
	     * Defines the name of the <code>ui5-radiobutton</code>.
	     * Radio buttons with the same <code>name</code> will form a radio button group.
	     *
	     * <br><br>
	     * <b>Note:</b>
	     * The selection can be changed with <code>ARROW_UP/DOWN</code> and <code>ARROW_LEFT/RIGHT</code> keys between radio buttons in same group.
	     *
	     * <br><br>
	     * <b>Note:</b>
	     * Only one radio button can be selected per group.
	     *
	     * <br><br>
	     * <b>Important:</b> For the <code>name</code> property to have effect when submitting forms, you must add the following import to your project:
	     * <code>import "@ui5/webcomponents/dist/features/InputElementsFormSupport.js";</code>
	     *
	     * <br><br>
	     * <b>Note:</b> When set, a native <code>input</code> HTML element
	     * will be created inside the <code>ui5-radiobutton</code> so that it can be submitted as
	     * part of an HTML form.
	     *
	     * @type {string}
	     * @defaultvalue ""
	     * @public
	     */
	    name: {
	      type: String
	    },

	    /**
	     * Defines the form value of the <code>ui5-radiobutton</code>.
	     * When a form with a radio button group is submitted, the group's value
	     * will be the value of the currently selected radio button.
	     * <br>
	     * <b>Important:</b> For the <code>value</code> property to have effect, you must add the following import to your project:
	     * <code>import "@ui5/webcomponents/dist/features/InputElementsFormSupport.js";</code>
	     *
	     * @type {string}
	     * @defaultvalue ""
	     * @public
	     */
	    value: {
	      type: String
	    },

	    /**
	     * Defines whether the <code>ui5-radiobutton</code> text wraps when there is not enough space.
	     * <br><br>
	     * <b>Note:</b> By default, the text truncates when there is not enough space.
	     *
	     * @type {boolean}
	     * @defaultvalue false
	     * @public
	     */
	    wrap: {
	      type: Boolean
	    }
	  },
	  events:
	  /** @lends sap.ui.webcomponents.main.RadioButton.prototype */
	  {
	    /**
	     * Fired when the <code>ui5-radiobutton</code> selected state changes.
	     *
	     * @event
	     * @public
	     */
	    select: {}
	  }
	};
	/**
	 * @class
	 *
	 * <h3 class="comment-api-title">Overview</h3>
	 *
	 * The <code>ui5-radibutton</code> component enables users to select a single option from a set of options.
	 * When a <code>ui5-radiobutton</code> is selected by the user, the
	 * <code>select</code> event is fired.
	 * When a <code>ui5-radiobutton</code> that is within a group is selected, the one
	 * that was previously selected gets automatically deselected. You can group radio buttons by using the <code>name</code> property.
	 * <br>
	 * <b>Note:</b> If <code>ui5-radiobutton</code> is not part of a group, it can be selected once, but can not be deselected back.
	 *
	 * <h3>Keyboard Handling</h3>
	 *
	 * Once the <code>ui5-radiobutton</code> is on focus, it might be selected by pressing the Space and Enter keys.
	 * <br>
	 * The Arrow Down/Arrow Up and Arrow Left/Arrow Right keys can be used to change selection between next/previous radio buttons in one group,
	 * while TAB and SHIFT + TAB can be used to enter or leave the radio button group.
	 * <br>
	 * <b>Note:</b> On entering radio button group, the focus goes to the currently selected radio button.
	 *
	 * <h3>ES6 Module Import</h3>
	 *
	 * <code>import "@ui5/webcomponents/dist/RadioButton";</code>
	 *
	 * @constructor
	 * @author SAP SE
	 * @alias sap.ui.webcomponents.main.RadioButton
	 * @extends sap.ui.webcomponents.base.UI5Element
	 * @tagname ui5-radiobutton
	 * @public
	 */

	var RadioButton =
	/*#__PURE__*/
	function (_UI5Element) {
	  __chunk_1._inherits(RadioButton, _UI5Element);

	  function RadioButton() {
	    var _this;

	    __chunk_1._classCallCheck(this, RadioButton);

	    _this = __chunk_1._possibleConstructorReturn(this, __chunk_1._getPrototypeOf(RadioButton).call(this));
	    _this.i18nBundle = __chunk_3.getI18nBundle("@ui5/webcomponents");
	    return _this;
	  }

	  __chunk_1._createClass(RadioButton, [{
	    key: "onBeforeRendering",
	    value: function onBeforeRendering() {
	      this.syncGroup();

	      this._enableFormSupport();
	    }
	  }, {
	    key: "syncGroup",
	    value: function syncGroup() {
	      var oldGroup = this._name;
	      var currentGroup = this.name;

	      if (currentGroup !== oldGroup) {
	        if (oldGroup) {
	          // remove the control from the previous group
	          RadioButtonGroup.removeFromGroup(this, oldGroup);
	        }

	        if (currentGroup) {
	          // add the control to the existing group
	          RadioButtonGroup.addToGroup(this, currentGroup);
	        }
	      } else if (currentGroup) {
	        RadioButtonGroup.enforceSingleSelection(this, currentGroup);
	      }

	      this._name = this.name;
	    }
	  }, {
	    key: "_enableFormSupport",
	    value: function _enableFormSupport() {
	      var FormSupport = __chunk_1.getFeature("FormSupport");

	      if (FormSupport) {
	        FormSupport.syncNativeHiddenInput(this, function (element, nativeInput) {
	          nativeInput.disabled = element.disabled || !element.selected;
	          nativeInput.value = element.selected ? element.value : "";
	        });
	      } else if (this.value) {
	        console.warn("In order for the \"value\" property to have effect, you should also: import \"@ui5/webcomponents/dist/features/InputElementsFormSupport.js\";"); // eslint-disable-line
	      }
	    }
	  }, {
	    key: "_onclick",
	    value: function _onclick() {
	      return this.toggle();
	    }
	  }, {
	    key: "_handleDown",
	    value: function _handleDown(event) {
	      var currentGroup = this.name;

	      if (!currentGroup) {
	        return;
	      }

	      event.preventDefault();
	      RadioButtonGroup.selectNextItem(this, currentGroup);
	    }
	  }, {
	    key: "_handleUp",
	    value: function _handleUp(event) {
	      var currentGroup = this.name;

	      if (!currentGroup) {
	        return;
	      }

	      event.preventDefault();
	      RadioButtonGroup.selectPreviousItem(this, currentGroup);
	    }
	  }, {
	    key: "_onkeydown",
	    value: function _onkeydown(event) {
	      if (__chunk_8.isSpace(event)) {
	        return event.preventDefault();
	      }

	      if (__chunk_8.isEnter(event)) {
	        return this.toggle();
	      }

	      if (__chunk_8.isDown(event) || __chunk_8.isRight(event)) {
	        this._handleDown(event);
	      }

	      if (__chunk_8.isUp(event) || __chunk_8.isLeft(event)) {
	        this._handleUp(event);
	      }
	    }
	  }, {
	    key: "_onkeyup",
	    value: function _onkeyup(event) {
	      if (__chunk_8.isSpace(event)) {
	        this.toggle();
	      }
	    }
	  }, {
	    key: "toggle",
	    value: function toggle() {
	      if (!this.canToggle()) {
	        return this;
	      }

	      if (!this.name) {
	        this.selected = !this.selected;
	        this.fireEvent("select");
	        return this;
	      }

	      RadioButtonGroup.selectItem(this, this.name);
	      return this;
	    }
	  }, {
	    key: "canToggle",
	    value: function canToggle() {
	      return !(this.disabled || this.readonly || this.selected);
	    }
	  }, {
	    key: "valueStateTextMappings",
	    value: function valueStateTextMappings() {
	      var i18nBundle = this.i18nBundle;
	      return {
	        "Error": i18nBundle.getText(__chunk_5.VALUE_STATE_ERROR),
	        "Warning": i18nBundle.getText(__chunk_5.VALUE_STATE_WARNING)
	      };
	    }
	  }, {
	    key: "classes",
	    get: function get() {
	      return {
	        inner: {
	          "ui5-radio-inner--hoverable": !this.disabled && !this.readonly && __chunk_10.isDesktop()
	        }
	      };
	    }
	  }, {
	    key: "ariaReadonly",
	    get: function get() {
	      return this.readonly ? "true" : undefined;
	    }
	  }, {
	    key: "ariaDisabled",
	    get: function get() {
	      return this.disabled ? "true" : undefined;
	    }
	  }, {
	    key: "ariaLabelledBy",
	    get: function get() {
	      return this.text ? "".concat(this._id, "-label") : undefined;
	    }
	  }, {
	    key: "ariaDescribedBy",
	    get: function get() {
	      return this.hasValueState ? "".concat(this._id, "-descr") : undefined;
	    }
	  }, {
	    key: "hasValueState",
	    get: function get() {
	      return this.valueState !== __chunk_21.ValueState.None;
	    }
	  }, {
	    key: "valueStateText",
	    get: function get() {
	      return this.valueStateTextMappings()[this.valueState];
	    }
	  }, {
	    key: "tabIndex",
	    get: function get() {
	      var tabindex = this.getAttribute("tabindex");

	      if (this.disabled) {
	        return "-1";
	      }

	      if (this.name) {
	        return this.selected ? "0" : "-1";
	      }

	      return tabindex || "0";
	    }
	  }, {
	    key: "strokeWidth",
	    get: function get() {
	      return this.valueState === "None" ? "1" : "2";
	    }
	  }], [{
	    key: "onDefine",
	    value: function () {
	      var _onDefine = __chunk_1._asyncToGenerator(
	      /*#__PURE__*/
	      regeneratorRuntime.mark(function _callee() {
	        return regeneratorRuntime.wrap(function _callee$(_context) {
	          while (1) {
	            switch (_context.prev = _context.next) {
	              case 0:
	                _context.next = 2;
	                return __chunk_1.fetchI18nBundle("@ui5/webcomponents");

	              case 2:
	              case "end":
	                return _context.stop();
	            }
	          }
	        }, _callee);
	      }));

	      function onDefine() {
	        return _onDefine.apply(this, arguments);
	      }

	      return onDefine;
	    }()
	  }, {
	    key: "metadata",
	    get: function get() {
	      return metadata;
	    }
	  }, {
	    key: "render",
	    get: function get() {
	      return __chunk_2.litRender;
	    }
	  }, {
	    key: "template",
	    get: function get() {
	      return main;
	    }
	  }, {
	    key: "styles",
	    get: function get() {
	      return radioButtonCss;
	    }
	  }, {
	    key: "dependencies",
	    get: function get() {
	      return [__chunk_12.Label];
	    }
	  }]);

	  return RadioButton;
	}(__chunk_1.UI5Element);

	RadioButton.define();

	function _templateObject4$1() {
	  var data = __chunk_1._taggedTemplateLiteral(["<span id=\"", "-descr\" class=\"ui5-hidden-text\">", "</span>"]);

	  _templateObject4$1 = function _templateObject4() {
	    return data;
	  };

	  return data;
	}

	function _templateObject3$1() {
	  var data = __chunk_1._taggedTemplateLiteral(["<ui5-label id=\"", "-label\" class=\"ui5-checkbox-label\" ?wrap=\"", "\">", "</ui5-label>"]);

	  _templateObject3$1 = function _templateObject3() {
	    return data;
	  };

	  return data;
	}

	function _templateObject2$1() {
	  var data = __chunk_1._taggedTemplateLiteral(["<ui5-icon name=\"accept\" class=\"ui5-checkbox-icon\"></ui5-icon>"]);

	  _templateObject2$1 = function _templateObject2() {
	    return data;
	  };

	  return data;
	}

	function _templateObject$1() {
	  var data = __chunk_1._taggedTemplateLiteral(["<div class=\"ui5-checkbox-root ", "\" role=\"checkbox\" aria-checked=\"", "\" aria-readonly=\"", "\" aria-disabled=\"", "\" aria-label=\"", "\" aria-labelledby=\"", "\" aria-describedby=\"", "\" tabindex=\"", "\" @keydown=\"", "\" @keyup=\"", "\" @click=\"", "\" dir=\"", "\"><div id=\"", "-CbBg\" class=\"ui5-checkbox-inner\">", "<input id=\"", "-CB\" type='checkbox' ?checked=\"", "\" ?readonly=\"", "\" ?disabled=\"", "\" data-sap-no-tab-ref/></div>", "", "<slot name=\"formSupport\"></slot></div>"]);

	  _templateObject$1 = function _templateObject() {
	    return data;
	  };

	  return data;
	}

	var block0$1 = function block0(context) {
	  return __chunk_2.scopedHtml(_templateObject$1(), __chunk_2.classMap(context.classes.main), __chunk_2.ifDefined(context.checked), __chunk_2.ifDefined(context.ariaReadonly), __chunk_2.ifDefined(context.ariaDisabled), __chunk_2.ifDefined(context.ariaLabel), __chunk_2.ifDefined(context.ariaLabelledBy), __chunk_2.ifDefined(context.ariaDescribedBy), __chunk_2.ifDefined(context.tabIndex), context._onkeydown, context._onkeyup, context._onclick, __chunk_2.ifDefined(context.effectiveDir), __chunk_2.ifDefined(context._id), context.checked ? block1$1(context) : undefined, __chunk_2.ifDefined(context._id), context.checked, context.readonly, context.disabled, context._label.text ? block2$1(context) : undefined, context.hasValueState ? block3(context) : undefined);
	};

	var block1$1 = function block1(context) {
	  return __chunk_2.scopedHtml(_templateObject2$1());
	};

	var block2$1 = function block2(context) {
	  return __chunk_2.scopedHtml(_templateObject3$1(), __chunk_2.ifDefined(context._id), context._label.wrap, __chunk_2.ifDefined(context._label.text));
	};

	var block3 = function block3(context) {
	  return __chunk_2.scopedHtml(_templateObject4$1(), __chunk_2.ifDefined(context._id), __chunk_2.ifDefined(context.valueStateText));
	};

	var main$1 = function main(context, tags, suffix) {
	  __chunk_2.setTags(tags);
	  __chunk_2.setSuffix(suffix);
	  return block0$1(context);
	};

	__chunk_1.registerThemeProperties("@ui5/webcomponents-theme-base", "sap_fiori_3", __chunk_6.defaultThemeBase);
	__chunk_1.registerThemeProperties("@ui5/webcomponents", "sap_fiori_3", __chunk_7.defaultTheme);
	var checkboxCss = ".ui5-hidden-text{position:absolute;clip:rect(1px,1px,1px,1px);user-select:none;left:0;top:0}:host(:not([hidden])){display:inline-block}:host{overflow:hidden;max-width:100%;outline:none}:host([disabled]) .ui5-checkbox-root{opacity:.5}:host([readonly]:not([value-state=Warning]):not([value-state=Error])) .ui5-checkbox-inner{background:var(--sapField_ReadOnly_Background);border:var(--_ui5_checkbox_inner_readonly_border);color:var(--sapContent_NonInteractiveIconColor)}:host([wrap][text]) .ui5-checkbox-root{min-height:auto;box-sizing:border-box;align-items:flex-start;padding-top:var(--_ui5_checkbox_root_side_padding);padding-bottom:var(--_ui5_checkbox_root_side_padding)}:host([wrap][text]) .ui5-checkbox-root .ui5-checkbox-inner,:host([wrap][text]) .ui5-checkbox-root .ui5-checkbox-label{margin-top:var(--_ui5_checkbox_wrapped_content_margin_top)}:host([wrap][text]) .ui5-checkbox-root .ui5-checkbox-label{word-break:break-all}:host([wrap]) .ui5-checkbox-root:focus:before{bottom:var(--_ui5_checkbox_wrapped_focus_left_top_bottom_position)}:host([value-state=Error]) .ui5-checkbox--hoverable:hover .ui5-checkbox-inner,:host([value-state=Error]) .ui5-checkbox-inner{background:var(--sapField_InvalidBackground);border:var(--_ui5_checkbox_inner_error_border);color:var(--sapField_InvalidColor)}:host([value-state=Warning]) .ui5-checkbox--hoverable:hover .ui5-checkbox-inner,:host([value-state=Warning]) .ui5-checkbox-inner{background:var(--sapField_WarningBackground);border:var(--_ui5_checkbox_inner_warning_border);color:var(--sapField_WarningColor)}:host([value-state=Information]) .ui5-checkbox--hoverable:hover .ui5-checkbox-inner,:host([value-state=Information]) .ui5-checkbox-inner{background:var(--sapField_InformationBackground);border:var(--_ui5_checkbox_inner_information_border);color:var(--sapField_InformationColor)}:host([value-state=Warning]) .ui5-checkbox-icon{color:var(--_ui5_checkbox_checkmark_warning_color)}:host([text]) .ui5-checkbox-root{padding-right:0}:host([text]) .ui5-checkbox-root:focus:before{right:0}.ui5-checkbox-root{position:relative;display:inline-flex;align-items:center;justify-content:center;width:100%;min-height:var(--_ui5_checkbox_width_height);min-width:var(--_ui5_checkbox_width_height);padding:0 var(--_ui5_checkbox_wrapper_padding);box-sizing:border-box;outline:none;-webkit-tap-highlight-color:rgba(0,0,0,0)}.ui5-checkbox-root:after{content:\"\";min-height:inherit;font-size:0}.ui5-checkbox-root:focus:before{content:\"\";position:absolute;top:var(--_ui5_checkbox_focus_position);left:var(--_ui5_checkbox_focus_position);right:var(--_ui5_checkbox_focus_position);bottom:var(--_ui5_checkbox_focus_position);border:var(--_ui5_checkbox_focus_outline)}.ui5-checkbox--hoverable:hover .ui5-checkbox-inner{background:var(--_ui5_checkbox_hover_background);border-color:var(--sapField_Hover_BorderColor)}.ui5-checkbox-inner{display:flex;justify-content:center;align-items:center;min-width:var(--_ui5_checkbox_inner_width_height);max-width:var(--_ui5_checkbox_inner_width_height);height:var(--_ui5_checkbox_inner_width_height);max-height:var(--_ui5_checkbox_inner_width_height);border:var(--_ui5_checkbox_inner_border);border-radius:var(--_ui5_checkbox_inner_border_radius);background:var(--sapField_Background);color:var(--_ui5_checkbox_checkmark_color);box-sizing:border-box;position:relative;cursor:default;pointer-events:none}.ui5-checkbox-icon{color:currentColor;cursor:default}.ui5-checkbox-inner input{-webkit-appearance:none;visibility:hidden;width:0;left:0;position:absolute;font-size:inherit}.ui5-checkbox-root .ui5-checkbox-label{margin-left:var(--_ui5_checkbox_wrapper_padding);cursor:default;text-overflow:ellipsis;overflow:hidden;pointer-events:none;user-select:none;-ms-user-select:none;-webkit-user-select:none}.ui5-checkbox-icon{width:var(--_ui5_checkbox_icon_size);height:var(--_ui5_checkbox_icon_size)}:host([text]) [dir=rtl].ui5-checkbox-root{padding-left:0;padding-right:var(--_ui5_checkbox_wrapper_padding)}:host([text]) [dir=rtl].ui5-checkbox-root:focus:before{left:0;right:var(--_ui5_checkbox_focus_position)}:host([text]) [dir=rtl].ui5-checkbox-root .ui5-checkbox-label{margin-left:0;margin-right:var(--_ui5_checkbox_compact_wrapper_padding)}";

	/**
	 * @public
	 */

	var metadata$1 = {
	  tag: "ui5-checkbox",
	  languageAware: true,
	  properties:
	  /** @lends sap.ui.webcomponents.main.CheckBox.prototype */
	  {
	    /**
	     * Defines whether the <code>ui5-checkbox</code> is disabled.
	     * <br><br>
	     * <b>Note:</b> A disabled <code>ui5-checkbox</code> is completely noninteractive.
	     *
	     * @type {boolean}
	     * @defaultvalue false
	     * @public
	     */
	    disabled: {
	      type: Boolean
	    },

	    /**
	     * Defines whether the <code>ui5-checkbox</code> is read-only.
	     * <br><br>
	     * <b>Note:</b> A red-only <code>ui5-checkbox</code> is not editable,
	     * but still provides visual feedback upon user interaction.
	     *
	     * @type {boolean}
	     * @defaultvalue false
	     * @public
	     */
	    readonly: {
	      type: Boolean
	    },

	    /**
	     * Defines if the <code>ui5-checkbox</code> is checked.
	     * <br><br>
	     * <b>Note:</b> The property can be changed with user interaction,
	     * either by cliking/tapping on the <code>ui5-checkbox</code>, or by
	     * pressing the Enter or Space key.
	     *
	     * @type {boolean}
	     * @defaultvalue false
	     * @public
	     */
	    checked: {
	      type: Boolean
	    },

	    /**
	     * Defines the text of the <code>ui5-checkbox</code>.
	     *
	     * @type {string}
	     * @defaultvalue ""
	     * @public
	     */
	    text: {
	      type: String
	    },

	    /**
	     * Defines the value state of the <code>ui5-checkbox</code>.
	     * <br><br>
	     * <b>Note:</b> Available options are <code>Warning</code>, <code>Error</code>, and <code>None</code> (default).
	     *
	     * @type {ValueState}
	     * @defaultvalue "None"
	     * @public
	     */
	    valueState: {
	      type: __chunk_21.ValueState,
	      defaultValue: __chunk_21.ValueState.None
	    },

	    /**
	     * Defines whether the <code>ui5-checkbox</code> text wraps when there is not enough space.
	     * <br><br>
	     * <b>Note:</b> By default, the text truncates when there is not enough space.
	     *
	     * @type {boolean}
	     * @defaultvalue false
	     * @public
	     */
	    wrap: {
	      type: Boolean
	    },

	    /**
	     * Determines the name with which the <code>ui5-checkbox</code> will be submitted in an HTML form.
	     *
	     * <br><br>
	     * <b>Important:</b> For the <code>name</code> property to have effect, you must add the following import to your project:
	     * <code>import "@ui5/webcomponents/dist/features/InputElementsFormSupport.js";</code>
	     *
	     * <br><br>
	     * <b>Note:</b> When set, a native <code>input</code> HTML element
	     * will be created inside the <code>ui5-checkbox</code> so that it can be submitted as
	     * part of an HTML form. Do not use this property unless you need to submit a form.
	     *
	     * @type {string}
	     * @defaultvalue ""
	     * @public
	     */
	    name: {
	      type: String
	    },

	    /**
	     * Determines the <code>aria-label</code>, set on the component root tag.
	     * @type {string}
	     * @defaultvalue undefined
	     * @private
	     * @since 1.0.0-rc.8
	     */
	    ariaLabel: {
	      type: String,
	      defaultValue: undefined
	    },
	    _label: {
	      type: Object
	    }
	  },
	  events:
	  /** @lends sap.ui.webcomponents.main.CheckBox.prototype */
	  {
	    /**
	     * Fired when the <code>ui5-checkbox</code> checked state changes.
	     *
	     * @public
	     * @event
	     */
	    change: {}
	  }
	};
	/**
	 * @class
	 *
	 * <h3 class="comment-api-title">Overview</h3>
	 *
	 * Allows the user to set a binary value, such as true/false or yes/no for an item.
	 * <br><br>
	 * The <code>ui5-checkbox</code> component consists of a box and a label that describes its purpose.
	 * If it's checked, an indicator is displayed inside the box.
	 * To check/uncheck the <code>ui5-checkbox</code>, the user has to click or tap the square
	 * box or its label.
	 * <br><br>
	 * The <code>ui5-checkbox</code> component only has 2 states - checked and unchecked.
	 * Clicking or tapping toggles the <code>ui5-checkbox</code> between checked and unchecked state.
	 *
	 * <h3>Usage</h3>
	 *
	 * You can manually set the width of the element containing the box and the label using the <code>width</code> property.
	 * If the text exceeds the available width, it is truncated.
	 * The touchable area for toggling the <code>ui5-checkbox</code> ends where the text ends.
	 * <br><br>
	 * You can disable the <code>ui5-checkbox</code> by setting the <code>disabled</code> property to
	 * <code>true</code>,
	 * or use the <code>ui5-checkbox</code> in read-only mode by setting the <code>readonly</code>
	 * property to <code>true</code>.
	 *
	 * <h3>ES6 Module Import</h3>
	 *
	 * <code>import "@ui5/webcomponents/dist/CheckBox";</code>
	 *
	 * @constructor
	 * @author SAP SE
	 * @alias sap.ui.webcomponents.main.CheckBox
	 * @extends sap.ui.webcomponents.base.UI5Element
	 * @tagname ui5-checkbox
	 * @public
	 */

	var CheckBox =
	/*#__PURE__*/
	function (_UI5Element) {
	  __chunk_1._inherits(CheckBox, _UI5Element);

	  __chunk_1._createClass(CheckBox, null, [{
	    key: "metadata",
	    get: function get() {
	      return metadata$1;
	    }
	  }, {
	    key: "render",
	    get: function get() {
	      return __chunk_2.litRender;
	    }
	  }, {
	    key: "template",
	    get: function get() {
	      return main$1;
	    }
	  }, {
	    key: "styles",
	    get: function get() {
	      return checkboxCss;
	    }
	  }]);

	  function CheckBox() {
	    var _this;

	    __chunk_1._classCallCheck(this, CheckBox);

	    _this = __chunk_1._possibleConstructorReturn(this, __chunk_1._getPrototypeOf(CheckBox).call(this));
	    _this._label = {};
	    _this.i18nBundle = __chunk_3.getI18nBundle("@ui5/webcomponents");
	    return _this;
	  }

	  __chunk_1._createClass(CheckBox, [{
	    key: "onBeforeRendering",
	    value: function onBeforeRendering() {
	      this.syncLabel();

	      this._enableFormSupport();
	    }
	  }, {
	    key: "syncLabel",
	    value: function syncLabel() {
	      this._label = Object.assign({}, this._label);
	      this._label.text = this.text;
	      this._label.wrap = this.wrap;
	      this._label.textDirection = this.textDirection;
	    }
	  }, {
	    key: "_enableFormSupport",
	    value: function _enableFormSupport() {
	      var FormSupport = __chunk_1.getFeature("FormSupport");

	      if (FormSupport) {
	        FormSupport.syncNativeHiddenInput(this, function (element, nativeInput) {
	          nativeInput.disabled = element.disabled || !element.checked;
	          nativeInput.value = element.checked ? "on" : "";
	        });
	      } else if (this.name) {
	        console.warn("In order for the \"name\" property to have effect, you should also: import \"@ui5/webcomponents/dist/features/InputElementsFormSupport.js\";"); // eslint-disable-line
	      }
	    }
	  }, {
	    key: "_onclick",
	    value: function _onclick() {
	      this.toggle();
	    }
	  }, {
	    key: "_onkeydown",
	    value: function _onkeydown(event) {
	      if (__chunk_8.isSpace(event)) {
	        event.preventDefault();
	      }

	      if (__chunk_8.isEnter(event)) {
	        this.toggle();
	      }
	    }
	  }, {
	    key: "_onkeyup",
	    value: function _onkeyup(event) {
	      if (__chunk_8.isSpace(event)) {
	        this.toggle();
	      }
	    }
	  }, {
	    key: "toggle",
	    value: function toggle() {
	      if (this.canToggle()) {
	        this.checked = !this.checked;
	        this.fireEvent("change"); // Angular two way data binding

	        this.fireEvent("value-changed");
	      }

	      return this;
	    }
	  }, {
	    key: "canToggle",
	    value: function canToggle() {
	      return !(this.disabled || this.readonly);
	    }
	  }, {
	    key: "valueStateTextMappings",
	    value: function valueStateTextMappings() {
	      var i18nBundle = this.i18nBundle;
	      return {
	        "Error": i18nBundle.getText(__chunk_5.VALUE_STATE_ERROR),
	        "Warning": i18nBundle.getText(__chunk_5.VALUE_STATE_WARNING)
	      };
	    }
	  }, {
	    key: "classes",
	    get: function get() {
	      return {
	        main: {
	          "ui5-checkbox--hoverable": !this.disabled && !this.readonly && __chunk_10.isDesktop()
	        }
	      };
	    }
	  }, {
	    key: "ariaReadonly",
	    get: function get() {
	      return this.readonly ? "true" : undefined;
	    }
	  }, {
	    key: "ariaDisabled",
	    get: function get() {
	      return this.disabled ? "true" : undefined;
	    }
	  }, {
	    key: "ariaLabelledBy",
	    get: function get() {
	      return this.text ? "".concat(this._id, "-label") : undefined;
	    }
	  }, {
	    key: "ariaDescribedBy",
	    get: function get() {
	      return this.hasValueState ? "".concat(this._id, "-descr") : undefined;
	    }
	  }, {
	    key: "hasValueState",
	    get: function get() {
	      return this.valueState !== __chunk_21.ValueState.None;
	    }
	  }, {
	    key: "valueStateText",
	    get: function get() {
	      return this.valueStateTextMappings()[this.valueState];
	    }
	  }, {
	    key: "tabIndex",
	    get: function get() {
	      var tabindex = this.getAttribute("tabindex");
	      return this.disabled ? undefined : tabindex || "0";
	    }
	  }], [{
	    key: "onDefine",
	    value: function () {
	      var _onDefine = __chunk_1._asyncToGenerator(
	      /*#__PURE__*/
	      regeneratorRuntime.mark(function _callee() {
	        return regeneratorRuntime.wrap(function _callee$(_context) {
	          while (1) {
	            switch (_context.prev = _context.next) {
	              case 0:
	                _context.next = 2;
	                return __chunk_1.fetchI18nBundle("@ui5/webcomponents");

	              case 2:
	              case "end":
	                return _context.stop();
	            }
	          }
	        }, _callee);
	      }));

	      function onDefine() {
	        return _onDefine.apply(this, arguments);
	      }

	      return onDefine;
	    }()
	  }, {
	    key: "dependencies",
	    get: function get() {
	      return [__chunk_12.Label, __chunk_9.Icon];
	    }
	  }]);

	  return CheckBox;
	}(__chunk_1.UI5Element);

	CheckBox.define();

	__chunk_1.registerThemeProperties("@ui5/webcomponents-theme-base", "sap_fiori_3", __chunk_6.defaultThemeBase);
	__chunk_1.registerThemeProperties("@ui5/webcomponents", "sap_fiori_3", __chunk_7.defaultTheme);
	var styles = ".ui5-hidden-text{position:absolute;clip:rect(1px,1px,1px,1px);user-select:none;left:0;top:0}:host([actionable]){cursor:pointer}:host([selected][actionable]:not([active]):hover){background:var(--sapList_Hover_SelectionBackground)}:host([active][actionable]),:host([selected][active][actionable]){background:var(--sapList_Active_Background)}:host([actionable]:not([active]):not([selected]):hover){background:var(--sapList_Hover_Background)}:host([active][actionable]) .ui5-li-root.ui5-li--focusable .ui5-li-content:focus,:host([active][actionable]) .ui5-li-root.ui5-li--focusable:focus{outline-color:var(--sapContent_ContrastFocusColor)}:host([active][actionable]) .ui5-li-root .ui5-li-icon{color:var(--sapList_Active_TextColor)}:host([active][actionable]) .ui5-li-desc,:host([active][actionable]) .ui5-li-info,:host([active][actionable]) .ui5-li-title{color:var(--sapList_Active_TextColor)}:host([info-state=Warning]) .ui5-li-info{color:var(--sapCriticalTextColor)}:host([info-state=Success]) .ui5-li-info{color:var(--sapPositiveTextColor)}:host([info-state=Error]) .ui5-li-info{color:var(--sapNegativeTextColor)}:host([info-state=Information]) .ui5-li-info{color:var(--sapInformativeTextColor)}:host([has-title][description]){height:5rem}:host([has-title][description]) .ui5-li-title{padding-bottom:.375rem}.ui5-li-title-wrapper{display:flex;flex-direction:column;flex:auto;min-width:1px;line-height:normal}.ui5-li-title{color:var(--sapTextColor);font-size:var(--_ui5_list_item_title_size)}.ui5-li-desc,.ui5-li-title{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.ui5-li-desc{color:var(--sapContent_LabelColor);font-size:var(--sapFontSize)}.ui5-li-info{margin:0 .25rem;color:var(--sapNeutralTextColor);font-size:.875rem;flex-shrink:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.ui5-li-img{width:var(--_ui5_list_item_img_size);min-width:var(--_ui5_list_item_img_size);height:var(--_ui5_list_item_img_size);min-height:var(--_ui5_list_item_img_size);margin:var(--_ui5_list_item_img_margin);border-radius:0}.ui5-li-icon{min-width:1rem;min-height:1rem;color:var(--sapContent_NonInteractiveIconColor);padding-right:.5rem}.ui5-li-content{display:flex;align-items:center;flex:auto;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;pointer-events:none}.ui5-li-deletebtn{display:flex;align-items:center}.ui5-li-multisel-cb,.ui5-li-singlesel-radiobtn{flex-shrink:0}:host [ui5-checkbox].ui5-li-singlesel-radiobtn{margin-right:var(--_ui5_list_item_cb_margin_right)}:host [dir=rtl] .ui5-li-icon{padding-left:.5rem;padding-right:0}:host [dir=rtl] .ui5-li-img{margin:.5rem 0 .5rem .75rem}";

	/**
	 * @public
	 */

	var metadata$2 = {
	  languageAware: true,
	  properties:
	  /** @lends  sap.ui.webcomponents.main.ListItem.prototype */
	  {
	    /**
	     * Defines the visual indication and behavior of the list items.
	     * Available options are <code>Active</code> (by default), <code>Inactive</code> and <code>Detail</code>.
	     * <br><br>
	     * <b>Note:</b> When set to <code>Active</code>, the item will provide visual response upon press and hover,
	     * while with type <code>Inactive</code> and <code>Detail</code> - will not.
	     *
	     * @type {ListItemType}
	     * @defaultvalue "Active"
	     * @public
	    */
	    type: {
	      type: ListItemType,
	      defaultValue: ListItemType.Active
	    },

	    /**
	     * Indicates if the list item is active, e.g pressed down with the mouse or the keyboard keys.
	     *
	     * @type {boolean}
	     * @private
	    */
	    active: {
	      type: Boolean
	    },

	    /**
	     * Indicates if the list item is actionable, e.g has hover and pressed effects.
	     *
	     * @type {boolean}
	     * @private
	    */
	    actionable: {
	      type: Boolean
	    },
	    _mode: {
	      type: __chunk_17.ListMode,
	      defaultValue: __chunk_17.ListMode.None,
	      noAttribute: true
	    }
	  },
	  events:
	  /** @lends sap.ui.webcomponents.main.ListItem.prototype */
	  {
	    /**
	     * Fired when the user clicks on the detail button when type is <code>Detail</code>.
	     *
	     * @event sap.ui.webcomponents.main.ListItem#detail-click
	     * @public
	     */
	    "detail-click": {},
	    _press: {},
	    _focused: {},
	    "_selection-requested": {}
	  }
	};
	/**
	 * @class
	 * A class to serve as a base
	 * for the <code>StandardListItem</code> and <code>CustomListItem</code> classes.
	 *
	 * @constructor
	 * @author SAP SE
	 * @alias sap.ui.webcomponents.main.ListItem
	 * @extends ListItemBase
	 * @public
	 */

	var ListItem =
	/*#__PURE__*/
	function (_ListItemBase) {
	  __chunk_1._inherits(ListItem, _ListItemBase);

	  __chunk_1._createClass(ListItem, null, [{
	    key: "metadata",
	    get: function get() {
	      return metadata$2;
	    }
	  }, {
	    key: "styles",
	    get: function get() {
	      return [__chunk_20.ListItemBase.styles, styles];
	    }
	  }, {
	    key: "dependencies",
	    get: function get() {
	      return [__chunk_14.Button, RadioButton, CheckBox];
	    }
	  }]);

	  function ListItem() {
	    var _this;

	    __chunk_1._classCallCheck(this, ListItem);

	    _this = __chunk_1._possibleConstructorReturn(this, __chunk_1._getPrototypeOf(ListItem).call(this));

	    _this.deactivateByKey = function (event) {
	      if (__chunk_8.isEnter(event)) {
	        _this.deactivate();
	      }
	    };

	    _this.deactivate = function () {
	      if (_this.active) {
	        _this.active = false;
	      }
	    };

	    _this.i18nBundle = __chunk_3.getI18nBundle("@ui5/webcomponents");
	    return _this;
	  }

	  __chunk_1._createClass(ListItem, [{
	    key: "onBeforeRendering",
	    value: function onBeforeRendering() {
	      this.actionable = this.type === ListItemType.Active && this._mode !== __chunk_17.ListMode.Delete;
	    }
	  }, {
	    key: "onEnterDOM",
	    value: function onEnterDOM() {
	      document.addEventListener("mouseup", this.deactivate);
	      document.addEventListener("touchend", this.deactivate);
	      document.addEventListener("keyup", this.deactivateByKey);
	    }
	  }, {
	    key: "onExitDOM",
	    value: function onExitDOM() {
	      document.removeEventListener("mouseup", this.deactivate);
	      document.removeEventListener("keyup", this.deactivateByKey);
	      document.removeEventListener("touchend", this.deactivate);
	    }
	  }, {
	    key: "_onkeydown",
	    value: function _onkeydown(event) {
	      __chunk_1._get(__chunk_1._getPrototypeOf(ListItem.prototype), "_onkeydown", this).call(this, event);

	      var itemActive = this.type === ListItemType.Active;

	      if (__chunk_8.isSpace(event)) {
	        event.preventDefault();
	      }

	      if ((__chunk_8.isSpace(event) || __chunk_8.isEnter(event)) && itemActive) {
	        this.activate();
	      }

	      if (__chunk_8.isEnter(event)) {
	        this.fireItemPress(event);
	      }
	    }
	  }, {
	    key: "_onkeyup",
	    value: function _onkeyup(event) {
	      if (__chunk_8.isSpace(event) || __chunk_8.isEnter(event)) {
	        this.deactivate();
	      }

	      if (__chunk_8.isSpace(event)) {
	        this.fireItemPress(event);
	      }
	    }
	  }, {
	    key: "_onmousedown",
	    value: function _onmousedown(event) {
	      if (event.isMarked === "button") {
	        return;
	      }

	      this.activate();
	    }
	  }, {
	    key: "_onmouseup",
	    value: function _onmouseup(event) {
	      if (event.isMarked === "button") {
	        return;
	      }

	      this.deactivate();
	    }
	  }, {
	    key: "_ontouchstart",
	    value: function _ontouchstart(event) {
	      this._onmousedown(event);
	    }
	  }, {
	    key: "_ontouchend",
	    value: function _ontouchend(event) {
	      this._onmouseup(event);
	    }
	  }, {
	    key: "_onfocusout",
	    value: function _onfocusout() {
	      __chunk_1._get(__chunk_1._getPrototypeOf(ListItem.prototype), "_onfocusout", this).call(this);

	      this.deactivate();
	    }
	  }, {
	    key: "_onclick",
	    value: function _onclick(event) {
	      if (event.isMarked === "button") {
	        return;
	      }

	      this.fireItemPress(event);
	    }
	    /*
	     * Called when selection components in Single (ui5-radiobutton)
	     * and Multi (ui5-checkbox) selection modes are used.
	     */

	  }, {
	    key: "onMultiSelectionComponentPress",
	    value: function onMultiSelectionComponentPress(event) {
	      if (this.isInactive) {
	        return;
	      }

	      this.fireEvent("_selection-requested", {
	        item: this,
	        selected: event.target.checked,
	        selectionComponentPressed: true
	      });
	    }
	  }, {
	    key: "onSingleSelectionComponentPress",
	    value: function onSingleSelectionComponentPress(event) {
	      if (this.isInactive) {
	        return;
	      }

	      this.fireEvent("_selection-requested", {
	        item: this,
	        selected: !event.target.selected,
	        selectionComponentPressed: true
	      });
	    }
	  }, {
	    key: "activate",
	    value: function activate() {
	      if (this.type === ListItemType.Active) {
	        this.active = true;
	      }
	    }
	  }, {
	    key: "onDelete",
	    value: function onDelete(event) {
	      this.fireEvent("_selection-requested", {
	        item: this,
	        selectionComponentPressed: false
	      });
	    }
	  }, {
	    key: "onDetailClick",
	    value: function onDetailClick(event) {
	      this.fireEvent("detail-click", {
	        item: this,
	        selected: this.selected
	      });
	    }
	  }, {
	    key: "fireItemPress",
	    value: function fireItemPress(event) {
	      if (this.isInactive) {
	        return;
	      }

	      this.fireEvent("_press", {
	        item: this,
	        selected: this.selected,
	        key: event.key
	      });
	    }
	  }, {
	    key: "isInactive",
	    get: function get() {
	      return this.type === ListItemType.Inactive || this.type === ListItemType.Detail;
	    }
	  }, {
	    key: "placeSelectionElementBefore",
	    get: function get() {
	      return this._mode === __chunk_17.ListMode.MultiSelect || this._mode === __chunk_17.ListMode.SingleSelectBegin;
	    }
	  }, {
	    key: "placeSelectionElementAfter",
	    get: function get() {
	      return !this.placeSelectionElementBefore && (this._mode === __chunk_17.ListMode.SingleSelectEnd || this._mode === __chunk_17.ListMode.Delete);
	    }
	  }, {
	    key: "modeSingleSelect",
	    get: function get() {
	      return [__chunk_17.ListMode.SingleSelectBegin, __chunk_17.ListMode.SingleSelectEnd, __chunk_17.ListMode.SingleSelect].includes(this._mode);
	    }
	  }, {
	    key: "modeMultiSelect",
	    get: function get() {
	      return this._mode === __chunk_17.ListMode.MultiSelect;
	    }
	  }, {
	    key: "modeDelete",
	    get: function get() {
	      return this._mode === __chunk_17.ListMode.Delete;
	    }
	  }, {
	    key: "typeDetail",
	    get: function get() {
	      return this.type === ListItemType.Detail;
	    }
	  }, {
	    key: "typeActive",
	    get: function get() {
	      return this.type === ListItemType.Active;
	    }
	  }, {
	    key: "ariaSelected",
	    get: function get() {
	      if (this.modeMultiSelect) {
	        return this.selected;
	      }

	      return undefined;
	    }
	  }, {
	    key: "deleteText",
	    get: function get() {
	      return this.i18nBundle.getText(__chunk_5.DELETE);
	    }
	  }, {
	    key: "_accInfo",
	    get: function get() {
	      return {
	        role: "option",
	        ariaExpanded: undefined,
	        ariaLevel: undefined,
	        ariaLabel: this.i18nBundle.getText(__chunk_5.ARIA_LABEL_LIST_ITEM_CHECKBOX)
	      };
	    }
	  }], [{
	    key: "onDefine",
	    value: function () {
	      var _onDefine = __chunk_1._asyncToGenerator(
	      /*#__PURE__*/
	      regeneratorRuntime.mark(function _callee() {
	        return regeneratorRuntime.wrap(function _callee$(_context) {
	          while (1) {
	            switch (_context.prev = _context.next) {
	              case 0:
	                _context.next = 2;
	                return Promise.all([__chunk_1.fetchI18nBundle("@ui5/webcomponents")]);

	              case 2:
	              case "end":
	                return _context.stop();
	            }
	          }
	        }, _callee);
	      }));

	      function onDefine() {
	        return _onDefine.apply(this, arguments);
	      }

	      return onDefine;
	    }()
	  }]);

	  return ListItem;
	}(__chunk_20.ListItemBase);

	exports.ListItem = ListItem;
	exports.ListItemType = ListItemType;

});
//# sourceMappingURL=chunk-e8d699d1.js.map
