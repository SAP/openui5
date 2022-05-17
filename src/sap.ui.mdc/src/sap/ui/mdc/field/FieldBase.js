/*!
 * ${copyright}
 */
sap.ui.define([
	'sap/ui/thirdparty/jquery',
	'sap/ui/Device',
	'sap/ui/mdc/enum/EditMode',
	'sap/ui/mdc/enum/FieldDisplay',
	'sap/ui/mdc/enum/ConditionValidated',
	'sap/ui/mdc/field/FieldBaseRenderer',
	'sap/ui/mdc/condition/FilterOperatorUtil',
	'sap/ui/mdc/condition/Condition',
	'sap/ui/mdc/field/ConditionType',
	'sap/ui/mdc/field/ConditionsType',
	'sap/ui/mdc/enum/BaseType',
	'sap/ui/mdc/field/content/ContentFactory',
	'sap/ui/mdc/Control',
	"sap/ui/mdc/util/loadModules",
	'sap/ui/core/library',
	'sap/ui/core/LabelEnablement',
	'sap/ui/core/message/MessageMixin',
	'sap/base/util/deepEqual',
	'sap/base/util/merge',
	'sap/base/Log',
	'sap/ui/dom/containsOrEquals',
	'sap/ui/model/BindingMode',
	'sap/ui/model/FormatException',
	'sap/ui/model/ParseException',
	'sap/ui/model/ValidateException',
	'sap/ui/model/base/ManagedObjectModel',
	'sap/ui/base/ManagedObjectObserver',
	'sap/ui/base/SyncPromise',
	'sap/base/util/restricted/_debounce',
	'sap/ui/events/KeyCodes'
], function(
	jQuery,
	Device,
	EditMode,
	FieldDisplay,
	ConditionValidated,
	FieldBaseRenderer,
	FilterOperatorUtil,
	Condition,
	ConditionType,
	ConditionsType,
	BaseType,
	ContentFactory,
	Control,
	loadModules,
	coreLibrary,
	LabelEnablement,
	MessageMixin,
	deepEqual,
	merge,
	Log,
	containsOrEquals,
	BindingMode,
	FormatException,
	ParseException,
	ValidateException,
	ManagedObjectModel,
	ManagedObjectObserver,
	SyncPromise,
	debounce,
	KeyCodes
) {
	"use strict";

	var ValueState = coreLibrary.ValueState;
	var TextAlign = coreLibrary.TextAlign;
	var TextDirection = coreLibrary.TextDirection;

	/**
	 * Constructor for a new <code>FieldBase</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * The <code>FieldBase</code> control is the basic control to be used within the {@link sap.ui.mdc.Field Field} and {@link sap.ui.mdc.FilterField FilterField} controls.
	 * It must not be used stand-alone.
	 *
	 * @extends sap.ui.mdc.Control
	 * @implements sap.ui.core.IFormContent, sap.ui.core.ISemanticFormContent
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @alias sap.ui.mdc.field.FieldBase
	 * @since 1.58.0
	 * @abstract
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 * @experimental As of version 1.58
	 */
	var FieldBase = Control.extend("sap.ui.mdc.field.FieldBase", /* @lends sap.ui.mdc.field.FieldBase.prototype */ {
		metadata: {
			interfaces: ["sap.ui.core.IFormContent", "sap.ui.core.ISemanticFormContent"],
			designtime: "sap/ui/mdc/designtime/field/FieldBase.designtime",
			library: "sap.ui.mdc",
			properties: {
				/**
				 * The type of data handled by the field.
				 * This type is used to parse, format, and validate the value.
				 */
				dataType: {
					type: "string",
					group: "Data",
					defaultValue: 'sap.ui.model.type.String'
				},

				/**
				 * The constraints of the type specified in <code>dataType</code>.
				 */
				dataTypeConstraints: {
					type: "object",
					group: "Data",
					defaultValue: null
				},

				/**
				 * The format options of the type specified in <code>dataType</code>.
				 */
				dataTypeFormatOptions: {
					type: "object",
					group: "Data",
					defaultValue: null
				},

				/**
				 * Determines whether the field is editable, read-only, or disabled.
				 */
				editMode: {
					type: "sap.ui.mdc.enum.EditMode",
					group: "Data",
					defaultValue: EditMode.Editable
				},

				/**
				 * Indicates that user input is required.
				 */
				required: {
					type: "boolean",
					group: "Data",
					defaultValue: false
				},

				/**
				 * Defines whether the value and/or description of the field is shown and in what order.
				 */
				display: {
					type: "sap.ui.mdc.enum.FieldDisplay",
					defaultValue: FieldDisplay.Value
				},

				/**
				 * Defines the horizontal alignment of the text that is shown inside the input field.
				 *
				 * <b>Note:</b> If the rendered control doesn't support this feature, this property is ignored.
				 */
				textAlign: {
					type: "sap.ui.core.TextAlign",
					group: "Appearance",
					defaultValue: TextAlign.Initial
				},

				/**
				 * Defines the text directionality of the input field, for example <code>RTL</code>, <code>LTR</code>.
				 *
				 * <b>Note:</b> If the rendered control doesn't support this feature, this property is ignored.
				 */
				textDirection: {
					type: "sap.ui.core.TextDirection",
					group: "Appearance",
					defaultValue: TextDirection.Inherit
				},

				/**
				 * Defines a short hint intended to aid the user with data entry when the control has no value.
				 * If the value is <code>null</code> no placeholder is shown.
				 *
				 * <b>Note:</b> If the rendered control doesn't support this feature, this property is ignored.
				 */
				placeholder: {
					type: "string",
					group: "Misc",
					defaultValue: ""
				},

				/**
				 * Visualizes the validation state of the control, for example <code>Error</code>, <code>Warning</code>, <code>Success</code>.
				 *
				 * <b>Note:</b> The visualization of the <code>ValueState</code> property is handled by the inner rendered control.
				 * If a control is set (using <code>content</code>, <code>contentEdit</code>, or <code>contentDisplay</code>), this control needs to support
				 * the <code>valueState</code> behavior, otherwise <code>valueState</code> is not visualized.
				 */
				valueState: {
					type: "sap.ui.core.ValueState",
					group: "Appearance",
					defaultValue: ValueState.None
				},

				/**
				 * Defines the text that appears in the value state message pop-up. If this has not specified, a default text from the resource bundle is shown.
				 */
				valueStateText: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * Defines the width of the control.
				 */
				width: {
					type: "sap.ui.core.CSSSize",
					group: "Dimension",
					defaultValue: null
				},

				/**
				 * If set, the <code>Field</code> is rendered using a multi-line control.
				 *
				 * This property only affects types that support multiple lines.
				 *
				 * This property is only used for single-value fields.
				 *
				 * <b>Note</b> If the data type used doesn't support multiple lines an error is thrown.
				 */
				multipleLines: {
					type: "boolean",
					group: "Appearance",
					defaultValue: false
				},

				/**
				 * Sets the maximum amount of conditions that are allowed for this field.
				 *
				 * The default value of -1 indicates that an unlimited amount of conditions can be defined.
				 *
				 * <b>Note</b> If the data type used doesn't support multiple conditions, an error is thrown.
				 */
				maxConditions: {
					type: "int",
					group: "Behavior",
					defaultValue: -1
				},

				/**
				 * Sets the conditions that represent the values of the field.
				 *
				 * This should be bound to a {@link sap.ui.mdc.condition.ConditionModel ConditionModel} using the corresponding fieldPath.
				 *
				 * <b>Note:</b> For {@link sap.ui.mdc.FilterField FilterField} controls, the <code>conditions</code> property must be used to bind
				 * {@link sap.ui.mdc.FilterField FilterField} to a {@link sap.ui.mdc.condition.ConditionModel ConditionModel}.</br>
				 * For example, for a {@link sap.ui.mdc.FilterField FilterField} control inside a {@link sap.ui.mdc.FilterBar FilterBar} control the binding looks like this:</br>
				 * <code>conditions="{$filters>/conditions/propertyPath}"</code> with the following data:
				 * <ul>
				 * <li><code>$filters</code> as the name of the condition model</li>
				 * <li><code>/conditions/</code> as a required static part of the binding</li>
				 * <li><code>propertyPath</code> as the property name</li>
				 * </ul>
				 *
				 * For an Any (see {@link sap.ui.model.FilterOperator}) {@link sap.ui.mdc.FilterField FilterField} control, the binding looks like this:</br>
				 * <code>conditions='{$filters>/conditions/navPath&#42;/propertyPath}'</code> with the following data:
				 * <ul>
				 * <li><code>$filters</code> as the name of the condition model</li>
				 * <li><code>/conditions/</code> as a required static part of the binding</li>
				 * <li><code>navPath#42;/</code> as the navigation property name</li>
				 * <li><code>propertyPath</code> as the property name</li>
				 * </ul>
				 * Between <code>navPath</code> and <code>propertyPath</code>, <b>&#42;/</b> is required.
				 *
				 * <b>Note:</b> A condition must have the structure of {@link sap.ui.mdc.condition.ConditionObject ConditionObject}.
				 */
				conditions: {
					type: "object[]",
					group: "Data",
					defaultValue: [],
					byValue: true
				},

				/**
				 * Defines the label text for the field.
				 *
				 * This can be used by {@link sap.ui.mdc.FilterBar FilterBar} or {@link sap.ui.layout.form.Form Form} controls to create a {@link sap.m.Label Label} control for the field.
				 *
				 * @experimental
				 * @since 1.62.0 Disclaimer: this property is in a beta state - incompatible API changes may be done before its official public release. Use at your own discretion.
				 */
				label: {
					type: "string",
					group: "Misc",
					defaultValue: ""
				},

				/**
				 * Path to <code>FieldBaseDelegate</code> module that provides the required APIs to execute model-specific logic.<br>
				 * <b>Note:</b> Ensure that the related file can be requested (any required library has to be loaded before that).<br>
				 * Do not bind or modify the module. Once the required module is associated, this property might not be needed any longer.
				 *
				 * @since 1.72.0
				 * @experimental
				 */
				delegate: {
					type: "object",
					defaultValue: {
						name: "sap/ui/mdc/field/FieldBaseDelegate",
						payload: {}
					}
				},

				/**
				 * If set, an empty <code>Field</code> renders an empty-indicator in display mode.
				 *
				 * This property only takes effect if <code>editMode</code> is set to <code>Display</code>.
				 *
				 * <b>Note</b> Empty means the <code>Field</code> holds no value. If an empty string is a valid value,
				 * the <code>Field</code> might show nothing, depending on the <code>display</code> settings and assigned description
				 * or <code>FieldHelp</code>.
				 *
				 * @since 1.85.0
				 */
				showEmptyIndicator: {
					type: "boolean",
					group: "Appearance",
					defaultValue: false
				},

				/**
				 * Internal property to bind the <code>showValueHelp</code> property of the internal <code>Input</code> control.
				 */
				_fieldHelpEnabled: {
					type: "boolean",
					group: "Appearance",
					defaultValue: false,
					visibility: "hidden"
				},

				/**
				 * Sets the ARIA attributes added to the inner control.
				 *
				 * The object contains ARIA attributes in an <code>aria</code> node.
				 * Additional attributes, such as <code>role</code>, <code>autocomplete</code> or <code>valueHelpEnabled</code>, are added on root level.
				 */
				_ariaAttributes: {
					type: "object",
					defaultValue: {},
					byValue: true,
					visibility: "hidden"
				}

			},
			aggregations: {
				/**
				 * Optional content that can be rendered.
				 *
				 * <b>Note:</b> Bind the value-holding property of the control to <code>'$field>/conditions'</code>
				 * using {@link sap.ui.mdc.field.ConditionsType ConditionsType} as type.
				 *
				 * If the control needs to show multiple conditions, bind its aggregation to </code>'$field>/conditions'</code>.
				 * Bind the item controls value-holding property using {@link sap.ui.mdc.field.ConditionType ConditionType} as type.
				 *
				 * <b>Warning:</b> Only controls allowed in a {@link sap.ui.layout.form.Form Form} are allowed to be used for this optional content.
				 * Other controls might break the layout.
				 * This means the {@link sap.ui.core.IFormContent IFormContent} interface needs to be implemented by these controls.
				 */
				content: {
					type: "sap.ui.core.Control",
					multiple: false
				},

				/**
				 * Optional content to be rendered if the <code>editMode</code> property is not set to <code>Display</code>.
				 *
				 * <b>Note:</b> If a control is assigned to the <code>content</code> aggregation, this one is ignored.
				 *
				 * <b>Note:</b> Bind the value-holding property of the control to <code>'$field>/conditions'</code>
				 * using {@link sap.ui.mdc.field.ConditionsType ConditionsType} as type.
				 *
				 * If the control needs to show multiple conditions, bind its aggregation to </code>'$field>/conditions'</code>.
				 * Bind the item controls value-holding property using {@link sap.ui.mdc.field.ConditionType ConditionType} as type.
				 *
				 * <b>Warning:</b> Only controls allowed in a {@link sap.ui.layout.form.Form Form} are allowed to be used for this optional content.
				 * Other controls might break the layout.
				 * This means the {@link sap.ui.core.IFormContent IFormContent} interface needs to be implemented by these controls.
				 *
				 * @since 1.61.0
				 */
				contentEdit: {
					type: "sap.ui.core.Control",
					multiple: false
				},

				/**
				 * Optional content to be rendered  if the <code>editMode</code> property is set to <code>Display</code>.
				 *
				 * <b>Note:</b> If a control is assigned to the <code>content</code> aggregation, this one is ignored.
				 *
				 * <b>Note:</b> Bind the value-holding property of the control to <code>'$field>/conditions'</code>
				 * using {@link sap.ui.mdc.field.ConditionsType ConditionsType} as type.
				 *
				 * If the control needs to show multiple conditions, bind its aggregation to </code>'$field>/conditions'</code>.
				 * Bind the item controls value-holding property using {@link sap.ui.mdc.field.ConditionType ConditionType} as type.
				 *
				 * <b>Warning:</b> Only controls allowed in a {@link sap.ui.layout.form.Form Form} are allowed to be used for this optional content.
				 * Other controls might break the layout.
				 * This means the {@link sap.ui.core.IFormContent IFormContent} interface needs to be implemented by these controls.
				 *
				 * @since 1.61.0
				 */
				contentDisplay: {
					type: "sap.ui.core.Control",
					multiple: false
				},

				/**
				 * Internal content if no control set from outside.
				 */
				_content: {
					type: "sap.ui.core.Control",
					multiple: true,
					visibility: "hidden"
				},

				/**
				 * Optional <code>FieldInfo</code> used for detail information. This is only active in display mode.
				 *
				 * <b>Note:</b> If a special data type is defined or a content control is set, this is ignored.
				 */
				fieldInfo: {
					type: "sap.ui.mdc.field.FieldInfoBase",
					multiple: false
				}
			},
			associations: {
				/**
				 * Optional <code>FieldHelp</code>.
				 *
				 * This is an association that allows the usage of one <code>FieldHelp</code> instance for multiple fields.
				 *
				 * <b>Note:</b> If the field is inside of a table, do not set the <code>FieldHelp</code> instance as <code>dependent</code>
				 * to the field. If you do every field instance in every table row gets a clone of it.
				 * Put the <code>FieldHelp</code> instance e.g. as dependent on the table or page.
				 * The <code>FieldHelp</code> instance must be somewhere in the control tree, otherwise there might
				 * be rendering or update issues.
				 *
				 * <b>Note:</b> For Boolean fields, no <code>FieldHelp</code> should be added, but a default <code>FieldHelp</code> used instead.
				 */
				fieldHelp: {
					type: "sap.ui.mdc.ValueHelp",
					multiple: false
				},

				/**
				 * Association to controls / IDs that label this control (see WAI-ARIA attribute aria-labelledby).
				 */
				ariaLabelledBy: { type: "sap.ui.core.Control", multiple: true, singularName: "ariaLabelledBy" }
			},
			events: {
				/**
				 * This event is fired when the value of the field is changed, for example, each time a key is pressed.
				 *
				 * <b>Note</b> This event is only triggered if the used content control has a <code>liveChange</code> event.
				 */
				liveChange: {
					parameters: {
						/**
						 * The new value of the input
						 */
						value: { type: "string" },

						/**
						 * Indicates that the ESC key triggered the event
						 */
						escPressed: { type: "boolean" },

						/**
						 * The value of the input before pressing ESC key
						 */
						previousValue: { type: "string" }
					}
				},
				/**
				 * This event is fired if the inner control has a </code>press</code> event and this is fired.
				 */
				press: {},
				/**
				 * This event is fired when the user presses <kbd>Enter</kbd>.
				 * It allows the application to implement some submit logic.
				 *
				 * <b>Note</b> This event is only triggered if the field is editable.
				 *
				 * @since 1.82.0
				 */
				submit: {
					parameters: {
						/**
						 * Returns a <code>Promise</code> for the change. The <code>Promise</code> returns the value if it is resolved.
						 * If the last <code>change</code> event is synchronous, the <code>Promise</code> has already been resolved. If it is asynchronous,
						 * it will be resolved after the value has been updated.
						 */
						promise: { type: "Promise" }
					}
				}
			},
			publicMethods: [],
			defaultAggregation: "content"
		},
		renderer: FieldBaseRenderer,
		_oManagedObjectModel: null
	});

	// apply the message mixin so all message on the input will get the associated label-texts injected
	MessageMixin.call(FieldBase.prototype);

	var oContentEventDelegateBefore = {
		onsapprevious: _handleKeybordEvent,
		onsapnext: _handleKeybordEvent,
		onsapup: _handleKeybordEvent,
		onsapdown: _handleKeybordEvent,
		onsapbackspace: _handleKeybordEvent
	};

	var oContentEventDelegateAfter = {
		onsapenter: _handleEnter
	};

	var mDefaultHelps;

	// private function to initialize globals for qUnit tests
	FieldBase._init = function() {

		if (mDefaultHelps && mDefaultHelps.bool && mDefaultHelps.bool.control) {
			mDefaultHelps.bool.control.destroy();
		}
		if (mDefaultHelps && mDefaultHelps.defineConditions && mDefaultHelps.defineConditions.control) {
			mDefaultHelps.defineConditions.control.destroy();
		}

		mDefaultHelps = {
			bool: {
				modules: ["sap/ui/mdc/ValueHelp", "sap/ui/mdc/valuehelp/Popover", "sap/ui/mdc/valuehelp/content/Bool"],
				id: "BoolDefaultHelp",
				getDelegate: "getDefaultValueHelpDelegate",
				contentProperties: {},
				dialog: false,
				control: undefined,
				updateTitle: function (oValueHelp, sTitle) {
					// no title needed for boolean help (just dropdown)
				}
			},
			defineConditions: {
				modules: ["sap/ui/mdc/ValueHelp", "sap/ui/mdc/valuehelp/Dialog", "sap/ui/mdc/valuehelp/content/Conditions"],
				id: "Field-DefineConditions-Help",
				getDelegate: "getDefaultValueHelpDelegate",
				contentProperties: {},
				dialog: true,
				control: undefined,
				updateTitle: function (oValueHelp, sTitle) {
					oValueHelp.getDialog().setTitle(sTitle);
					oValueHelp.getDialog().getContent()[0].setLabel(sTitle);
				}
			}
		};

	};

	FieldBase._init();

	FieldBase.prototype.init = function() {

		Control.prototype.init.apply(this, arguments);

		this._oObserver = new ManagedObjectObserver(this._observeChanges.bind(this));

		this._oObserver.observe(this, {
			properties: ["display", "editMode", "dataType", "dataTypeFormatOptions", "dataTypeConstraints",
				"multipleLines", "maxConditions", "conditions", "delegate"],
			aggregations: ["fieldInfo", "content", "contentEdit", "contentDisplay"],
			associations: ["fieldHelp", "ariaLabelledBy"]
		});

		this.attachEvent("modelContextChange", this._handleModelContextChange, this);

		this._oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");

		this._aAsyncChanges = [];

		this._bPreventGetDescription = false; // set in navigate or select from field help

		this._oContentFactory = new ContentFactory(this.getId() + "-contentFactory", {
			field: this,
			handleTokenUpdate: _handleTokenUpdate.bind(this),
			handleContentChange: _handleContentChange.bind(this),
			handleContentLiveChange: _handleContentLiveChange.bind(this),
			handleValueHelpRequest: _handleValueHelpRequest.bind(this),
			handleEnter: _handleEnter.bind(this),
			handleContentPress: _handleContentPress.bind(this)
		});

		this._oCreateContentPromise = undefined;

		this._sFilterValue = "";

	};

	FieldBase.prototype.exit = function() {

		var oFieldInfo = this.getFieldInfo();
		if (oFieldInfo) {
			// as aggregations are destroyed after exit
			oFieldInfo.detachEvent("dataUpdate", _handleInfoDataUpdate, this);
		}

		var oContent = this.getContent();
		if (oContent) {
			_detachContentHandlers.call(this, oContent);
		}
		var oContentEdit = this.getContentEdit();
		if (oContentEdit) {
			_detachContentHandlers.call(this, oContentEdit);
		}
		var oContentDisplay = this.getContentDisplay();
		if (oContentDisplay) {
			_detachContentHandlers.call(this, oContentDisplay);
		}

		if (this._oManagedObjectModel) {
			this._oManagedObjectModel.destroy();
			delete this._oManagedObjectModel;
		}

		this._oObserver.disconnect();
		this._oObserver = undefined;
		this._oCreateContentPromise = undefined;

		var oFieldHelp = _getFieldHelp.call(this);
		if (oFieldHelp) {
			oFieldHelp.detachEvent("dataUpdate", _handleHelpDataUpdate, this);
			if (this._bConnected) {
				_handleDisconnect.call(this); // remove event listeners
				oFieldHelp.connect(); // disconnect FieldHelp to remove callbacks
			}
		}

		if (this._oContentFactory) {
			this._oContentFactory.destroy();
			this._oContentFactory = undefined;
		}

		// do not trigger async suggestion
		_clearLiveChangeTimer.call(this);
		delete this._fnLiveChangeTimer;

	};

	FieldBase.prototype.applySettings = function() {
		Control.prototype.applySettings.apply(this, arguments);
		if (!this.bDelegateInitialized && !this.bDelegateLoading) {
			this.initControlDelegate();
		}
		this._triggerCheckCreateInternalContent();

		this._bSettingsApplied = true;

		return this;
	};

	FieldBase.prototype.setProperty = function(sPropertyName, vValue, bSuppressInvalidate) {

		// most properties are rendered from content controls. Only invalidate whole Field if needed
		// (multipleLines mostly changed together with editMode -> update once on rendering)
		if (sPropertyName === "editMode") {
			// only invalidate if switched between edit and display, not for redonly or disabled
			var sOld = this.getEditMode();
			if (sOld !== EditMode.Display && sOld !== EditMode.EditableDisplay && vValue !== EditMode.Display && vValue !== EditMode.EditableDisplay) {
				bSuppressInvalidate = true;
			}
		} else if (sPropertyName !== "width" && sPropertyName !== "multipleLines" && sPropertyName !== "showEmptyIndicator") {
			bSuppressInvalidate = true;
		}

		return Control.prototype.setProperty.apply(this, [sPropertyName, vValue, bSuppressInvalidate]);

	};

	FieldBase.prototype.onBeforeRendering = function() {

		_createInternalContentWrapper.call(this);

	};

	FieldBase.prototype.onAfterRendering = function() {

	};

	FieldBase.prototype.onfocusin = function(oEvent) {

		_connectFieldhelp.call(this);

	};

	FieldBase.prototype.onsapfocusleave = function(oEvent) {

		_clearLiveChangeTimer.call(this);

	};

	// fire change event only if unit and currency field are left
	function _validateFieldGroup(aFieldGroupIds) {

		var iIndex = aFieldGroupIds.indexOf(this.getId());
		if (iIndex > -1) { //own FieldGroup left
			if (this._bPendingChange) {
				var oFocusedElement = document.activeElement;
				var oFieldHelp = _getFieldHelp.call(this);
				if (!(oFocusedElement && oFieldHelp && containsOrEquals(oFieldHelp.getDomRef(), oFocusedElement))) {
					var oPromise = _getAsyncPromise.call(this);

					if (oPromise) {
						_executeChange.call(this, undefined, undefined, undefined, oPromise);
					} else {
						_executeChange.call(this, this.getConditions(), !this._bParseError);
					}
				}
			}

			if (aFieldGroupIds.length > 1) {
				// if there are other FieldGrops fire event without internal FieldGroup
				aFieldGroupIds.splice(iIndex, 1);

				this.fireValidateFieldGroup({
					fieldGroupIds : aFieldGroupIds
				});
			}
		}

	}

	FieldBase.prototype.onsapup = function(oEvent) {

		if (this.getEditMode() === EditMode.Editable) {
			var oFieldHelp = _getFieldHelp.call(this);
			var oSource = oEvent.srcControl;

			if (oFieldHelp && (!oFieldHelp.valueHelpEnabled || oFieldHelp.valueHelpEnabled() || oFieldHelp.isOpen()) && (!this._oContentFactory.isMeasure() || oSource.getShowValueHelp())) {
				// if only type-ahead but no real value help, only navigate if open TODO: remove function check
				oEvent.preventDefault();
				oEvent.stopPropagation();
				oFieldHelp.setFilterValue(this._sFilterValue); // to be sure to filter for typed value
				oFieldHelp.navigate(-1);
			}
		}

	};

	FieldBase.prototype.onsapdown = function(oEvent) {

		if (this.getEditMode() === EditMode.Editable) {
			var oFieldHelp = _getFieldHelp.call(this);
			var oSource = oEvent.srcControl;

			if (oFieldHelp && (!oFieldHelp.valueHelpEnabled || oFieldHelp.valueHelpEnabled() || oFieldHelp.isOpen()) && (!this._oContentFactory.isMeasure() || oSource.getShowValueHelp())) {
				// if only type-ahead but no real value help, only navigate if open TODO: remove function check
				oEvent.preventDefault();
				oEvent.stopPropagation();
				oFieldHelp.setFilterValue(this._sFilterValue); // to be sure to filter for typed value
				oFieldHelp.navigate(1);
			}
		}

	};

	FieldBase.prototype.onsapenter = function(oEvent) {

		// if same value is entered again no change event is triggered, So we need to close the suggestion here
		var oFieldHelp = _getFieldHelp.call(this);
		if (oFieldHelp && oFieldHelp.isOpen(true)) {
			oFieldHelp.close();
		}
		this._sFilterValue = "";

	};

	FieldBase.prototype.onsapescape = function(oEvent) {

		// close FieldHelp also if escape pressed without changing value
		this.onsapenter(oEvent);

	};

	FieldBase.prototype.ontap = function(oEvent) {

		// in "Select"-case the suggestion help should open on click into field
		var oFieldHelp = _getFieldHelp.call(this);
		if (oFieldHelp) {
			if (oFieldHelp.shouldOpenOnClick() && !oFieldHelp.isOpen(true)) {
				oFieldHelp.open(true);
			}
			var oSource = oEvent.srcControl;
			if (oFieldHelp.isOpen(true) && (!this._oContentFactory.isMeasure() || (oSource.getShowValueHelp && oSource.getShowValueHelp()))) {
				oSource.addStyleClass("sapMFocus"); // to show focus outline again after navigation
				oFieldHelp.removeFocus();
			}
		}

	};

	FieldBase.prototype.clone = function(sIdSuffix, aLocalIds) {

		// detach event handler before cloning to not have it twice on the clone
		// attach it after clone again
		this.detachEvent("modelContextChange", this._handleModelContextChange, this);

		var oContent = this.getContent();
		if (oContent) {
			_detachContentHandlers.call(this, oContent);
		}
		var oContentEdit = this.getContentEdit();
		if (oContentEdit) {
			_detachContentHandlers.call(this, oContentEdit);
		}
		var oContentDisplay = this.getContentDisplay();
		if (oContentDisplay) {
			_detachContentHandlers.call(this, oContentDisplay);
		}

		var oFieldInfo = this.getFieldInfo();
		if (oFieldInfo) {
			oFieldInfo.detachEvent("dataUpdate", _handleInfoDataUpdate, this);
		}

		var oClone = Control.prototype.clone.apply(this, arguments);

		this.attachEvent("modelContextChange", this._handleModelContextChange, this);

		if (oContent) {
			_attachContentHandlers.call(this, oContent);
		}
		if (oContentEdit) {
			_attachContentHandlers.call(this, oContentEdit);
		}
		if (oContentDisplay) {
			_attachContentHandlers.call(this, oContentDisplay);
		}

		if (oFieldInfo) {
			oFieldInfo.attachEvent("dataUpdate", _handleInfoDataUpdate, this);
		}

		if (this._bTriggerable) {
			// render Link as default on clone if Link rendered on original (only change if needed in _handleInfoDataUpdate)
			oClone._bTriggerable = this._bTriggerable;
		}

		return oClone;

	};

	/**
	 * Gets <code>fieldPath</code>.
	 *
	 * If the <code>conditions</code> are bound to a <code>ConditionModel</code>, the <code>FieldPath</code> is determined from this binding.
	 *
	 * @returns {string} fieldPath of the field
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldHelpBase
	 */
	FieldBase.prototype.getFieldPath = function() {

		var sBindingPath = this.getBindingPath("conditions");
		if (sBindingPath && sBindingPath.startsWith("/conditions/")) {
			return sBindingPath.slice(12);
		} else {
			return "";
		}

	};

	function _triggerChange(aConditions, bValid, vWrongValue, oPromise) {

		if (this._getContent().length > 1) {
			// in unit/currency field fire Change only if ENTER pressed or field completely left. Not on focus between number and unit
			this._bPendingChange = true;
		} else {
			_executeChange.call(this, aConditions, bValid, vWrongValue, oPromise);
		}

	}

	function _executeChange(aConditions, bValid, vWrongValue, oPromise) {

		if (!oPromise) {
			// not promise -> change is synchronously -> return resolved SyncPromise
			if (bValid) {
				oPromise = Promise.resolve(this._getResultForPromise(aConditions));
			} else {
				oPromise = Promise.reject(vWrongValue);
			}
		}

		this._fireChange(aConditions, bValid, vWrongValue, oPromise);

		this._bPendingChange = false;

	}

	FieldBase.prototype._fireChange = function(aConditions, bValid, vWrongValue, oPromise) {
		// to be implemented by Filed and FilterField
	};

	function _handleEnter(oEvent) {

		var sEditMode = this.getEditMode();

		if (ContentFactory._getEditable(sEditMode) && (this.hasListeners("submit") || this._bPendingChange)) {
			// collect all pending promises for ENTER, only if all resolved it's not pending. (Normally there should be only one.)
			var oPromise = _getAsyncPromise.call(this);
			var bPending = false;

			if (oPromise) {
				bPending = true;
			} else if (this._bParseError) {
				oPromise = Promise.reject();
			} else {
				oPromise = Promise.resolve(this._getResultForPromise(this.getConditions()));
			}

			if (this._bPendingChange) {
				if (bPending) {
					_executeChange.call(this, undefined, undefined, undefined, oPromise);
				} else {
					_executeChange.call(this, this.getConditions(), !this._bParseError, undefined, oPromise);
				}
			}

			this.fireSubmit({ promise: oPromise });
		}

	}

	// to be enhanced by Field
	FieldBase.prototype._initDataType = function() {
		if (this._oContentFactory.getDataType()) {
			this._oContentFactory.getDataType().destroy();
			this._oContentFactory.setDataType(undefined);
		}

		if (this._oContentFactory.getDateOriginalType()) {
			if (this._oContentFactory.getDateOriginalType()._bCreatedByField) {
				// do not destroy if used in Field binding
				this._oContentFactory.getDateOriginalType().destroy();
			}
			this._oContentFactory.setDateOriginalType(undefined);
		}

		if (this._oContentFactory.getUnitOriginalType()) {
			if (this._oContentFactory.getUnitOriginalType()._bCreatedByField) {
				// do not destroy if used in Field binding
				this._oContentFactory.getUnitOriginalType().destroy();
			}
			this._oContentFactory.getUnitOriginalType(undefined);
		}
	};

	function _getDataTypeName() {
		if (this._oContentFactory.getDataType() && typeof this._oContentFactory.getDataType() === "object") {
			return this._oContentFactory.getDataType().getMetadata().getName();
		} else if (this.bDelegateInitialized) {
			return this.getControlDelegate().getDataTypeClass(this.getPayload(), this.getDataType());
		} else {
			return this.getDataType();
		}
	}

	function _getDataTypeConstraints() {
		var oDataType = this._oContentFactory.getDataType();
		if (oDataType && typeof oDataType === "object" && oDataType.getConstraints()) {
			return oDataType.getConstraints();
		} else {
			return this.getDataTypeConstraints();
		}
	}

	function _getDataTypeFormatOptions() {
		var oDataType = this._oContentFactory.getDataType();
		if (oDataType && typeof oDataType === "object" && oDataType.getFormatOptions()) {
			return oDataType.getFormatOptions();
		} else {
			return this.getDataTypeFormatOptions();
		}
	}

	FieldBase.prototype.getBaseType = function() {
		var sDataType = _getDataTypeName.call(this);
		var oDataTypeConstraints = _getDataTypeConstraints.call(this);
		var oDataTypeFormatOptions = _getDataTypeFormatOptions.call(this);
		var sBaseType = this.getTypeUtil().getBaseType(sDataType, oDataTypeFormatOptions, oDataTypeConstraints);

		return sBaseType;
	};

	function _handleConditionsChange(aConditions, aConditionsOld) {

		var oFieldHelp = _getFieldHelp.call(this);

		if (oFieldHelp && this._bConnected) {
			_setConditionsOnFieldHelp.call(this, aConditions, oFieldHelp);
		}

	}

	// needed in Renderer
	FieldBase.prototype._getContent = function() {

		var oContent = this.getContent();

		if (!oContent) {
			if (this.getEditMode() === EditMode.Display) {
				oContent = this.getContentDisplay();
			} else {
				oContent = this.getContentEdit();
			}
		}

		if (oContent) {
			return [oContent];
		} else {
			return this.getAggregation("_content", []);
		}

	};

	FieldBase.prototype._handleModelContextChange = function(oEvent) {

		// let empty as overwritten in Field

	};

	function _setUIMessage(sMsg) {

		this.setValueState(ValueState.Error);
		this.setValueStateText(sMsg);

	}

	FieldBase.prototype._removeUIMessage = function() {

		this.setValueState(ValueState.None);
		this.setValueStateText();

	};

	/**
	 * Observes changes.
	 *
	 * To be enhanced by <code>Field</code>, </code>FilterField</code>, or other inherited controls.
	 *
	 * @param {object} oChanges Changes
	 * @private
	 * @ui5-restricted FieldBase subclasses
	 */
	FieldBase.prototype._observeChanges = function(oChanges) {

		if (oChanges.name === "dataType") {
			// check only if different type (in Field type might be already taken from binding)
			if (this._oContentFactory.getDataType()) {
				var fnCheck = function(sType) {
					var oTypeClass = this.getTypeUtil().getDataTypeClass(oChanges.current);
					if (!(this._oContentFactory.getDataType() instanceof oTypeClass)) {
						// TODO: also compare FormatOptions and Constraints
						this._initDataType();
						this.destroyAggregation("_content");
						this._oContentFactory.updateConditionType();
					}
				}.bind(this);
				if (!this.bDelegateInitialized) {
					// wait until delegate is loaded
					this.awaitControlDelegate().then(function() { fnCheck.call(this, oChanges.current); }.bind(this));
					return;
				}
				fnCheck.call(this, oChanges.current);
			}
		}

		if (oChanges.name === "dataTypeFormatOptions" || oChanges.name === "dataTypeConstraints") {
			// if type is not created right now nothing to do
			if (this._oContentFactory.getDataType()) {
				this._initDataType();
				this.destroyAggregation("_content");
				this._oContentFactory.updateConditionType();
			}
		}

		if (oChanges.name === "maxConditions") {
			this._updateInternalContent();
		}

		if (oChanges.name === "conditions") {
			this._bParseError = false; // if conditions updated from outside parse error is obsolete. If updated from inside no parse error occurs
			_handleConditionsChange.call(this, oChanges.current, oChanges.old);

			// try to find the corresponding async. change
			var bFound = false;
			var i = 0;
			for (i = 0; i < this._aAsyncChanges.length; i++) {
				var oChange = this._aAsyncChanges[i];
				if (oChange.waitForUpdate && deepEqual(oChange.result, oChanges.current)) {
					_performContentChange.call(this, oChange);
					bFound = true;
					break;
				}
			}
			if (bFound) {
				this._aAsyncChanges.splice(i, 1);
			}

			// in display mode rerender if changed from or to empty (show or hide empty-indicator)
			if ((oChanges.current.length === 0 || oChanges.old.length === 0) && this.getShowEmptyIndicator() && this.getEditMode() === EditMode.Display && !this.getContent() && !this.getContentDisplay()) {
				this.invalidate();
			}
		}

		if (oChanges.name === "display") {
			this._destroyInternalContent(); // as bound property can change
			this._oContentFactory.updateConditionType();
		}

		if (oChanges.name === "fieldHelp" && oChanges.ids) {
			_fieldHelpChanged.call(this, oChanges.ids, oChanges.mutation);
			this._oContentFactory.updateConditionType();
		}

		if (oChanges.name === "fieldInfo" && oChanges.child) {
			_fieldInfoChanged.call(this, oChanges.child, oChanges.mutation);
		}

		if (oChanges.name === "content" && oChanges.child) {
			_contentChanged.call(this, oChanges.child, oChanges.mutation, oChanges.name);
		}

		if (oChanges.name === "contentEdit" && oChanges.child) {
			_contentChanged.call(this, oChanges.child, oChanges.mutation, oChanges.name);
		}

		if (oChanges.name === "contentDisplay" && oChanges.child) {
			_contentChanged.call(this, oChanges.child, oChanges.mutation, oChanges.name);
		}

		if (oChanges.name === "delegate" && !this.bDelegateInitialized && !this.bDelegateLoading) {
			this.initControlDelegate.call(this);
		}

		if (oChanges.name === "ariaLabelledBy" && oChanges.ids) {
			_ariaLabelledByChanged.call(this, oChanges.ids, oChanges.mutation);
		}

		if (oChanges.name === "editMode") {
			_refreshLabel.call(this); // as required-idicator might set or removed on Label
			if (this._bSettingsApplied && (oChanges.old === EditMode.Display || oChanges.old === EditMode.EditableDisplay || oChanges.current === EditMode.Display || oChanges.current === EditMode.EditableDisplay)) {
				// edit mode changed after settings applied (happens if edit mode is bound and binding updates after control initialization)
				this._triggerCheckCreateInternalContent();
			}
		}
	};

	// to allow Field or FilterField trigger and update if content control
	FieldBase.prototype._updateInternalContent = function() {
		if (this.getAggregation("_content", []).length > 0) {
			_createInternalContentWrapper.call(this);
			this._oContentFactory.updateConditionType(); // if control is not excanged at least ConditionType needs to be updated
		}
	};

	// return the focus DOM elementof the used control
	FieldBase.prototype.getFocusDomRef = function() {

		var aContent = this._getContent();

		if (aContent.length > 0) {
			return aContent[0].getFocusDomRef();
		} else {
			return this.getDomRef();
		}

	};

	// return the ID of the label DOM elementof the used control
	FieldBase.prototype.getIdForLabel = function() {

		var sId;
		var aContent = this._getContent();
		if (aContent.length > 0) {
			sId = aContent[0].getIdForLabel();
		} else {
			sId = _getIdForInternalControl.call(this); // if not rendered use ID for later created inner control
		}

		return sId;

	};

	// return editable as boolean as this is checked in the FormElement to show required-indicator
	FieldBase.prototype.getEditable = function() {

		return ContentFactory._getEditable(this.getEditMode());

	};

	/**
	 * Returns the control the value help is attached to.
	 *
	 * In the case that number and unit are shown in different controls, this is the unit control, not the number control.
	 *
	 * @returns {sap.ui.core.Control} Control for value help
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldHelpBase
	 */
	 FieldBase.prototype.getControlForSuggestion = function() {

		var aContent = this._getContent();
		if (aContent.length > 0) {
			if (this._oContentFactory.isMeasure()) {
				return aContent[1];
			} else {
				return aContent[0];
			}
		} else {
			return this;
		}

	};

	FieldBase.prototype.getFocusElementForValueHelp = function(bTypahead) {
		var oSuggestControl = this.getControlForSuggestion();
		var aIcons = oSuggestControl && oSuggestControl.getMetadata().getAllPrivateAggregations()._endIcon && oSuggestControl.getAggregation("_endIcon", []);
		var oIcon;
		for (var i = 0; i < aIcons.length; i++) { // as MultiInput can have a invisible icon before visible icon
			if (aIcons[i].getVisible()) {
				oIcon = aIcons[i];
				break;
			}
		}
		return bTypahead || !oIcon ? oSuggestControl : oIcon;
	};

	/**
	 * In the case that number and unit are shown in different controls, only one unit is supported.
	 * So the value help needs to be in single selection mode.
	 *
	 * @returns {int} maxConditions used for valueHelp
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldHelpBase
	 */
	FieldBase.prototype.getMaxConditionsForHelp = function() {

		if (this._oContentFactory.isMeasure()) {
			return 1; // only one unit allowed in help
		} else {
			return this.getMaxConditions();
		}

	};

	/*
	 * If Field is inside of a SemanticFormElement return formatted value in display mode
	 */
	FieldBase.prototype.getFormFormattedValue = function() {

		var aConditions = this.getConditions();
		var bShowEmptyIndicator = this.getShowEmptyIndicator() && aConditions.length === 0 && !this.getContent() && !this.getContentDisplay();

		if (bShowEmptyIndicator) {
			if (!this._oResourceBundleM) {
				this._oResourceBundleM = sap.ui.getCore().getLibraryResourceBundle("sap.m");
			}
			return this._oResourceBundleM.getText("EMPTY_INDICATOR"); // TODO: clarify accessibility support for semantic conected fields
		} else if (this._oContentFactory.isMeasure() && this._oContentFactory.getUnitOriginalType()) {
			// in unit case use original data type for formatting (as internal type hides unit)
			var aValue = aConditions.length > 0 ? aConditions[0].values[0] : [0, null]; // TODO: support multiple conditions or other operator than EQ?
			return this._oContentFactory.getUnitOriginalType().formatValue(aValue, "string");
		} else if (this._oContentFactory.getDateOriginalType()) {
			// in date case use original data type for formatting (as internal type formats to ISO format)
			var vValue = aConditions.length > 0 ? aConditions[0].values[0] : null; // TODO: support multiple conditions or other operator than EQ?
			return this._oContentFactory.getDateOriginalType().formatValue(vValue, "string");
		} else {
			var oConditionsType = this._oContentFactory.getConditionsType();
			return oConditionsType.formatValue(aConditions);
		}

	};

	/*
	 * If Field is inside of a SemanticFormElement return value holding property (don't use "value" property of Field as conditions are updares async)
	 */
	FieldBase.prototype.getFormValueProperty = function() {

		return "conditions";

	};

	/*
	 * If Field is inside of a Form use Forms aria logic for label
	 */
	FieldBase.prototype.enhanceAccessibilityState = function(oElement, mAriaProps) {

		var oParent = this.getParent();

		if (oParent && oParent.enhanceAccessibilityState) {
			// use Field as control, but aria properties of rendered inner control.
			oParent.enhanceAccessibilityState(this, mAriaProps);
		}

	};

	/**
	 * @returns {object} Current accessibility state of the control.
	 * @see sap.ui.core.Control#getAccessibilityInfo
	 * @protected
	 */
	FieldBase.prototype.getAccessibilityInfo = function() {

		var aContent = this._getContent();
		if (aContent.length > 0 && aContent[0].getAccessibilityInfo) {
			return aContent[0].getAccessibilityInfo(); // TODO: unit field
		} else {
			// content not known
			return {};
		}

	};

	function _ariaLabelledByChanged(sId, sMutation) {

		// forward to all content controls (internal and external
		var aContent = this.getAggregation("_content", []);
		var oContent = this.getContent();
		if (oContent) {
			aContent.push(oContent);
		}

		oContent = this.getContentDisplay();
		if (oContent) {
			aContent.push(oContent);
		}

		oContent = this.getContentEdit();
		if (oContent) {
			aContent.push(oContent);
		}

		for (var i = 0; i < aContent.length; i++) {
			oContent = aContent[i];
			if (oContent.getMetadata().getAllAssociations().ariaLabelledBy) {
				if (sMutation === "remove") {
					oContent.removeAriaLabelledBy(sId);
				} else if (sMutation === "insert") {
					oContent.addAriaLabelledBy(sId);
				}
			}
		}

	}

	function _setAriaAttributes(bOpen, sItemId) {

		var oAttributes = { aria: {} };
		var oFieldHelp = _getFieldHelp.call(this);

		if (oFieldHelp) {
			var oAriaAttributes = oFieldHelp.getAriaAttributes(this.getMaxConditionsForHelp());
			var sRoleDescription = oAriaAttributes.roleDescription;
			oAttributes["role"] = oAriaAttributes.role;
			if (sRoleDescription) {
				oAttributes.aria["roledescription"] = sRoleDescription;
			}
			oAttributes.aria["haspopup"] = oAriaAttributes.ariaHasPopup;
			oAttributes["autocomplete"] = "off";
			if (bOpen) {
				oAttributes.aria["expanded"] = "true";
				oAttributes.aria["controls"] = oAriaAttributes.contentId;
				if (sItemId) {
					oAttributes.aria["activedescendant"] = sItemId;
				}
			} else {
				oAttributes.aria["expanded"] = "false";
			}
			oAttributes["valueHelpEnabled"] = oAriaAttributes.valueHelpEnabled;
		}

		this.setProperty("_ariaAttributes", oAttributes, true);

	}

	/**
	 * Assigns a <code>Label</code> control to the <code>Field</code> or </code>FilterField</code> controls.
	 *
	 * The text of the label is taken from the <code>Field</code> or </code>FilterField</code> controls.
	 * The <code>labelFor</code> association is set to the <code>Field</code> or </code>FilterField</code> control.
	 *
	 * @param {sap.ui.core.Label} oLabel Label control
	 * @returns {this} Reference to <code>this</code> to allow method chaining
	 *
	 * @private
	 * @ui5-restricted sap.fe
	 * @MDC_PUBLIC_CANDIDATE
	 * @experimental As of version 1.62.0
	 * @since 1.62.0 Disclaimer: this function is in a beta state - incompatible API changes may be done before its official public release. Use at your own discretion.
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	FieldBase.prototype.connectLabel = function(oLabel) {

		_setModelOnContent.call(this, oLabel);
		oLabel.bindProperty("text", { path: "$field>/label" });
		oLabel.setLabelFor(this);

		return this;

	};

	/*
	 * If the inner control changes or the inner control is created after the Label is rendered
	 * the Label needs to be re-rendered. The DOM-node of the "for" attribute needs to be updated.
	 */
	function _refreshLabel() {

		var aLabels = LabelEnablement.getReferencingLabels(this);
		for (var i = 0; i < aLabels.length; i++) {
			var oLabel = sap.ui.getCore().byId(aLabels[i]);
			oLabel.invalidate();
		}

	}

	function _contentChanged(oContent, sMutation, sName) {

		if (sMutation === "remove") {
			_detachContentHandlers.call(this, oContent);
			_restoreKeyboardHandler.call(this, oContent);
			_restoreFieldGroupHandler.call(this, oContent);

			if (this._oContentFactory.getContentConditionTypes()) {
				delete this._oContentFactory.getContentConditionTypes()[sName];
			}
			oContent.setModel(null, "$field"); // remove binding to Field
			// let the internal control be created on rendering
		} else if (sMutation === "insert") {
			if (!oContent.isA("sap.ui.core.IFormContent")) {
				// TODO: allow different content than allowed in Form? Prevent Layouts and unsupported controls because of accessibiliy issues (label asignment, focus...)
				throw new Error(oContent + " is not a valid content! Only use valid content in " + this);
			}
			_modifyKeyboardHandler.call(this, oContent, true);
			_attachContentHandlers.call(this, oContent);
			_modifyFieldGroupHandler.call(this, oContent, true);
			// bind to ManagedObjectModel at rendering to prevent unneded updates

			if (this.getAggregation("_content", []).length > 0) {
				this._destroyInternalContent();
			}

			// as for edit and display different Types are possible switch them with edit mode
			if (!this._oContentFactory.getContentConditionTypes()) {
				this._oContentFactory.setContentConditionTypes({});
			}
			if (!this._oContentFactory.getContentConditionTypes()[sName]) {
				this._oContentFactory.getContentConditionTypes()[sName] = {};
			}

			// find out what is bound to conditions
			var oBindingInfo;
			var sProperty;
			for (sProperty in oContent.getMetadata().getAllProperties()) {
				if (oContent.getBindingPath(sProperty) === "/conditions") {
					oBindingInfo = oContent.getBindingInfo(sProperty);
					if (oBindingInfo && oBindingInfo.type && oBindingInfo.type instanceof ConditionsType) {
						this._oContentFactory.getContentConditionTypes()[sName].oConditionsType = oBindingInfo.type;
					}
					this._oContentFactory.setBoundProperty(sProperty);
				}
				if (sProperty === "editable" && !oContent.getBindingPath(sProperty) && oContent.isPropertyInitial(sProperty)) {
					oContent.bindProperty(sProperty, { path: "$field>/editMode", formatter: ContentFactory._getEditable });
				}
				if (sProperty === "enabled" && !oContent.getBindingPath(sProperty) && oContent.isPropertyInitial(sProperty)) {
					oContent.bindProperty(sProperty, { path: "$field>/editMode", formatter: ContentFactory._getEnabled });
				}
				if (sProperty === "displayOnly" && !oContent.getBindingPath(sProperty) && oContent.isPropertyInitial(sProperty)) {
					oContent.bindProperty(sProperty, { path: "$field>/editMode", formatter: ContentFactory._getDisplayOnly });
				}
				if (sProperty === "required" && !oContent.getBindingPath(sProperty) && oContent.isPropertyInitial(sProperty)) {
					oContent.bindProperty(sProperty, { path: "$field>/required" });
				}
				if (sProperty === "textAlign" && !oContent.getBindingPath(sProperty) && oContent.isPropertyInitial(sProperty)) {
					oContent.bindProperty(sProperty, { path: "$field>/textAlign" });
				}
				if (sProperty === "textDirection" && !oContent.getBindingPath(sProperty) && oContent.isPropertyInitial(sProperty)) {
					oContent.bindProperty(sProperty, { path: "$field>/textDirection" });
				}
				if (sProperty === "valueState" && !oContent.getBindingPath(sProperty) && oContent.isPropertyInitial(sProperty)) {
					oContent.bindProperty(sProperty, { path: "$field>/valueState" });
				}
				if (sProperty === "valueStateText" && !oContent.getBindingPath(sProperty) && oContent.isPropertyInitial(sProperty)) {
					oContent.bindProperty(sProperty, { path: "$field>/valueStateText" });
				}
				if (sProperty === "placeholder" && !oContent.getBindingPath(sProperty) && oContent.isPropertyInitial(sProperty)) {
					oContent.bindProperty(sProperty, { path: "$field>/placeholder" });
				}
				if (sProperty === "showValueHelp" && !oContent.getBindingPath(sProperty) && oContent.isPropertyInitial(sProperty)) {
					oContent.bindProperty(sProperty, { path: "$field>/_fieldHelpEnabled" });
				}
				if (sProperty === "valueHelpIconSrc" && !oContent.getBindingPath(sProperty) && oContent.isPropertyInitial(sProperty)) {
					oContent.setValueHelpIconSrc(this._getFieldHelpIcon());
				}
			}

			for (var sAggregation in oContent.getMetadata().getAllAggregations()) {
				if (oContent.getBindingPath(sAggregation) === "/conditions") {
					oBindingInfo = oContent.getBindingInfo(sAggregation);
					if (oBindingInfo && oBindingInfo.template) {
						for (sProperty in oBindingInfo.template.getMetadata().getAllProperties()) {
							var oTemplateBindingInfo = oBindingInfo.template.getBindingInfo(sProperty);
							if (oTemplateBindingInfo && oTemplateBindingInfo.type && oTemplateBindingInfo.type instanceof ConditionType) {
								this._oContentFactory.getContentConditionTypes()[sName].oConditionType = oTemplateBindingInfo.type;
								break;
							}
						}
					}
				}
				if (sAggregation === "tooltip" && !oContent.getBindingPath(sAggregation) && !oContent.getAggregation(sAggregation)) {
					// at least support string-tooltip
					oContent.bindProperty(sAggregation, { path: "$field>/tooltip" });
				}
			}

			if (oContent.getMetadata().getAllAssociations().ariaLabelledBy) {
				this._oContentFactory.setAriaLabelledBy(oContent);
			}
		}

	}

	function _attachContentHandlers(oContent) {

		if (oContent.getMetadata().getEvents().change) {
			// content has change event -> attach handler
			oContent.attachEvent("change", _handleContentChange, this);
		}
		if (oContent.getMetadata().getEvents().liveChange) {
			// content has liveChange event -> attach handler
			oContent.attachEvent("liveChange", _handleContentLiveChange, this);
		}
		if (oContent.getMetadata().getEvents().press) {
			// content has press event -> attach handler
			oContent.attachEvent("press", _handleContentPress, this);
		}
		if (oContent.getMetadata().getEvents().valueHelpRequest) {
			// content has valueHelpRequest event -> attach handler
			oContent.attachEvent("valueHelpRequest", _handleValueHelpRequest, this);
		}
	}

	function _detachContentHandlers(oContent) {

		if (oContent.getMetadata().getEvents().change) {
			// oldContent has change event -> detach handler
			oContent.detachEvent("change", _handleContentChange, this);
		}
		if (oContent.getMetadata().getEvents().liveChange) {
			// oldContent has liveChange event -> detach handler
			oContent.detachEvent("liveChange", _handleContentLiveChange, this);
		}
		if (oContent.getMetadata().getEvents().press) {
			// oldContent has press event -> detach handler
			oContent.detachEvent("press", _handleContentPress, this);
		}
		if (oContent.getMetadata().getEvents().valueHelpRequest) {
			// oldContent has valueHelpRequest event -> detach handler
			oContent.detachEvent("valueHelpRequest", _handleValueHelpRequest, this);
		}
	}

	function _createInternalContentWrapper() {
		var fnCreateInternalContent = function() {
			if (!this.bDelegateInitialized) {
				// wait until delegate is loaded
				this.awaitControlDelegate().then(function() { _createInternalContentWrapper.call(this); }.bind(this));
			} else {
				_createInternalContent.call(this);
			}
		};

		if (this._oCreateContentPromise) {
			this._oCreateContentPromise.then(function() {
				_createInternalContentWrapper.call(this); // as already a Promise might be pending
			}.bind(this));
		} else {
			fnCreateInternalContent.call(this);
		}
	}

	/*
	 * Check if all needed information are provided. If possible create internal controls
	 */
	FieldBase.prototype._checkCreateInternalContent = function() {

		if (!this.bIsDestroyed && this.getVisible() && this._oContentFactory.getDataType()) {
			_createInternalContentWrapper.call(this);
		}

	};

	/*
	 * To be sure that the check is not called multiple times it needs
	 * to be checked if there is a pending check.
	 * Multiple calls might happen if properties are cheged oftten or
	 * the chck is triggered in BindingContext update (what is often called in propagation).
	 */
	FieldBase.prototype._triggerCheckCreateInternalContent = function() {

		if (!this._oCheckCreateInternalContentPromise) {
			this._oCheckCreateInternalContentPromise = this.awaitControlDelegate().then(function() {
				delete this._oCheckCreateInternalContentPromise;
				this._checkCreateInternalContent();
			}.bind(this));
		}

	};

	function _createInternalContent() {
		var sEditMode = this.getEditMode();
		var oContent = this.getContent();

		this._oContentFactory._setUsedConditionType(oContent, sEditMode); // if external content use it's conditionType
		_checkFieldHelpExist.call(this, this.getFieldHelp()); // as FieldHelp might be greated after ID is assigned to Field
		_setAriaAttributes.call(this, false);


		if (oContent || this._bIsBeingDestroyed ||
			(sEditMode === EditMode.Display && this.getContentDisplay()) ||
			(sEditMode !== EditMode.Display && this.getContentEdit())) {
			this._destroyInternalContent();
			var aContent = this._getContent(); // external set content
			if (aContent.length === 1) {
				_setModelOnContent.call(this, aContent[0]); // bind to ManagedObjectModel
			}
			return;
		}

		// Moved to ContentFactory logic
		var iMaxConditions = this.getMaxConditions();
		var aOperators = this._getOperators();
		var sControlName;
		var aContentOld = this.getAggregation("_content", []);
		var oContentOld;
		var sControlNameOld;

		var bMultipleLines = this.getMultipleLines();
		var bIsTriggerable = this._bTriggerable;
		var oContentType = this._oContentFactory.getContentType(this.getBaseType(), this.getMaxConditions(), bIsTriggerable);

		if (aContentOld.length > 0) {
			oContentOld = aContentOld[0];
			sControlNameOld = oContentOld.getMetadata().getName().replace(/\./g, "/");
		}

		var sContentMode = this._oContentFactory.getContentMode(oContentType, sEditMode, iMaxConditions, bMultipleLines, aOperators);
		var aControlNames = oContentType.getControlNames(sContentMode, aOperators[0]);
		sControlName = aControlNames[0];
		if (sControlName !== sControlNameOld) {
			this._oContentFactory.setHideOperator(_isOnlyOneSingleValue.call(this, aOperators)); // in single value eq Field hide operator

			if (oContentOld) {
				this._destroyInternalContent();

				if (oContentOld.isA("sap.m.DateTimeField")) {
					// in case of DatePicker remove type with special format options
					this._initDataType();
				}

				this._oContentFactory.updateConditionType();
			}

			if (_useDefaultFieldHelp.call(this, oContentType, aOperators, sEditMode, iMaxConditions)) {
				// use default field help
				_createDefaultFieldHelp.call(this, oContentType.getUseDefaultFieldHelp().name);
			} else if (this._sDefaultFieldHelp) {
				delete this._sDefaultFieldHelp; // do not destroy as might used on other Fields too
			}

			var sId = _getIdForInternalControl.call(this);
			this._oCreateContentPromise = this._oContentFactory.createContent(oContentType, sContentMode, sId);
			this._oCreateContentPromise.then(function(aControls) {
				for (var iIndex = 0; iIndex < aControls.length; iIndex++) {
					var oControl = aControls[iIndex];
					oControl.attachEvent("parseError", _handleParseError, this);
					oControl.attachEvent("validationError", _handleValidationError, this);
					oControl.attachEvent("validationSuccess", _handleValidationSuccess, this);
					_modifyKeyboardHandler.call(this, oControl, oContentType.getUseDefaultEnterHandler());
					_modifyFieldGroupHandler.call(this, oControl, false);
					_setModelOnContent.call(this, oControl);
					if (this._bConnected && ((iIndex === 0 && !this._oContentFactory.isMeasure()) || (iIndex === 1 && this._oContentFactory.isMeasure()))) {
						_setFocusHandlingForFieldHelp.call(this, oControl);
					}
					this.addAggregation("_content", oControl);
				}

				_refreshLabel.call(this);
				delete this._oCreateContentPromise; // after finished new creation request can be sync again
			}.bind(this));
		}
	}

	function _getIdForInternalControl() {

		return this.getId() + "-inner";

	}

	FieldBase.prototype._destroyInternalContent = function () {

		// if the internalContent must be new created the data type must be switched back to original one
		// so new creation of control is using original data
		this.destroyAggregation("_content");

		if (this._oContentFactory.getDateOriginalType()) {
			this._oContentFactory.setDataType(this._oContentFactory.getDateOriginalType());
			this._oContentFactory.setDateOriginalType(undefined);
		} else if (this._oContentFactory.getUnitOriginalType()) {
			this._oContentFactory.setDataType(this._oContentFactory.getUnitOriginalType());
			this._oContentFactory.setUnitOriginalType(undefined);
		}

		if (this._bParseError) {
			// as wrong input get lost if content control is destroyed.
			this._bParseError = false;
			this._removeUIMessage();
		}

		if (this._oContentFactory.isMeasure()) {
			this._oContentFactory.setIsMeasure(false);
		}

	};

	function _setModelOnContent(oContent) {
		if (!this._oManagedObjectModel && !this._bIsBeingDestroyed) {
			this._oManagedObjectModel = new ManagedObjectModel(this);
		}
		oContent.setModel(this._oManagedObjectModel, "$field");
	}

	function _handleKeybordEvent(oEvent) {
		// if FieldHelp is open, do not use native arrow handling of control

		var bPrevent = false;
		var oFieldHelp = _getFieldHelp.call(this);

		if (!oFieldHelp) {
			return; // no FieldHelp -> just use logic of content control
		} else if (oFieldHelp.isOpen()) {
			// FieldHelp open, navigate always in FieldHelp
			bPrevent = true;
		} else {
			// FieldHelp closed, prevent only arrow up and down as used to navigate
			switch (oEvent.type) {
				case "sapprevious":
				case "sapup":
					if (oEvent.keyCode === KeyCodes.ARROW_UP) {
						bPrevent = true;
					}

					break;
				case "sapnext":
				case "sapdown":
					if (oEvent.keyCode === KeyCodes.ARROW_DOWN) {
						bPrevent = true;
					}

					break;
				default:
					break;
			}
		}

		if (bPrevent) {
			oEvent.stopPropagation();
			oEvent.stopImmediatePropagation(true);

			// call up and down handler directly
			switch (oEvent.type) {
				case "sapup":
					this.onsapup(oEvent);

					break;
				case "sapdown":
					this.onsapdown(oEvent);

					break;
				default:
					break;
			}
		}

	}

	function _modifyKeyboardHandler(oControl, bUseEnterDelegate) {

		oControl.addDelegate(oContentEventDelegateBefore, true, this);

		if (bUseEnterDelegate) {
			oControl.addDelegate(oContentEventDelegateAfter, false, this);
		}

	}

	function _restoreKeyboardHandler(oControl) {

		oControl.removeDelegate(oContentEventDelegateBefore);
		oControl.removeDelegate(oContentEventDelegateAfter);

	}

	function _modifyFieldGroupHandler(oControl, bEnableResore) {

		if (bEnableResore) {
			oControl._OriginalGetFieldGroupIds = oControl._getFieldGroupIds;
			oControl._OriginalTriggerValidateFieldGroup = oControl.triggerValidateFieldGroup;
		}

		oControl._getFieldGroupIds = function() {
			var aFieldGroupIds = this.getFieldGroupIds();
			var oParent = this.getParent();

			if (oParent) { // if in destruction, parent might be removed
				// always add IDs of Field or FilterField (as Unit Field has internal FieldGroup
				aFieldGroupIds = aFieldGroupIds.concat(oParent._getFieldGroupIds());
			}

			return aFieldGroupIds;
		};

		oControl.triggerValidateFieldGroup = function (aFieldGroupIds) {
			// fire event on Field or FilterField, not on internal control but remove internal FieldGroup
			var oParent = this.getParent();
			if (oParent) { // if in destruction, parent might be removed
				var iIndex = aFieldGroupIds.indexOf(oParent.getId());
				if (iIndex > -1) { //own FieldGroup left
					// handle internal FieldGroup
					_validateFieldGroup.call(oParent, aFieldGroupIds);
				} else {
					// fire event directly
					oParent.fireValidateFieldGroup({
						fieldGroupIds : aFieldGroupIds
					});
				}
			}
		};

	}

	function _restoreFieldGroupHandler(oControl) {

		if (oControl._OriginalGetFieldGroupIds && oControl._OriginalTriggerValidateFieldGroup) {
			oControl._getFieldGroupIds = oControl._OriginalGetFieldGroupIds;
			delete oControl._OriginalGetFieldGroupIds;
			oControl.triggerValidateFieldGroup = oControl._OriginalTriggerValidateFieldGroup;
			delete oControl._OriginalTriggerValidateFieldGroup;
		}

	}

	function _createDefaultFieldHelp(sType) {

		this.setProperty("_fieldHelpEnabled", true, true);
		this._sDefaultFieldHelp = mDefaultHelps[sType].id;

		var oValueHelp = mDefaultHelps[sType].control;

		if (oValueHelp && oValueHelp.bIsDestroyed) {
			// someone destroyed FieldHelp -> initialize
			mDefaultHelps[sType].control = undefined;
			oValueHelp = undefined;
		}

		if (!oValueHelp) {
			if (mDefaultHelps[sType].promise) {
				mDefaultHelps[sType].promise.then(_defaultFieldHelpUpdate.bind(this, mDefaultHelps[sType].id));
			} else {
				mDefaultHelps[sType].promise = loadModules(mDefaultHelps[sType].modules).catch(function(oError) {
					throw new Error("loadModules promise rejected in sap.ui.mdc.field.FieldBase:_createDefaultFieldHelp function call - could not load controls " + JSON.stringify(mDefaultHelps[sType].modules));
				}).then(function(aModules) {
					var ValueHelp = aModules[0];
					var Container = aModules[1];
					var Content = aModules[2];
					var oDelegate = this.bDelegateInitialized && this.getControlDelegate()[mDefaultHelps[sType].getDelegate]();
					oValueHelp = new ValueHelp(mDefaultHelps[sType].id, {
						delegate: oDelegate
					});
					var oContainer = new Container(mDefaultHelps[sType].id + "-container", {
						content: [new Content(mDefaultHelps[sType].id + "-content", mDefaultHelps[sType].contentProperties)]
					});
					oValueHelp._bIsDefaultHelp = true;
					oValueHelp._sDefaultHelpType = sType;
					mDefaultHelps[sType].control = oValueHelp;
					if (mDefaultHelps[sType].dialog) {
						oValueHelp.setDialog(oContainer);
					} else {
						oValueHelp.setTypeahead(oContainer);
					}
					//				this.addDependent(oValueHelp); // TODO: where to add to control tree
					oValueHelp.connect(this); // to forward dataType
					_defaultFieldHelpUpdate.call(this, mDefaultHelps[sType].id);
				}.bind(this)).unwrap();
			}
		} else {
			_defaultFieldHelpUpdate.call(this, mDefaultHelps[sType].id);
		}

		_setAriaAttributes.call(this, false);

	}

	function _defaultFieldHelpUpdate(sId) {

		_fieldHelpChanged.call(this, sId, "insert");

	}

	function _useDefaultFieldHelp(oContentType, aOperators, sEditMode, iMaxConditions) {

		var oUseDefaultFieldHelp = oContentType.getUseDefaultFieldHelp();
		if (oUseDefaultFieldHelp && !this.getFieldHelp() && sEditMode !== EditMode.Display) {
			if ((iMaxConditions === 1 && oUseDefaultFieldHelp.single) || (iMaxConditions !== 1 && oUseDefaultFieldHelp.multi)) {
				if (aOperators.length === 1) {
					var bIsSingleValue = _isOnlyOneSingleValue.call(this, aOperators); // if operator not exists unse no field help
					// not if operator is handled by special control (like DatePicker)
					if (iMaxConditions === 1) {
						if (!(oContentType.getEditOperator() && oContentType.getEditOperator()[aOperators[0]]) &&
								(oUseDefaultFieldHelp.oneOperatorSingle || !bIsSingleValue)) {
							// "bool" case (always default field help) or operator needs more than one value (e.g. between)
							return true;
						}
					} else if (oUseDefaultFieldHelp.oneOperatorMulti || !bIsSingleValue) {
						// DatePicker case - in multi-value use default help to get DatePicker controls
						return true;
					}
				} else {
					// multiple operators -> default help needed
					return true;
				}
			}
		}

		return false;

	}

	function _isOnlyOneSingleValue(aOperators) {

		if (aOperators.length === 1) {
			var oOperator = FilterOperatorUtil.getOperator(aOperators[0]);
			return !oOperator || oOperator.isSingleValue();
		} else {
			return false;
		}

	}

	function _handleParseError(oEvent) {

		// as change event if inner control is fired even Input is wrong, check parse exception from binding
		this._bParseError = true;
		this._sFilterValue = "";

	}

	function _handleValidationError(oEvent) {

		// as change event if inner control is fired even Input is wrong, check validation exception from binding
		this._bParseError = true;
		this._sFilterValue = "";

		// try to find the corresponding async. change and reject it
		var vValue = oEvent.getParameter("newValue");
		var bFound = false;
		var i = 0;
		for (i = 0; i < this._aAsyncChanges.length; i++) {
			var oChange = this._aAsyncChanges[i];
			if (oChange.waitForUpdate && Array.isArray(oChange.result)) {
				if (oChange.result.length === 0 && vValue === "") {
					// for empty string no condition is created
					oChange.reject(oEvent.getParameter("exception"));
					bFound = true;
				} else {
					for (var j = 0; j < oChange.result.length; j++) {
						var oCondition = oChange.result[j];
						if (deepEqual(oCondition.values[0], vValue) || (oCondition.operator === "BT" && deepEqual(oCondition.values[1], vValue))) {
							oChange.reject(oEvent.getParameter("exception"));
							bFound = true;
							break;
						}
					}
				}
				if (bFound) {
					break;
				}
			}
		}
		if (bFound) {
			this._aAsyncChanges.splice(i, 1);
		}

	}

	function _handleValidationSuccess(oEvent) {

		this._bParseError = false; // if last valif value is entered again no condition is updated

	}

	function _handleContentChange(oEvent) {

		var oChangeEvent = { parameters: merge({}, oEvent.getParameters()), source: oEvent.getSource() };
		var iLength = this._aAsyncChanges.length;

		if (iLength > 0 && !this._aAsyncChanges[iLength - 1].changeFired) {
			// as change event in Input is directly fired after setValue this must be the change event corresponding to the last async change.
			// as there might be a sync change after it, do not handle it twice.
			this._aAsyncChanges[iLength - 1].changeFired = true;
			this._aAsyncChanges[iLength - 1].changeEvent = oChangeEvent;
			_triggerChange.call(this, undefined, undefined, undefined, this._aAsyncChanges[iLength - 1].promise);
			return;
		}

		var oChange = { changeEvent: oChangeEvent };

		_performContentChange.call(this, oChange);

	}

	function _performContentChange(oChange) {

		var aConditions = this.getConditions();
		var vValue;
		var bValid = true;
		var vWrongValue;
		var oCondition;
		var oSource = oChange.changeEvent.source;
		var bAsync = false;
		var bChanged = true; // normally only called on real change. But in SearchField called on every ENTER
		var bChangeIfNotChanged = false; // in SearchField case fire change even if value not changed. TODO: other event for this

		if (oChange.changeEvent.parameters.hasOwnProperty("valid")) {
			bValid = oChange.changeEvent.parameters["valid"];
			if (!bValid && oChange.changeEvent.parameters.hasOwnProperty("value")) {
				vWrongValue = oChange.changeEvent.parameters["value"];
			}
		}

		// use parsed value of the condition, if possible
		var bUpdateConditions = false;
		var sBoundProperty = this._oContentFactory.getBoundProperty();
		var oBinding = sBoundProperty && oSource.getBinding(sBoundProperty);
		if (oBinding && oBinding.getBindingMode() !== BindingMode.OneWay && oBinding.getPath() === "/conditions" && bValid) {
			oCondition = aConditions[0];
			vValue = aConditions[0] && aConditions[0].values[0];
		} else if (oChange.changeEvent.parameters.hasOwnProperty("value")) {
			vValue = oChange.changeEvent.parameters["value"];
			if (bValid) {
				bUpdateConditions = true;
			}
		} else {
			oCondition = aConditions[0];
			vValue = aConditions[0] && aConditions[0].values[0];
		}

		if (bUpdateConditions) {
			// text typed in MultiInput
			this._removeUIMessage();
			var oConditionType;
			var oMyChange;

			if (this._bIgnoreInputValue) {
				// remove filter value from input and don't use it as input
				this._bIgnoreInputValue = false;
				oSource.setDOMValue("");
				if (oSource.getMetadata().hasProperty("value")) {
					// clear "value" property of MultiInput as there might be an old value from a invalid input before
					oSource.setValue();
				}
				return;
			}

			oCondition = SyncPromise.resolve().then(function() {
				var iMaxConditions = this.getMaxConditions();

				if (this._oNavigateCondition) {
					// text entered via navigation -> use this data, no parsing is needed
					bValid = true;
					return this._oNavigateCondition;
				} else if (vValue === "" && iMaxConditions !== 1) {
					// in multivalue case an empty input don't changes the conditions and must not be validated with the data type
					// this happens after an invalid input was just cleared
					return null;
				} else {
					oConditionType = this._oContentFactory.getConditionType();
					var vResult = oConditionType.parseValue(vValue);
					var iLength = this._aAsyncChanges.length;

					if (iLength > 0 && !this._aAsyncChanges[iLength - 1].changeFired) {
						oMyChange = this._aAsyncChanges[iLength - 1];
						oMyChange.changeFired = true;
						oMyChange.changeEvent = oChange.changeEvent;
						_triggerChange.call(this, undefined, undefined, undefined, oMyChange.promise);
					}
					return vResult;
				}
			}.bind(this)).then(function(oCondition) {
				bChanged = _updateConditionsFromChange.call(this, oCondition, aConditions, oConditionType, bValid, vValue, oSource, oMyChange || oChange);
				bChanged = bChanged || bChangeIfNotChanged; // in SearchField fire change if value not changed
				return oCondition;
			}.bind(this)).catch(function(oException) {
				if (oException && !(oException instanceof ParseException) && !(oException instanceof FormatException) && !(oException instanceof ValidateException)) {// FormatException could also occur
					// unknown error -> just raise it
					throw oException;
				}
				bValid = false;
				vWrongValue = vValue;
				this._bParseError = true;
				this._sFilterValue = "";
				_setUIMessage.call(this, oException.message);

				if (oMyChange && oMyChange.reject) {
					if (_removeAsyncChange.call(this, oMyChange)) { // only if still valid (might be alredy rejected)
						oMyChange.reject(oException);
					}
				} else if (bAsync) {
					_triggerChange.call(this, aConditions, bValid, vWrongValue);
				}
			}.bind(this)).unwrap();

			if (oCondition instanceof Promise) {
				// will be parsed async
				bAsync = true;
			}
		} else if (!oChange.changeEvent.parameters.hasOwnProperty("valid") && this._bParseError) {
			// this might be result of a value that cannot be parsed
			vWrongValue = oChange.changeEvent.parameters["value"];
			bValid = false;
		}

		var oFieldHelp = _getFieldHelp.call(this);
		if (oFieldHelp && this._bConnected) {
			if (sap.ui.getCore().getCurrentFocusedControlId() === oSource.getId()) {
				oFieldHelp.close(); // if focus is not in field, Field help closes automatically
			}
			this._sFilterValue = "";
			if (!bAsync && bValid) {
				_setConditionsOnFieldHelp.call(this, aConditions, oFieldHelp);
				oFieldHelp.onControlChange();
			}
			// do not trigger async suggestion
			_clearLiveChangeTimer.call(this);
		}

		if (this._oNavigateCondition) {
			this._oNavigateCondition = undefined; // navigation now finished
			this._oContentFactory.updateConditionType();
		}

		if (oChange.resolve) {
			// async promise needs to be resolved
			_resolveAsyncChange.call(this, oChange);
		} else if (!bAsync && bChanged) {
			_triggerChange.call(this, aConditions, bValid, vWrongValue);
		}

	}

	function _updateConditionsFromChange(oCondition, aConditions, oConditionType, bValid, vValue, oSource, oChange) {

		var iMaxConditions = this.getMaxConditions();
		var bChanged = false;

		if (oCondition === null && iMaxConditions !== 1) {
			// in multi value case no new condition means no condition-change
			// but fire change event as before a change event with invalid value was fired
			return true;
		}

		if (oConditionType) {
			// in navigation no validation needed
			oConditionType.validateValue(oCondition);
		}

		if (bValid) {
			if (oCondition) {
				if (this._oContentFactory.isMeasure() && aConditions.length === 1 && aConditions[0].values[0][0] === undefined) {
					// remove empty condition
					aConditions = [];
				}
				if (iMaxConditions !== 1 && FilterOperatorUtil.indexOfCondition(oCondition, aConditions) >= 0) {
					// condition already exist (only error if tokens, in SearchField it is OK)
					throw new ParseException(this._oResourceBundle.getText("field.CONDITION_ALREADY_EXIST", [vValue]));
				} else {
					if (iMaxConditions > 0 && iMaxConditions <= aConditions.length) {
						// remove first conditions to meet maxConditions
						aConditions.splice(0, aConditions.length - iMaxConditions + 1);
					}
					aConditions.push(oCondition);
				}
			} else if (iMaxConditions === 1) {
				aConditions = [];
			}

			if (!deepEqual(aConditions, this.getConditions())) {
				this.setProperty("conditions", aConditions, true); // do not invalidate whole field
				bChanged = true;
			}

			if (iMaxConditions !== 1) {
				oSource.setValue(""); // remove typed value of MultiInput
			}

		}

		if (oChange.resolve) {
			var oFieldHelp = _getFieldHelp.call(this);
			if (oFieldHelp && this._bConnected) {
				_setConditionsOnFieldHelp.call(this, aConditions, oFieldHelp);
				oFieldHelp.onControlChange();
			}
			oChange.result = aConditions;
			_resolveAsyncChange.call(this, oChange);
			_removeAsyncChange.call(this, oChange);
		}

		return bChanged;

	}

	function _handleContentLiveChange(oEvent) {

		var vValue;
		var vPreviousValue;
		var bEscPressed = false;
		var oSource = oEvent.getSource();

		this._oNavigateCondition = undefined; // navigation item is not longer valid
		this._oContentFactory.updateConditionType();

		if ("value" in oEvent.getParameters()) {
			vValue = oEvent.getParameter("value");
		} else if ("newValue" in oEvent.getParameters()) {
			// SearchField
			vValue = oEvent.getParameter("newValue");
		}

		if ("escPressed" in oEvent.getParameters()) {
			bEscPressed = oEvent.getParameter("escPressed");
		}

		if ("previousValue" in oEvent.getParameters()) {
			vPreviousValue = oEvent.getParameter("previousValue");
		} else {
			var aConditions = this.getConditions();
			vPreviousValue = aConditions[0] && aConditions[0].values[0];
		}

		var oFieldHelp = _getFieldHelp.call(this);

		if (oFieldHelp && (!this._oContentFactory.isMeasure() || oSource.getShowValueHelp())) {
			if (bEscPressed) {
				// close FieldHelp if escape pressed and not repoen it for last typed characters
				if (oFieldHelp.isOpen(true)) {
					oFieldHelp.close();
					_setConditionsOnFieldHelp.call(this, this.getConditions(), oFieldHelp); // reset conditions
					_clearLiveChangeTimer.call(this);
					this._sFilterValue = "";
				}
			} else {
				var aOperators = this._getOperators(); // show suggestion only if equal operators are supported
				var bUseFieldHelp = false;

				// check if at least one operator supports field help
				// TODO: let field help decide what operator to use
				for (var i = 0; i < aOperators.length; i++) {
					var oOperator = FilterOperatorUtil.getOperator(aOperators[i]);
					if (oOperator.validateInput) {
						bUseFieldHelp = true;
						break;
					}
				}

				if (bUseFieldHelp) {
					this._bIgnoreInputValue = false; // after typing the input value is the current one and should be used
					this._vLiveChangeValue = vValue;
					if (!this._fnLiveChangeTimer) {
						this._fnLiveChangeTimer = debounce(function() {
							var sDisplay = this.getDisplay();
							// remove "(", ")" from serach string
							// TODO: better solution to search in this case?
							this._sFilterValue = "";
							if (this._vLiveChangeValue) {
								// use EQ operator
								var oOperator = FilterOperatorUtil.getEQOperator();
								var aParts = oOperator.getValues(this._vLiveChangeValue, sDisplay, true);
								if (aParts[0]) {
									this._sFilterValue = aParts[0];
									if (aParts[1]) {
										this._sFilterValue = this._sFilterValue + " ";
									}
								}
								if (aParts[1]) {
									this._sFilterValue = this._sFilterValue + aParts[1];
								}
							}

							var vOpenByTyping = this.hasOwnProperty("_bOpenByTyping") ? this._bOpenByTyping : oFieldHelp.isTypeaheadSupported();
							if (this._bConnected && this._getContent()[0] && vOpenByTyping /*&& !(vOpenByTyping instanceof Promise)*/ && //TODO: isTypeaheadsupported always returns a promise now
								(sap.ui.getCore().getCurrentFocusedControlId() === this._getContent()[0].getId() ||
									(this._getContent()[1] && sap.ui.getCore().getCurrentFocusedControlId() === this._getContent()[1].getId()))) { // only if still connected and focussed
								oFieldHelp.setFilterValue(this._sFilterValue);
								if (this.getMaxConditionsForHelp() === 1 && oFieldHelp.getConditions().length > 0) {
									// While single-suggestion no item is selected
									oFieldHelp.setConditions([]);
								}
								oFieldHelp.open(true);
								_setAriaAttributes.call(this, true);
								delete this._vLiveChangeValue;
							}
						}.bind(this), 300, { leading: false, trailing: true });

						// on first call init FieldHelp (trigger loading metadata on first typing)
						oFieldHelp.initBeforeOpen(true);
					}
					var vOpenByTyping = oFieldHelp.isTypeaheadSupported(); // trigger determination of search functionality
					if (vOpenByTyping instanceof Promise) {
						vOpenByTyping.then(function(bOpenByTyping) {
							// trigger open after Promise resolved
							var oFocusedElement = document.activeElement;
							if (oFocusedElement && (containsOrEquals(this.getDomRef(), oFocusedElement)) && this._fnLiveChangeTimer) { // if destroyed this._fnLiveChangeTimer is removed
								this._fnLiveChangeTimer(); // if resolved while initial debounce-time frame, it will not triggered twice
							}
							this._bOpenByTyping = bOpenByTyping;
						}.bind(this));
					}
					this._fnLiveChangeTimer();
				}
			}
		}

		this.fireLiveChange({ value: vValue, escPressed: bEscPressed, previousValue: vPreviousValue });

	}

	function _clearLiveChangeTimer() {

		if (this._fnLiveChangeTimer) {
			// do not trigger async suggestion
			this._fnLiveChangeTimer.cancel();
			delete this._vLiveChangeValue;
		}

	}

	function _handleContentPress(oEvent) {

		var oFieldInfo = this.getFieldInfo();
		if (oFieldInfo) {
			oFieldInfo.getTriggerHref().then(function(sHref) {
				if (!sHref) {
					oFieldInfo.open(this._getContent()[0]);
					_setAriaAttributes.call(this, true);
				}
			}.bind(this));
		}

		this.firePress();

	}

	function _handleTokenUpdate(oEvent) {

		if (oEvent.getParameter("type") === "removed") {
			var aRemovedTokens = oEvent.getParameter("removedTokens");
			var aConditions = this.getConditions();
			var sUnit;
			var i;

			for (i = 0; i < aRemovedTokens.length; i++) {
				var oRemovedToken = aRemovedTokens[i];
				var sPath = oRemovedToken.getBindingContext("$field").sPath;
				var iIndex = parseInt(sPath.slice(sPath.lastIndexOf("/") + 1));
				aConditions[iIndex].delete = true;
			}

			for (i = aConditions.length - 1; i >= 0; i--) {
				if (aConditions[i].delete) {
					if (this._oContentFactory.isMeasure()) {
						sUnit = aConditions[i].values[0][1];
					}
					aConditions.splice(i, 1);
				}
			}

			if (this._oContentFactory.isMeasure() && sUnit && aConditions.length === 0) {
				// create dummy condition for unit
				aConditions = [Condition.createItemCondition([undefined, sUnit], undefined)];
			}

			this.setProperty("conditions", aConditions, true); // do not invalidate whole field
			_executeChange.call(this, aConditions, true); // removing Token don't need to wait for processing both fields in unit case
			oEvent.preventDefault(true);
		}

	}

	function _fieldHelpChanged(sId, sMutation) {

		if (sMutation === "remove") {
			var oFieldHelp = sap.ui.getCore().byId(sId);
			if (oFieldHelp) {
				oFieldHelp.detachEvent("select", _handleFieldHelpSelect, this);
				oFieldHelp.detachEvent("navigated", _handleFieldHelpNavigated, this);
				oFieldHelp.detachEvent("dataUpdate", _handleHelpDataUpdate, this);
				oFieldHelp.detachEvent("disconnect", _handleDisconnect, this);
				oFieldHelp.detachEvent("afterClose", _handleFieldHelpAfterClose, this);
				oFieldHelp.detachEvent("switchToValueHelp", _handleFieldSwitchToValueHelp, this);
			}
			this.setProperty("_fieldHelpEnabled", false, true);
			this._bConnected = false;
		} else if (sMutation === "insert") {
			_checkFieldHelpExist.call(this, sId);
		}

		// update icon
		var oControl = this._getContent()[0];
		if (oControl && oControl.setValueHelpIconSrc) {
			oControl.setValueHelpIconSrc(this._getFieldHelpIcon());
		}
		_handleConditionsChange.call(this, this.getConditions()); // to update descriptions

	}

	function _checkFieldHelpExist(sId) {

		if (sId && !this.getProperty("_fieldHelpEnabled")) {
			var oFieldHelp = sap.ui.getCore().byId(sId);
			if (oFieldHelp) {
				oFieldHelp.attachEvent("dataUpdate", _handleHelpDataUpdate, this);
				if (!oFieldHelp.valueHelpEnabled || oFieldHelp.valueHelpEnabled()) { //TODO: remove check for existence of function
					this.setProperty("_fieldHelpEnabled", true, true);
				}
			}
		}

	}

	function _getFieldHelp() {

		var sId = this.getFieldHelp();
		var oFieldHelp;

		if (!sId && this._sDefaultFieldHelp) {
			sId = this._sDefaultFieldHelp;
		}

		if (sId) {
			oFieldHelp = sap.ui.getCore().byId(sId);
		}

		return oFieldHelp;

	}

	function _setConditionsOnFieldHelp(aConditions, oFieldHelp) {

		if (!oFieldHelp) {
			oFieldHelp = _getFieldHelp.call(this);
		}

		if (this._oContentFactory.isMeasure()) {
			// for unit or curreny add only the unit/currency to FieldHelp
			var aHelpConditions = [];
			for (var i = 0; i < aConditions.length; i++) {
				var oCondition = aConditions[i];
				if (oCondition.values[0] && oCondition.values[0][1]) {
					var oHelpCondition = Condition.createItemCondition(oCondition.values[0][1], undefined, oCondition.inParameters, oCondition.outParameters);
					aHelpConditions.push(oHelpCondition);
				}
			}
			oFieldHelp.setConditions(aHelpConditions);
		} else {
			oFieldHelp.setConditions(aConditions);
		}

	}

	function _handleValueHelpRequest(oEvent) {

		var oFieldHelp = _getFieldHelp.call(this);

		if (oFieldHelp) {
			oFieldHelp.setFilterValue(this._sFilterValue); // use types value for filtering, even if reopening FieldHelp
			var aConditions = this.getConditions();
			_setConditionsOnFieldHelp.call(this, aConditions, oFieldHelp);
			oFieldHelp.toggleOpen(false);
			_setAriaAttributes.call(this, true); // if closed it will be set again on afterclose
			if (!oFieldHelp.isFocusInHelp()) {
				// need to reset bValueHelpRequested in Input, otherwise on focusout no change event and navigation don't work
				var oContent = oEvent.getSource();
				if (oContent.bValueHelpRequested) {
					oContent.bValueHelpRequested = false; // TODO: need API
				}
			}
		}

	}

	function _handleFieldHelpSelect(oEvent) {

		var aConditions = this.getConditions();
		var aNewConditions = oEvent.getParameter("conditions");
		var bAdd = oEvent.getParameter("add");
		var bClose = oEvent.getParameter("close");
		var oFieldHelp = oEvent.oSource;
		var iMaxConditions = this.getMaxConditions();
		var oCondition;
		var oContent = this.getControlForSuggestion();
		var sDOMValue;
		var i = 0;

		if (this._oContentFactory.isMeasure()) {
			if (aNewConditions.length > 1) {
				throw new Error("Only one item must be selected! " + this);
			}
			if (aNewConditions[0].operator !== "EQ") {
				throw new Error("Only EQ allowed! " + this);
			}

			if (aConditions.length > 0) {
				// TODO: update all conditions?
				for (i = 0; i < aConditions.length; i++) {
					aConditions[i].values[0][1] = aNewConditions[0].values[0];
					if (aConditions[i].operator === "BT") {
						aConditions[i].values[1][1] = aNewConditions[0].values[0];
					}
					if (aNewConditions[0].inParameters) {
						aConditions[i].inParameters = aNewConditions[0].inParameters;
					}
					if (aNewConditions[0].outParameters) {
						aConditions[i].outParameters = aNewConditions[0].outParameters;
					}
					if (aNewConditions[0].payload) {
						aConditions[i].payload = aNewConditions[0].payload;
					}
				}
			} else {
				var oOperator = FilterOperatorUtil.getEQOperator(this._getOperators());
				var aValue = this.getControlDelegate().enhanceValueForUnit(this.getPayload(), [null, aNewConditions[0].values[0]], this._oTypeInitialization); // Delegate must be initialized right now
				oCondition = Condition.createCondition(oOperator.name, [aValue], aNewConditions[0].inParameters, aNewConditions[0].outParameters, ConditionValidated.NotValidated);
				aConditions.push(oCondition);
				var oConditionType = this._oContentFactory.getConditionType(true);
				var oConditionsType = this._oContentFactory.getUnitConditionsType(true);
				// TODO: format once to update current value in type (as empty condtions are not displayed as token)
				if (oConditionType) {
					sDOMValue = oConditionType.formatValue(oCondition);
				} else if (oConditionsType) {
					sDOMValue = oConditionsType.formatValue(aConditions);
				}
			}
		} else {
			if (!bAdd) {
				aConditions = []; // remove all existing conditions
			}

			for (i = 0; i < aNewConditions.length; i++) {
				oCondition = aNewConditions[i];
				if (!_isValidOperator.call(this, oCondition.operator)) {
					continue;
				}

				// take what ever comes from field help as valid - even if it is an empty key
				var iIndex = FilterOperatorUtil.indexOfCondition(oCondition, aConditions); // check if already exist
				if (iIndex === -1) { // new -> add
					aConditions.push(oCondition);
				} else if (oCondition.validated === ConditionValidated.Validated && oCondition.values.length > 1 && (aConditions[iIndex].values.length === 1 || oCondition.values[1] !== aConditions[iIndex].values[1])) {
					// description changed -> use the current description
					aConditions[iIndex].values = oCondition.values;
				}
			}
		}

		if (iMaxConditions > 0 && iMaxConditions < aConditions.length) {
			// remove first conditions to meet maxConditions
			aConditions.splice(0, aConditions.length - iMaxConditions);
		}

		var bChangeAfterError = false;
		if (oContent && oContent.setDOMValue) {
			if (this.getMaxConditionsForHelp() === 1 && aConditions.length > 0) {
				// the focus is still in the Field. The update of the inner control is done via ManagedObjectModel binding.
				// The inner Input is configured to prefer user input in this case.
				// so we need to set the DOM value here. Otherwise it is not updated or, if empty, selected.
				if (this._oContentFactory.isMeasure() && this._oContentFactory.getUnitConditionsType()) {
					sDOMValue = this._oContentFactory.getUnitConditionsType().formatValue(aConditions);
				} else if (this._oContentFactory.getConditionType(true)) {
					sDOMValue = this._oContentFactory.getConditionType().formatValue(aConditions[0]);
				} else if (this._oContentFactory.getConditionsType(true)) {
					sDOMValue = this._oContentFactory.getConditionsType().formatValue(aConditions);
				}

				if (sDOMValue instanceof Promise) {
					// text is determined async
					sDOMValue.then(function(sText) {
						oContent.setDOMValue(""); // to overwrite it even if the text is the same -> otherwise cursor position could be wrong
						oContent.setDOMValue(sText);
					});
				} else {
					oContent.setDOMValue(""); // to overwrite it even if the text is the same -> otherwise cursor position could be wrong
					oContent.setDOMValue(sDOMValue);
				}
				this._sFilterValue = "";
			} else if (bClose) {
				if (this.getMaxConditions() !== 1 && !this._oContentFactory.getBoundProperty() && oContent.getMetadata().hasProperty("value") && oContent.getProperty("value")) {
					// clear "value" property of MultiInput as there might be an old value from a invalid input before
					oContent.setValue();
				}
				oContent.setDOMValue("");
				this._sFilterValue = "";
				this._bIgnoreInputValue = false; // just clean up
			} else {
				this._bIgnoreInputValue = true; // after something is selected, the value just stays for filtering -> don't use to create token
			}

			// after selection input cannot be wrong
			if (this._bParseError) { // only remove messages set by Field itself, message from outside should stay.
				this._bParseError = false;
				this._removeUIMessage();
				bChangeAfterError = true;
			}
		}

		var aConditionsOld = this.getConditions();

		if (!deepEqual(aConditions, aConditionsOld)) {
			this._oNavigateCondition = undefined;
			this._oContentFactory.updateConditionType();

			this.setProperty("conditions", aConditions, true); // do not invalidate whole field

			if (!FilterOperatorUtil.compareConditionsArray(aConditions, aConditionsOld)) { // update only if real change
				// handle out-parameters
				oFieldHelp.onControlChange();
				_triggerChange.call(this, aConditions, true);
			}
		} else if (bChangeAfterError) { // last valif value choosen again
			_triggerChange.call(this, aConditions, true);
		}
	}

	function _handleFieldHelpNavigated(oEvent) {

		var sValue = oEvent.getParameter("value");
		var vKey = oEvent.getParameter("key");
		var oCondition = oEvent.getParameter("condition");
		var sItemId = oEvent.getParameter("itemId");
		var bLeaveFocus = oEvent.getParameter("leaveFocus");

		if (!oCondition && vKey) {
			oCondition = Condition.createItemCondition(vKey, sValue);
		}

		var sNewValue;
		var sDOMValue;
		var oContent = this.getControlForSuggestion();
		var oOperator = FilterOperatorUtil.getEQOperator(this._getOperators()); /// use EQ operator of Field (might be different one)
		var oFieldHelp = _getFieldHelp.call(this);

		if (bLeaveFocus) {
			// nothing to navigate, just set focus visualization back to field
			oContent.addStyleClass("sapMFocus");
			oContent.focus();
			oFieldHelp.removeFocus();
			return;
		}

		if (oCondition) {
			this._oNavigateCondition = merge({}, oCondition); // to keep In- and OutParameters
			this._oNavigateCondition.operator = oOperator.name;
			vKey = oCondition.values[0];
			sValue = oCondition.values[1];
		} else {
			this._oNavigateCondition = Condition.createCondition(oOperator.name, [vKey, sValue],undefined, undefined, ConditionValidated.Validated);
		}

		if (this._oContentFactory.isMeasure()) {
			var aConditions = this.getConditions();
			// use number of first condition. In Multicase all conditions must be updated in change event
			if (aConditions.length > 0) {
				this._oNavigateCondition.operator = aConditions[0].operator;
				this._oNavigateCondition.values[0] = [aConditions[0].values[0][0], vKey];
				if (aConditions[0].operator === "BT") {
					this._oNavigateCondition.values[1] = [aConditions[0].values[1][0], this._oNavigateCondition.values[0][1]];
				} else if (this._oNavigateCondition.values.length > 1) {
					this._oNavigateCondition.values.splice(1);
				}
			} else {
				this._oNavigateCondition.values = [this.getControlDelegate().enhanceValueForUnit(this.getPayload(), [null, vKey], this._oTypeInitialization)]; // Delegate must be initialized right now
			}
		}

		this._bPreventGetDescription = true; // if no description in navigated condition, no description exist. Don't try to read one
		this._oContentFactory.updateConditionType();

		// take what ever comes from field help as valid - even if it is an empty key
		// TODO: what if field is required?

		if (this.getDisplay() !== FieldDisplay.Value) {
			// value is used as key
			sNewValue = vKey;
		} else if (sValue) {
			sNewValue = sValue;
		} else {
			sNewValue = vKey;
		}

		if (oContent && oContent.setDOMValue) {
			if (!sDOMValue) {
				if (this._oContentFactory.isMeasure() && this._oContentFactory.getUnitConditionsType() && this._oNavigateCondition) {
					sDOMValue = this._oContentFactory.getUnitConditionsType().formatValue([this._oNavigateCondition]);
				} else if (this._oContentFactory.getConditionType(true) && this._oNavigateCondition) {
					sDOMValue = this._oContentFactory.getConditionType().formatValue(this._oNavigateCondition);
				} else if (this._oContentFactory.getConditionsType(true) && this._oNavigateCondition) {
					sDOMValue = this._oContentFactory.getConditionsType().formatValue([this._oNavigateCondition]);
				} else {
					sDOMValue = sValue || vKey;
				}
			}
			oContent.setDOMValue(sDOMValue);
			oContent._doSelect();
			if (oFieldHelp.isOpen()) {
				oContent.removeStyleClass("sapMFocus"); // to have focus outline on navigated item only
			}
		}

		this._bPreventGetDescription = false; // back to default
		this._oContentFactory.updateConditionType();

		_setAriaAttributes.call(this, true, sItemId);

		this._bIgnoreInputValue = false; // use value for input
		this.fireLiveChange({ value: sNewValue });

	}

	function _handleFieldHelpAfterClose(oEvent) {

		if (this._bIgnoreInputValue) {
			// remove filter value from input and don't use it as input
			var oContent = this.getControlForSuggestion();
			this._bIgnoreInputValue = false;
			oContent.setDOMValue("");
			this._sFilterValue = "";
			if (this.getMaxConditions() !== 1 && !this._oContentFactory.getBoundProperty() && oContent.getMetadata().hasProperty("value") && oContent.getProperty("value")) {
				// clear "value" property of MultiInput as there might be an old value from a invalid input before
				oContent.setValue();
			}
		}

		_setAriaAttributes.call(this, false);

		// sync conditions with FieldHelp as we cannot e sure that it still is in sync
		var oFieldHelp = oEvent.getSource();
		var aConditions = this.getConditions();
		_setConditionsOnFieldHelp.call(this, aConditions, oFieldHelp);

	}

	function _handleFieldSwitchToValueHelp(oEvent) {

		var oContent = this.getControlForSuggestion();
		oContent.focus(); // move focus back to Field before opening valueHelp
		if (oContent.fireValueHelpRequest) {
			// fake valueHelp icon pressed
			oContent.bValueHelpRequested = true; // to prevent change event
			oContent.fireValueHelpRequest();
		}

	}

	function _handleHelpDataUpdate(oEvent) {

		var isEditing = this.getEditMode() === EditMode.Editable && this._getContent().length > 0 &&
			sap.ui.getCore().getCurrentFocusedControlId() === this._getContent()[0].getId();

		//		// also in display mode to get right text
		//		_handleConditionsChange.call(this, this.getConditions());
		if (!isEditing && !this._bPendingConditionUpdate && this.getConditions().length > 0 &&
			(this.getMaxConditions() !== 1 || (this.getDisplay() !== FieldDisplay.Value && !this._bParseError))
			&& this._oManagedObjectModel) {
			// update tokens in MultiValue
			// update text/value only if no parse error, otherwise wrong value would be removed
			// don't update if contidions are outdated (updated async in Field)
			this._oManagedObjectModel.checkUpdate(true);
		}

	}

	function _handleDisconnect(oEvent) {

		var oFieldHelp = _getFieldHelp.call(this);
		oFieldHelp.detachEvent("select", _handleFieldHelpSelect, this);
		oFieldHelp.detachEvent("navigated", _handleFieldHelpNavigated, this);
		oFieldHelp.detachEvent("disconnect", _handleDisconnect, this);
		oFieldHelp.detachEvent("afterClose", _handleFieldHelpAfterClose, this); // TODO: remove
		oFieldHelp.detachEvent("switchToValueHelp", _handleFieldSwitchToValueHelp, this);
		oFieldHelp.detachEvent("closed", _handleFieldHelpAfterClose, this);
		this._bConnected = false;

	}

	function _connectFieldhelp() {

		var oFieldHelp = _getFieldHelp.call(this);
		if (oFieldHelp && !this._bConnected) {
			var oConditionModelInfo = _getConditionModelInfo.call(this);
			var oType;
			var bIsMeasure = this._oContentFactory.isMeasure();

			if (bIsMeasure) {
				// for value help, use the basic type of the unit part, not the unit type. (As ony this part is tranfered, not the composite-array.)
				var aCompositeTypes = this._oContentFactory.getCompositeTypes();
				if (aCompositeTypes && aCompositeTypes.length > 1) { // if no type is defined the default (String) will be used
					oType = aCompositeTypes[1];
				}
			} else {
				oType = this._oContentFactory.getDataType(); // use data type of Field
			}
			var oConfig = { // TODO: only what is needed (also for DefineConditions and Tokenizer)
					maxConditions: this.getMaxConditions(), // TODO: in unit case only 1?
					dataType: oType,
					operators: this._getOperators(),
					display: bIsMeasure ? FieldDisplay.Value : this.getDisplay(),
					delegate: this.getControlDelegate(),
					delegateName: this.getDelegate() && this.getDelegate().name,
					payload: this.getPayload(),
					conditionModel: oConditionModelInfo.model,
					conditionModelName: oConditionModelInfo.name,
					defaultOperatorName: this.getDefaultOperator ? this.getDefaultOperator() : null
			};
			oFieldHelp.connect(this, oConfig);
			this._bConnected = true;
			oFieldHelp.attachEvent("select", _handleFieldHelpSelect, this);
			oFieldHelp.attachEvent("navigated", _handleFieldHelpNavigated, this);
			oFieldHelp.attachEvent("disconnect", _handleDisconnect, this);
			oFieldHelp.attachEvent("afterClose", _handleFieldHelpAfterClose, this); // TODO: remove
			oFieldHelp.attachEvent("switchToValueHelp", _handleFieldSwitchToValueHelp, this);
			oFieldHelp.attachEvent("closed", _handleFieldHelpAfterClose, this);
			var aConditions = this.getConditions();
			_setConditionsOnFieldHelp.call(this, aConditions, oFieldHelp);

			var oContent = this.getControlForSuggestion();
			_setFocusHandlingForFieldHelp.call(this, oContent);
			if (oFieldHelp._bIsDefaultHelp) {
				// use label as default title for FilterField
				mDefaultHelps[oFieldHelp._sDefaultHelpType].updateTitle(oFieldHelp, this.getLabel());
			}
		}

	}

	function _setFocusHandlingForFieldHelp(oContent) {

		if (oContent && !oContent.orgOnsapfocusleave && oContent.onsapfocusleave) {
			//TODO: find better solution
			oContent.orgOnsapfocusleave = oContent.onsapfocusleave;
			oContent.onsapfocusleave = function(oEvent) {
				var oFieldHelp = _getFieldHelp.call(this.getParent());

				if (oFieldHelp) {
					var oFocusedControl = sap.ui.getCore().byId(oEvent.relatedControlId);
					if (oFocusedControl) {
						if (containsOrEquals(oFieldHelp.getDomRef(), oFocusedControl.getFocusDomRef())) {
							oEvent.stopPropagation();
							return;
						} else {
							oFieldHelp.skipOpening();
						}
					}
				}
				this.orgOnsapfocusleave(oEvent);
			};
		}

	}

	FieldBase.prototype._getFieldHelpIcon = function() {

		var oFieldHelp = _getFieldHelp.call(this);

		if (oFieldHelp) {
			return oFieldHelp.getIcon();
		}

	};

	function _fieldInfoChanged(oFieldInfo, sMutation) {

		if (sMutation === "remove") {
			oFieldInfo.detachEvent("dataUpdate", _handleInfoDataUpdate, this);
		} else if (sMutation === "insert") {
			oFieldInfo.attachEvent("dataUpdate", _handleInfoDataUpdate, this);
			_handleInfoDataUpdate.call(this); // to set already existing values
		}

	}

	function _handleInfoDataUpdate() {

		var oFieldInfo = this.getFieldInfo();
		var that = this;
		oFieldInfo.isTriggerable().then(function(bTriggerable) {
			that._bTriggerable = bTriggerable;
			var aContent = that.getAggregation("_content", []);
			if (aContent.length > 0 && that.getEditMode() === EditMode.Display) {
				_createInternalContentWrapper.call(that);
				if (that._bTriggerable) {
					aContent = that.getAggregation("_content", []);
					var oLink = aContent[0];
					oFieldInfo.getDirectLinkHrefAndTarget().then(function(oLinkItem) {
						ContentFactory._updateLink(oLink, oLinkItem);
					});
				}
			}
		});
	}

	// TODO: better API?
	/**
	 * Provides some internals of the field to be used in the value help.
	 *
	 * @returns {object} formatOptions of the field
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldHelpBase
	 */
	FieldBase.prototype._getFormatOptions = function() {

		if (!this._asyncParsingCall) {
			this._asyncParsingCall = _asyncParsingCall.bind(this); //as variable to have the same function after each update of formatOptions. Otherwise it would be a change on FormatOption in ValueHelpPanel every time
		}

		var oConditionModelInfo = _getConditionModelInfo.call(this);

		return {
			valueType: this._oContentFactory.retrieveDataType(),
			originalDateType: this._oContentFactory.getDateOriginalType() || this._oContentFactory.getUnitOriginalType(),
			additionalType: this._oContentFactory.getUnitType(), // only set if unit or timezone
			compositeTypes: this._oContentFactory.getCompositeTypes(), // only set if CompositeType used
			display: this._oContentFactory.isMeasure() ? FieldDisplay.Value : this.getDisplay(),
			fieldHelpID: this._oContentFactory.isMeasure() ? undefined : this.getFieldHelp() || this._sDefaultFieldHelp,
			operators: this._getOperators(),
			hideOperator: this._oContentFactory.getHideOperator(),
			maxConditions: this.getMaxConditions(),
			bindingContext: this.getBindingContext(), // to dertmine text and key usding in/out-parameter using correct bindingContext (In Table FieldHelp might be connected to other row)
			asyncParsing: this._asyncParsingCall,
			navigateCondition: this._oNavigateCondition,
			delegate: this.getControlDelegate(),
			delegateName: this.getDelegate() && this.getDelegate().name,
			payload: this.getPayload(),
			preventGetDescription: this._bPreventGetDescription,
			conditionModel: oConditionModelInfo.model,
			conditionModelName: oConditionModelInfo.name,
			convertWhitespaces: this.getEditMode() === EditMode.Display || this.getMaxConditions() !== 1, // also replace whitespaces in tokens
			control: this,
			defaultOperatorName : this.getDefaultOperator ? this.getDefaultOperator() : null
		};

	};

	/**
	 * If the value is the initial value of the type (String types) and
	 * the field does not show tokens or operators, no condition
	 * must be set as the field is then empty.
	 *
	 * @param {any} vValue Value to be checked
	 * @returns {boolean} true if value is initial
	 * @private
	 * @ui5-restricted FieldBase subclasses
	 */
	FieldBase.prototype._checkValueInitial = function(vValue) {

		if (vValue === null || vValue === undefined) {
			return true;
		}

		if (vValue === "" || (typeof (vValue) === "string" && vValue.match(/^0+$/))) { // if String is dig-sequence, initial value contains only "0"s
			var oType = this._oContentFactory.retrieveDataType();
			var vResult = oType.parseValue("", "string");
			if (vResult === vValue) {
				return true; // it's initial value
			} else {
				try {
					oType.validateValue(vResult);
				} catch (oError) {
					// if type is not nullable, empty is invalid, so it is initial
					return true;
				}
			}
		} else {
			var sDataType = _getDataTypeName.call(this);
			if (this.getTypeUtil().getBaseType(sDataType) === BaseType.Unit
				&& Array.isArray(vValue) && vValue.length > 1 && (vValue[0] === undefined || vValue[0] === null) && !vValue[1]) { // as 0 is a valid number
				//no number and no unit -> initial
				return true;
			}
		}

		// TODO: other types?

		return false;

	};

	FieldBase.prototype._getUnitFormatOptions = function() {

		if (!this._asyncParsingCall) { //as variable to have the same function after each update of formatOptions. Otherwise it would be a change on FormatOption in ValueHelpPanel every time
			this._asyncParsingCall = _asyncParsingCall.bind(this);
		}

		var oConditionModelInfo = _getConditionModelInfo.call(this);

		return {
			valueType: this._oContentFactory.getUnitType(),
			originalDateType: this._oContentFactory.getDateOriginalType() || this._oContentFactory.getUnitOriginalType(),
			additionalType: this._oContentFactory.retrieveDataType(), // use type of measure for currentValue
			compositeTypes: this._oContentFactory.getCompositeTypes(),
			display: this.getDisplay(),
			fieldHelpID: this.getFieldHelp() || this._sDefaultFieldHelp,
			operators: ["EQ"],
			hideOperator: true, // TODO: no operator for units
			maxConditions: 1, // TODO: only one unit allowed
			bindingContext: this.getBindingContext(), // to dertmine text and key usding in/out-parameter using correct bindingContext (In Table FieldHelp might be connected to other row)
			asyncParsing: this._asyncParsingCall,
			navigateCondition: this._oNavigateCondition,
			delegate: this.getControlDelegate(),
			delegateName: this.getDelegate() && this.getDelegate().name,
			payload: this.getPayload(),
			preventGetDescription: this._bPreventGetDescription,
			conditionModel: oConditionModelInfo.model,
			conditionModelName : oConditionModelInfo.name,
			convertWhitespaces: this.getEditMode() === EditMode.Display || this.getEditMode() === EditMode.EditableDisplay,
			control: this,
			getConditions: this.getConditions.bind(this) // TODO: better solution to update unit in all conditions
		};

	};

	function _asyncParsingCall(oPromise) {

		// close FieldHelp to prevent action on it during parsing (only if still focused, otherwise let autoclose do its work)
		var oFieldHelp = _getFieldHelp.call(this);
		if (oFieldHelp && oFieldHelp.isOpen()) {
			var oFocusedElement = document.activeElement;
			if (oFocusedElement
				&& (containsOrEquals(this.getDomRef(), oFocusedElement) || containsOrEquals(oFieldHelp.getDomRef(), oFocusedElement))) {
				oFieldHelp.close();
			}
		}

		// as async parsing can be called again while one is still running we have to map the promises to resolve the right one.
		var oChange = {};
		var oMyPromise = new Promise(function(fResolve, fReject) {
			oChange.resolve = fResolve;
			oChange.reject = fReject;

			oPromise.then(function(vResult) {// vResult can be a condition or an array of conditions
				oChange.result = vResult;
				this._bParseError = false;
				var aConditions = this.getConditions();
				if (deepEqual(vResult, aConditions)) {
					// parsingResult is same as current value -> no update will happen
					_resolveAsyncChange.call(this, oChange);
					_removeAsyncChange.call(this, oChange);
				} else {
					oChange.waitForUpdate = true;
				}
			}.bind(this)).catch(function(oException) {
				if (oException && !(oException instanceof ParseException) && !(oException instanceof FormatException) && !(oException instanceof ValidateException)) {// FormatException could also occur
					// unknown error -> just raise it
					throw oException;
				}
				this._bParseError = true;
				fReject(oException);
				_removeAsyncChange.call(this, oChange);
			}.bind(this));
		}.bind(this));

		oChange.promise = oMyPromise;
		this._aAsyncChanges.push(oChange);

	}

	function _getAsyncPromise() {

		var aPromises = [];

		for (var i = 0; i < this._aAsyncChanges.length; i++) {
			aPromises.push(this._aAsyncChanges[i].promise);
		}

		if (aPromises.length > 0) {
			return Promise.all(aPromises).then(function() {
				return this._getResultForPromise(this.getConditions());
			}.bind(this));
		}

		return null;

	}

	FieldBase.prototype._getResultForPromise = function(aConditions) {

		// to be overwritten by Field - per default resolve conditions
		return aConditions;

	};

	function _resolveAsyncChange(oChange) {

		oChange.resolve(this._getResultForPromise(oChange.result));

	}

	function _removeAsyncChange(oChange) {

		var bFound = false;
		var i = 0;
		for (i = 0; i < this._aAsyncChanges.length; i++) {
			if (oChange === this._aAsyncChanges[i]) {
				bFound = true;
				break;
			}
		}
		if (bFound) {
			this._aAsyncChanges.splice(i, 1);
		}

		return bFound;

	}

	/*
	 * returns the supported operators
	 *
	 * To be overwritten by Field and FilterField
	 */
	FieldBase.prototype._getOperators = function() {

		var regexp = new RegExp("^\\*(.*)\\*|\\$search$");
		if (regexp.test(this.getFieldPath()) && this.getMaxConditions() === 1) {
			// for SearchField use Contains operator
			return ["Contains"];
		}

		// get default operators for type
		var sBaseType = this.getBaseType(); // TODO what if delegate not loaded

		if (sBaseType === BaseType.Unit) {
			sBaseType = BaseType.Numeric;
		}

		return FilterOperatorUtil.getOperatorsForType(sBaseType);

	};

	/*
	 * checks is a operator is valid
	 *
	 */
	function _isValidOperator(sOperator) {

		var aOperators = this._getOperators();

		for (var i = 0; i < aOperators.length; i++) {
			if (sOperator === aOperators[i]) {
				return true;
			}
		}

		return false;

	}

	/*
	 * In FilterField case the Field help needs to be bound to the same ConditionModel to
	 * bind the In- and OutParameters in the right way.
	 * As the FieldHelp might be placed outside the FilterBar in the control tree it might not
	 * inherit the ConditionModel.
	 */
	function _getConditionModelInfo() {

		var oConditionModel;
		var sName;
		var oBinding = this.getBinding("conditions");

		if (oBinding) {
			var oModel = oBinding.getModel();
			if (oModel && oModel.isA("sap.ui.mdc.condition.ConditionModel")) {
				oConditionModel = oModel;
				var oBindingInfo = this.getBindingInfo("conditions");
				if (oBindingInfo.model) {
					sName = oBindingInfo.model;
				} else if (oBindingInfo.parts && oBindingInfo.parts.length === 1) {
					sName = oBindingInfo.parts[0].model;
				}
			}
		}

		return {name: sName, model: oConditionModel};

	}

	FieldBase.prototype._isPropertyInitial = function(sPropertyName) {

		// as bound propertys are never initial even if there is no existing binding right now check the binding too
		if (this.isBound(sPropertyName) && !this.getBinding(sPropertyName)) {
			return !Object.prototype.hasOwnProperty.call(this.mProperties, sPropertyName);
		} else {
			return this.isPropertyInitial(sPropertyName);
		}

	};

	return FieldBase;

});
