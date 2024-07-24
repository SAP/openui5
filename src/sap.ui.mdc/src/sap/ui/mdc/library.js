/*!
 * ${copyright}
 */

/**
 * Initialization Code and shared classes of library sap.ui.mdc.
 */
sap.ui.define([
	"sap/ui/base/DataType",
	"sap/ui/core/Lib",
	"sap/ui/core/library", // library dependency
	"sap/m/library" // library dependency
], (DataType, Library) => {
 "use strict";

 /**
  * OpenUI5 library that contains metadata-driven composite controls, which can be extended
  * for use with any SAPUI5 model and data protocol.
  *
  * @namespace
  * @alias sap.ui.mdc
  * @author SAP SE
  * @version ${version}
  * @since 1.80
  * @public
  */
 const thisLib = Library.init({
	 apiVersion: 2,
	 version: "${version}",
	 name: "sap.ui.mdc",
	 dependencies: ["sap.ui.core", "sap.m"],
	 designtime: "sap/ui/mdc/designtime/library.designtime",
	 types: [
	  "sap.ui.mdc.TableP13Mode"
	 ],
	 interfaces: [
		 "sap.ui.mdc.IFilterSource",
		 "sap.ui.mdc.IFilter",
		 "sap.ui.mdc.IxState",
		 "sap.ui.mdc.valuehelp.ITypeaheadContent",
		 "sap.ui.mdc.valuehelp.IDialogContent",
		 "sap.ui.mdc.valuehelp.ITypeaheadContainer",
		 "sap.ui.mdc.valuehelp.IDialogContainer"

	 ],
	 controls: [
		 "sap.ui.mdc.Table",
		 "sap.ui.mdc.FilterBar",
		 "sap.ui.mdc.field.FieldBase",
		 "sap.ui.mdc.field.FieldInput",
		 "sap.ui.mdc.field.FieldMultiInput",
		 "sap.ui.mdc.valuehelp.base.DefineConditionPanel",
		 "sap.ui.mdc.Field",
		 "sap.ui.mdc.FilterField",
		 "sap.ui.mdc.MultiValueField",
		 "sap.ui.mdc.link.Panel",
		 "sap.ui.mdc.Chart",
		 "sap.ui.mdc.p13n.PersistenceProvider"
	 ],
	 elements: [
	  "sap.ui.mdc.table.Column",
	  "sap.ui.mdc.table.CreationRow",
	  "sap.ui.mdc.table.DragDropConfig",
	  "sap.ui.mdc.table.TableTypeBase",
	  "sap.ui.mdc.table.GridTableType",
	  "sap.ui.mdc.table.ResponsiveTableType",
	  "sap.ui.mdc.table.RowSettings",
	  "sap.ui.mdc.chart.Item",
	  "sap.ui.mdc.chart.ChartSelectionDetails",
	  "sap.ui.mdc.chart.SelectionButton",
	  "sap.ui.mdc.chart.SelectionButtonItem",
	  "sap.ui.mdc.chart.DrillBreadcrumbs",
	  "sap.ui.mdc.chart.SelectionDetailsActions",
	  "sap.ui.mdc.field.CustomFieldInfo",
	  "sap.ui.mdc.field.FieldInfoBase",
	  "sap.ui.mdc.filterbar.aligned.FilterItemLayout",
	  "sap.ui.mdc.Link",
	  "sap.ui.mdc.link.LinkItem",
	  "sap.ui.mdc.link.PanelItem",
	  "sap.ui.mdc.ushell.SemanticObjectUnavailableAction",
	  "sap.ui.mdc.ushell.SemanticObjectMapping",
	  "sap.ui.mdc.ushell.SemanticObjectMappingItem",
	  "sap.ui.mdc.field.MultiValueFieldItem",
	  "sap.ui.mdc.ValueHelp",
	  "sap.ui.mdc.valuehelp.Popover",
	  "sap.ui.mdc.valuehelp.Dialog",
	  "sap.ui.mdc.valuehelp.content.Bool",
	  "sap.ui.mdc.valuehelp.content.Conditions",
	  "sap.ui.mdc.valuehelp.content.FixedList",
	  "sap.ui.mdc.valuehelp.content.FixedListItem",
	  "sap.ui.mdc.valuehelp.content.MDCTable",
	  "sap.ui.mdc.valuehelp.content.MTable"
	 ],
	 extensions: {
		 flChangeHandlers: {
			 "sap.ui.mdc.Table": "sap/ui/mdc/flexibility/Table",
			 "sap.ui.mdc.Chart": "sap/ui/mdc/flexibility/Chart",
			 "sap.ui.mdc.FilterBar": "sap/ui/mdc/flexibility/FilterBar",
			 "sap.ui.mdc.filterbar.p13n.AdaptationFilterBar": "sap/ui/mdc/flexibility/FilterBar",
			 "sap.ui.mdc.filterbar.vh.FilterBar": "sap/ui/mdc/flexibility/FilterBar",
			 "sap.ui.mdc.valuehelp.FilterBar": "sap/ui/mdc/flexibility/FilterBar",
			 "sap.ui.mdc.link.PanelItem": "sap/ui/mdc/flexibility/PanelItem",
			 "sap.ui.mdc.link.Panel": "sap/ui/mdc/flexibility/Panel",
			 "sap.ui.mdc.ActionToolbar": "sap/ui/mdc/flexibility/ActionToolbar",
			 "sap.ui.mdc.actiontoolbar.ActionToolbarAction": "sap/ui/mdc/flexibility/ActionToolbarAction"
		 },
		 "sap.ui.support": {
			 publicRules: true
		 }
	 },
	 noLibraryCSS: false
 });

 /**
  *
  * Interface for valuehelp containers / contents supporting typeahead functionality
  *
  * @since 1.95
  * @name sap.ui.mdc.valuehelp.ITypeaheadContent
  * @interface
  * @private
  * @ui5-restricted sap.ui.mdc.valuehelp.ITypeaheadContainer
  */

 /**
  *
  * @name sap.ui.mdc.valuehelp.ITypeaheadContent#cancel
  * @event
  * @param {sap.ui.base.Event} oControlEvent
  * @param {sap.ui.base.EventProvider} oControlEvent.getSource
  */

 /**
  *
  * @name sap.ui.mdc.valuehelp.ITypeaheadContent#confirm
  * @event
  * @param {sap.ui.base.Event} oControlEvent
  * @param {sap.ui.base.EventProvider} oControlEvent.getSource
  */

 /**
  *
  * @name sap.ui.mdc.valuehelp.ITypeaheadContent#requestDelegateContent
  * @event
  * @param {sap.ui.base.Event} oControlEvent
  * @param {sap.ui.base.EventProvider} oControlEvent.getSource
  */

 /**
  *
  * @name sap.ui.mdc.valuehelp.ITypeaheadContent#select
  * @event
  * @param {sap.ui.base.Event} oControlEvent
  * @param {sap.ui.base.EventProvider} oControlEvent.getSource
  */

 /**
  * Returns a title for the given Content
  *
  * @name sap.ui.mdc.valuehelp.ITypeaheadContent.getTitle
  * @method
  * @returns {string} Content title as string

  * @ui5-restricted sap.ui.mdc.valuehelp.ITypeaheadContainer
 */

 /**
  * Returns info if the given content is in multi select mode
  *
  * @name sap.ui.mdc.valuehelp.ITypeaheadContent.isMultiSelect
  * @method
  * @returns {string} Content title as string

  * @ui5-restricted sap.ui.mdc.valuehelp.ITypeaheadContainer
 */

 /**
  * Loads additional dependencies, creates and returns displayed content.
  * @name sap.ui.mdc.valuehelp.ITypeaheadContent.getContent
  * @method
  * @returns {Promise<sap.ui.core.Control>}  Promise resolving in displayed content
  * @private
  * @ui5-restricted sap.ui.mdc.valuehelp.ITypeaheadContainer
  */


 /**
  * Determines the item (key and description) for a given value.
  *
  * The value help checks if there is an item with a key or description that fits this value.
  *
  * <b>Note:</b> This function must only be called by the control the <code>ValuedHelp</code> element
  * belongs to, not by the application.
  * @name sap.ui.mdc.valuehelp.ITypeaheadContent.getItemForValue
  * @method
  * @param {object} oConfig Configuration
  * @param {any} oConfig.value Value as entered by user
  * @param {any} [oConfig.parsedValue] Value parsed by type to fit the data type of the key
  * @param {object} [oConfig.inParameters] In parameters for the key (as a key must not be unique.)
  * @param {object} [oConfig.outParameters] Out parameters for the key (as a key must not be unique.)
  * @param {sap.ui.model.Context} [oConfig.bindingContext] <code>BindingContext</code> of the checked field. Inside a table the <code>ValueHelp</code> element might be connected to a different row.
  * @param {boolean} oConfig.checkKey If set, the value help checks only if there is an item with the given key. This is set to <code>false</code> if the value cannot be a valid key because of type validation.
  * @param {boolean} oConfig.checkDescription If set, the field help checks only if there is an item with the given description. This is set to <code>false</code> if only the key is used in the field.
  * @param {sap.ui.mdc.condition.ConditionModel} [oConfig.conditionModel] <code>ConditionModel</code>, in case of <code>FilterField</code>
  * @param {string} [oConfig.conditionModelName] Name of the <code>ConditionModel</code>, in case of <code>FilterField</code>
  * @returns {Promise<sap.ui.mdc.valuehelp.ValueHelpItem>} Promise returning object containing description, key and payload.
  * @throws {sap.ui.model.FormatException|sap.ui.model.ParseException} if entry is not found or not unique
  *
  * @private
  * @ui5-restricted sap.ui.mdc.valuehelp.ITypeaheadContainer
  */

 /**
  * Navigates the typeaheads values (optional)
  *
  * As this could be asyncronous as data might be loaded a promise is returned.
  *
  *
  * @name sap.ui.mdc.valuehelp.ITypeaheadContent.navigate
  * @method
  * @param {int} iStep Number of steps for navigation (e.g. 1 means next item, -1 means previous item)
  * @returns {Promise<object>} Promise returning object of navigated item (condition and itemId)
  *
  * @private
  * @ui5-restricted sap.ui.mdc.valuehelp.ITypeaheadContainer
  */


 /**
  * This optional event is fired after either a filter value or the visibility of a filter item has been changed.
  *
  * @name sap.ui.mdc.valuehelp.ITypeaheadContent#navigated
  * @event
  * @param {sap.ui.base.Event} oControlEvent
  * @param {sap.ui.base.EventProvider} oControlEvent.getSource
  * @param {object} oControlEvent.getParameters
  * @param {boolean} oControlEvent.getParameters.leaveFocus Indicates that the source control should be focused again
  * @param {object} oControlEvent.getParameters.condition Provides the target condition of the navigation
  * @param {string} oControlEvent.getParameters.itemId Provides the navigated item's ID (used for ARIA attributes)
  * @param {boolean} oControlEvent.getParameters.caseSensitive If <code>true</code> the filtering was executed case sensitive
  */

 /**
  * This optional event is fired after a suggested item for type-ahead has been found.
  *
  * @name sap.ui.mdc.valuehelp.ITypeaheadContent#typeaheadSuggested
  * @event
  * @param {sap.ui.base.Event} oControlEvent
  * @param {sap.ui.base.EventProvider} oControlEvent.getSource
  * @param {object} oControlEvent.getParameters
  * @param {object} oControlEvent.getParameters.condition Provides the target condition of the navigation
  * @param {string} oControlEvent.getParameters.filterValue Provides the used filter value. (as the event might be fired asynchronously, and the current user input might have changed.)
  * @param {string} oControlEvent.getParameters.itemId Provides the navigated item's ID (used for ARIA attributes)
  * @param {boolean} oControlEvent.getParameters.caseSensitive If <code>true</code> the filtering was executed case sensitive
  * @since 1.120.0
  */

 /**
  * This optional event can be fired by typaehead contents also supporting dialog mode.
  *
  * @name sap.ui.mdc.valuehelp.ITypeaheadContent#requestSwitchToDialog
  * @event
  */

 /**
  * This optional event is fired if the visual focus is set to the value help.
  *
  * In this case the visual focus needs to be removed from the opening field, but the real focus must stay there.
  *
  * @name sap.ui.mdc.valuehelp.ITypeaheadContent#visualFocusSet
  * @event
  * @since 1.127.0
  */

 /**
  If the container is used for type-ahead it might be wanted that the same content should also be shown as valuehelp. If not, the field should not show a valuehelp icon.
  *
  * @name sap.ui.mdc.valuehelp.ITypeaheadContent.getUseAsValueHelp
  * @method
  * @private
  * @ui5-restricted sap.ui.mdc.valuehelp.ITypeaheadContainer
 */

 /**
  * Defines if the typeahead can be used for input validation.
  *
  * @name sap.ui.mdc.valuehelp.ITypeaheadContent.isValidationSupported
  * @method
  * @returns {boolean} True if the typeahead container can be used for input validation
  *
  * @private
  * @ui5-restricted sap.ui.mdc.valuehelp.ITypeaheadContainer
  */

 /**
  * Defines if the typeahead containers values can be navigated without visibly opening the help
  *
  * @name sap.ui.mdc.valuehelp.ITypeaheadContent.shouldOpenOnNavigate
  * @method
  * @returns {boolean} True if value help shall open as valuehelp
  * @private
  * @ui5-restricted sap.ui.mdc.valuehelp.ITypeaheadContainer
  */

 /**
  * Defines if the typeahead content desires opening the typeahead whenever a user clicks on a connected control
  *
  * @name sap.ui.mdc.valuehelp.ITypeaheadContent.shouldOpenOnClick
  * @method
  * @returns {boolean} True if typeahead can open
  * @private
  * @ui5-restricted sap.ui.mdc.valuehelp.ITypeaheadContainer
  */

 /**
  * The focus visualization of the field help needs to be removed as the user starts typing into the source control.
  * @name sap.ui.mdc.valuehelp.ITypeaheadContent.removeVisualFocus
  * @method
  * @private
  * @ui5-restricted sap.ui.mdc.valuehelp.ITypeaheadContainer
  */

 /**
  * The focus visualization of the field help needs to be set as the user starts naigation into the value help items.
  * @name sap.ui.mdc.valuehelp.ITypeaheadContent.setVisualFocus
  * @method
  * @private
  * @ui5-restricted sap.ui.mdc.ValueHelp
  * @since 1.127.0
  */


 /**
  *
  * Interface for valuehelp containers
  *
  *
  * @since 1.95
  * @name sap.ui.mdc.valuehelp.ITypeaheadContainer
  * @interface
  * @private
  * @ui5-restricted sap.ui.mdc.ValueHelp
  */

 /**
  *
  * @name sap.ui.mdc.valuehelp.ITypeaheadContainer#cancel
  * @event
  * @param {sap.ui.base.Event} oControlEvent
  * @param {sap.ui.base.EventProvider} oControlEvent.getSource
  */

 /**
  *
  * @name sap.ui.mdc.valuehelp.ITypeaheadContainer#confirm
  * @event
  * @param {sap.ui.base.Event} oControlEvent
  * @param {sap.ui.base.EventProvider} oControlEvent.getSource
  */

 /**
  *
  * @name sap.ui.mdc.valuehelp.ITypeaheadContainer#requestDelegateContent
  * @event
  * @param {sap.ui.base.Event} oControlEvent
  * @param {sap.ui.base.EventProvider} oControlEvent.getSource
  */

 /**
  *
  * @name sap.ui.mdc.valuehelp.ITypeaheadContainer#select
  * @event
  * @param {sap.ui.base.Event} oControlEvent
  * @param {sap.ui.base.EventProvider} oControlEvent.getSource
  */

 /**
  *
  * @name sap.ui.mdc.valuehelp.ITypeaheadContainer#opened
  * @event
  * @param {sap.ui.base.Event} oControlEvent
  * @param {sap.ui.base.EventProvider} oControlEvent.getSource
  */

 /**
  *
  * @name sap.ui.mdc.valuehelp.ITypeaheadContainer#closed
  * @event
  * @param {sap.ui.base.Event} oControlEvent
  * @param {sap.ui.base.EventProvider} oControlEvent.getSource
  */

 /**
  * Opens the container
  * @name sap.ui.mdc.valuehelp.ITypeaheadContainer.open
  * @method
  * @returns {Promise} This promise resolves after the container completely opened.
  *
  * @private
  * @ui5-restricted sap.ui.mdc.ValueHelp
  */

 /**
  * Closes the container
  *
  * @name sap.ui.mdc.valuehelp.ITypeaheadContainer.close
  * @method
  * @returns {Promise} This promise resolves after the container completely closed.
  *
  * @private
  * @ui5-restricted sap.ui.mdc.ValueHelp
  */

 /**
  * Determines the item (key and description) for a given value.
  *
  * The value help checks if there is an item with a key or description that fits this value.
  *
  * <b>Note:</b> This function must only be called by the control the <code>ValuedHelp</code> element
  * belongs to, not by the application.
  * @name sap.ui.mdc.valuehelp.ITypeaheadContainer.getItemForValue
  * @method
  * @param {object} oConfig Configuration
  * @param {any} oConfig.value Value as entered by user
  * @param {any} [oConfig.parsedValue] Value parsed by type to fit the data type of the key
  * @param {object} [oConfig.inParameters] In parameters for the key (as a key must not be unique.)
  * @param {object} [oConfig.outParameters] Out parameters for the key (as a key must not be unique.)
  * @param {sap.ui.model.Context} [oConfig.bindingContext] <code>BindingContext</code> of the checked field. Inside a table the <code>ValueHelp</code> element might be connected to a different row.
  * @param {boolean} oConfig.checkKey If set, the value help checks only if there is an item with the given key. This is set to <code>false</code> if the value cannot be a valid key because of type validation.
  * @param {boolean} oConfig.checkDescription If set, the field help checks only if there is an item with the given description. This is set to <code>false</code> if only the key is used in the field.
  * @returns {Promise<sap.ui.mdc.valuehelp.ValueHelpItem>} Promise returning object containing description, key and payload.
  * @throws {sap.ui.model.FormatException|sap.ui.model.ParseException} if entry is not found or not unique
  *
  * @private
  * @ui5-restricted sap.ui.mdc.ValueHelp
  */

 /**
  * Navigates the typeaheads values (optional)
  *
  * As this could be asyncronous as data might be loaded a promise is returned.
  *
  *
  * @name sap.ui.mdc.valuehelp.ITypeaheadContainer.navigate
  * @method
  * @param {int} iStep Number of steps for navigation (e.g. 1 means next item, -1 means previous item)
  * @returns {Promise<object>} Promise returning object of navigated item (condition and itemId)
  *
  * @private
  * @ui5-restricted sap.ui.mdc.ValueHelp
  */


 /**
  * This optional event is fired after either a filter value or the visibility of a filter item has been changed.
  *
  * @name sap.ui.mdc.valuehelp.ITypeaheadContainer#navigated
  * @event
  * @param {sap.ui.base.Event} oControlEvent
  * @param {sap.ui.base.EventProvider} oControlEvent.getSource
  * @param {object} oControlEvent.getParameters
  * @param {boolean} oControlEvent.getParameters.bLeaveFocus Indicates that the source control should be focused again
  * @param {object} oControlEvent.getParameters.condition Provides the target condition of the navigation
  * @param {string} oControlEvent.getParameters.itemId Provides the navigated item's ID (used for ARIA attributes)
  */

 /**
  * This optional event is fired after a suggested item for type-ahead has been found.
  *
  * @name sap.ui.mdc.valuehelp.ITypeaheadContainer#typeaheadSuggested
  * @event
  * @param {sap.ui.base.Event} oControlEvent
  * @param {sap.ui.base.EventProvider} oControlEvent.getSource
  * @param {object} oControlEvent.getParameters
  * @param {object} oControlEvent.getParameters.condition Provides the target condition of the navigation
  * @param {string} oControlEvent.getParameters.itemId Provides the navigated item's ID (used for ARIA attributes)
  * @since 1.120.0
  */

 /**
  * This optional event can be fired by typaehead contents also supporting dialog mode.
  *
  * @name sap.ui.mdc.valuehelp.ITypeaheadContainer#requestSwitchToDialog
  * @event
  */

 /**
  * This optional event is fired if the visual focus is set to the value help.
  *
  * In this case the visual focus needs to be removed from the opening field, but the real focus must stay there.
  *
  * @name sap.ui.mdc.valuehelp.ITypeaheadContainer#visualFocusSet
  * @event
  * @since 1.127.0
  */

 /**
  If the container is used for type-ahead it might be wanted that the same content should also be shown as valuehelp. If not, the field should not show a valuehelp icon.
  *
  * @name sap.ui.mdc.valuehelp.ITypeaheadContainer.getUseAsValueHelp
  * @method
  * @private
  * @ui5-restricted sap.ui.mdc.ValueHelp
  */

 /**
  * Defines if the typeahead can be used for input validation.
  *
  * @name sap.ui.mdc.valuehelp.ITypeaheadContainer.isValidationSupported
  * @method
  * @returns {boolean} True if the typeahead container can be used for input validation
  *
  * @private
  * @ui5-restricted sap.ui.mdc.ValueHelp
  */

 /**
  * Defines if the typeahead containers values can be navigated without visibly opening the help
  *
  * @name sap.ui.mdc.valuehelp.ITypeaheadContainer.shouldOpenOnNavigate
  * @method
  * @returns {boolean} True if value help shall open as valuehelp
  * @private
  * @ui5-restricted sap.ui.mdc.ValueHelp
  */

 /**
  * Defines if the typeahead container desires to be opened whenever a user focuses a connected control
  *
  * @name sap.ui.mdc.valuehelp.ITypeaheadContainer.shouldOpenOnFocus
  * @method
  * @returns {boolean} True if value help shall open on focus
  * @private
  * @ui5-restricted sap.ui.mdc.ValueHelp
  */

 /**
  * Defines if the typeahead container desires to be opened whenever a user clicks on a connected control
  *
  * @name sap.ui.mdc.valuehelp.ITypeaheadContainer.shouldOpenOnClick
  * @method
  * @returns {boolean} True if value help shall open on click
  * @private
  * @ui5-restricted sap.ui.mdc.ValueHelp
  */

 /**
  * The focus visualization of the field help needs to be removed as the user starts typing into the source control.
  * @name sap.ui.mdc.valuehelp.ITypeaheadContainer.removeVisualFocus
  * @method
  * @private
  * @ui5-restricted sap.ui.mdc.ValueHelp
  */

 /**
  * The focus visualization of the field help needs to be set as the user starts naigation into the value help items.
  * @name sap.ui.mdc.valuehelp.ITypeaheadContainer.setVisualFocus
  * @method
  * @private
  * @ui5-restricted sap.ui.mdc.ValueHelp
  * @since 1.127.0
  */


 /**
  *
  * Interface for valuehelp containers / contents supporting typeahead functionality
  *
  *
  * @since 1.95
  * @name sap.ui.mdc.valuehelp.IDialogContent
  * @interface
  * @private
  * @ui5-restricted sap.ui.mdc.valuehelp.IDialogContainer
  */

 /**
  *
  * @name sap.ui.mdc.valuehelp.IDialogContent#cancel
  * @event
  * @param {sap.ui.base.Event} oControlEvent
  * @param {sap.ui.base.EventProvider} oControlEvent.getSource
  */

 /**
  *
  * @name sap.ui.mdc.valuehelp.IDialogContent#confirm
  * @event
  * @param {sap.ui.base.Event} oControlEvent
  * @param {sap.ui.base.EventProvider} oControlEvent.getSource
  */

 /**
  *
  * @name sap.ui.mdc.valuehelp.IDialogContent#requestDelegateContent
  * @event
  * @param {sap.ui.base.Event} oControlEvent
  * @param {sap.ui.base.EventProvider} oControlEvent.getSource
  */

 /**
  *
  * @name sap.ui.mdc.valuehelp.IDialogContent#select
  * @event
  * @param {sap.ui.base.Event} oControlEvent
  * @param {sap.ui.base.EventProvider} oControlEvent.getSource
  */

 /**
  *
  * Returns number of relevant conditions for this content
  *
  * @name sap.ui.mdc.valuehelp.IDialogContent.getCount
  * @method
  * @returns {number} Number of relevant conditions
  * @private
  * @ui5-restricted sap.ui.mdc.valuehelp.IDialogContainer
  */

 /**
  * Returns a title for the given Content
  *
  * @name sap.ui.mdc.valuehelp.IDialogContent.getTitle
  * @method
  * @returns {string} Content title as string
  * @ui5-restricted sap.ui.mdc.valuehelp.IDialogContainer
  */

 /**
  * Returns info if the given content is in multi select mode
  *
  * @name sap.ui.mdc.valuehelp.IDialogContent.isMultiSelect
  * @method
  * @returns {string} Content title as string

  * @ui5-restricted sap.ui.mdc.valuehelp.IDialogContainer
 */

 /**
  * Loads additional dependencies, creates and returns displayed content.
  * @name sap.ui.mdc.valuehelp.IDialogContent.getContent
  * @method
  * @returns {Promise<sap.ui.core.Control>}  Promise resolving in displayed content
  * @private
  * @ui5-restricted sap.ui.mdc.valuehelp.IDialogContainer
  */



 /**
  *
  * Interface for valuehelp containers
  *
  *
  * @since 1.95
  * @name sap.ui.mdc.valuehelp.IDialogContainer
  * @interface
  * @private
  * @ui5-restricted sap.ui.mdc.valuehelp.IDialogContainer
  */

 /**
  *
  * @name sap.ui.mdc.valuehelp.IDialogContainer#cancel
  * @event
  * @param {sap.ui.base.Event} oControlEvent
  * @param {sap.ui.base.EventProvider} oControlEvent.getSource
  */

 /**
  *
  * @name sap.ui.mdc.valuehelp.IDialogContainer#confirm
  * @event
  * @param {sap.ui.base.Event} oControlEvent
  * @param {sap.ui.base.EventProvider} oControlEvent.getSource
  */

 /**
  *
  * @name sap.ui.mdc.valuehelp.IDialogContainer#requestDelegateContent
  * @event
  * @param {sap.ui.base.Event} oControlEvent
  * @param {sap.ui.base.EventProvider} oControlEvent.getSource
  */

 /**
  *
  * @name sap.ui.mdc.valuehelp.IDialogContainer#select
  * @event
  * @param {sap.ui.base.Event} oControlEvent
  * @param {sap.ui.base.EventProvider} oControlEvent.getSource
  */

 /**
  *
  * @name sap.ui.mdc.valuehelp.IDialogContainer#opened
  * @event
  * @param {sap.ui.base.Event} oControlEvent
  * @param {sap.ui.base.EventProvider} oControlEvent.getSource
  */

 /**
  *
  * @name sap.ui.mdc.valuehelp.IDialogContainer#closed
  * @event
  * @param {sap.ui.base.Event} oControlEvent
  * @param {sap.ui.base.EventProvider} oControlEvent.getSource
  */

 /**
  * Opens the container
  * @name sap.ui.mdc.valuehelp.IDialogContainer.open
  * @method
  * @returns {Promise} This promise resolves after the container completely opened.
  * @private
  * @ui5-restricted sap.ui.mdc.ValueHelp
  */

 /**
  * Closes the container
  *
  * @name sap.ui.mdc.valuehelp.IDialogContainer.close
  * @method
  * @returns {Promise} This promise resolves after the container completely closed.
  *
  * @private
  * @ui5-restricted sap.ui.mdc.ValueHelp
  */



 /**
  * Item object type. This represents an abstract item from the {@link sap.ui.mdc.ValueHelp ValueHelp}.
  *
  * If an item is requested using a description or key, an object with the following
  * properties is returned.
  *
  * @static
  * @constant
  * @typedef {object} sap.ui.mdc.valuehelp.ValueHelpItem
  * @property {any} key Key of the item
  * @property {string} description Description of the item
  * @property {object} [payload] Payload of the item.
  * @private
  * @ui5-restricted sap.ui.mdc
  */


 /**
  *
  * Interface for controls or entities which are able to return a set of present conditions.
  * The controls or entities have to implement the following APIs: <code>getConditions</code>.
  *
  * @since 1.80
  * @name sap.ui.mdc.IFilterSource
  * @interface
  * @public
  */

 /**
  * The function 'getConditions' is used to retrieve a set of present conditions as defined per {@link sap.ui.mdc.IFilterSource} interface.
  *
  * @name sap.ui.mdc.IFilterSource.getConditions
  * @returns {map} a map containing the conditions according to the definition of the {@link sap.ui.mdc.condition.ConditionModel}
  * @since 1.80
  * @method
  */

 /**
  *
  * Interface for controls or entities which can serve as filters in the <code>sap.ui.mdc.Table</code> & <code>sap.ui.mdc.Chart</code>.
  *
  * The following methods need to be implemented:
  *
  * <ul>
  * <li><code>getConditions</code> - Part of the {@link sap.ui.mdc.IFilterSource} interface.</li>
  * <li><code>validate</code> - The <code>validate</code> method should return a promise which resolves after the IFilter interface has handled its inner validation. The <code>getConditions</code> method will be called subsequently by the filtered control.</li>
  * <li><code>getSearch</code> - <b>Note:</b> The <code>getSearch</code> method can optionally be implemented and should return a string for approximate string matching implemented in the backend.</li>
  * </ul>
  *
  * The following events need to be implemented:
  *
  * <ul>
  * <li><code>search</code> - This event should be fired once a filtering should be executed on the IFilter using control.</li>
  * <li><code>filtersChanged</code> - <b>Note:</b> The <code>filtersChanged</code> event can optionally be implemented and should be fired whenever a filter value has changed. This event will be used to display an overlay on the IFilter consuming control.</li>
  * </ul>
  *
  * @since 1.70
  * @extends sap.ui.mdc.IFilterSource
  * @name sap.ui.mdc.IFilter
  * @interface
  * @public
  */

 /**
  * The <code>validate</code> method should return a promise which resolves after the IFilter interface has handled its inner validation.
  * The <code>getConditions</code> method will be called subsequently by the filtered control.</li>
  *
  * @name sap.ui.mdc.IFilter.validate
  * @param {boolean} bSuppressSearch Determines whether the search should be suppressed. The default is <code>null<code>.
  * @returns {Promise} A promise resolving once the necessary result validation has been handled
  * @since 1.80
  * @function
  * @public
  */

 /**
  * <b>Note:</b> The <code>getSearch</code> method can optionally be implemented and should return a string for approximate string matching implemented in the backend.</li>
  *
  * @name sap.ui.mdc.IFilter.getSearch
  * @returns {string} The search string to be used for an approximate string matching
  * @since 1.80
  * @function
  * @public
  */

 /**
  *
  * Fired when a filter value changes to display an overlay on the <code>sap.ui.mdc.Table</code> & <code>sap.ui.mdc.Chart</code> control.
  *
  * @name ap.ui.mdc.IFilter#filtersChanged
  * @event
  * @param {sap.ui.base.Event} oControlEvent
  * @param {sap.ui.base.EventProvider} oControlEvent.getSource
  */

 /**
  * Fired when a filter value changes to display an overlay on the <code>sap.ui.mdc.Table</code> & <code>sap.ui.mdc.Chart</code> control.
  *
  * @name ap.ui.mdc.IFilter#search
  * @event
  * @param {sap.ui.base.Event} oControlEvent
  * @param {sap.ui.base.EventProvider} oControlEvent.getSource
  */

 /**
  *
  * Interface for controls or entities which support the appliance of an externalized state representation.
  * The controls or entities have to implement the following APIs: <code>getCurrentState</code> & <code>initialized</code> methods.
  *
  * @since 1.75
  * @name sap.ui.mdc.IxState
  * @interface
  * @public
  */

 /**
  * @deprecated As of version 1.121
  */
 DataType.registerEnum("sap.ui.mdc.FilterBarP13nMode", thisLib.FilterBarP13nMode);

 /**
  * @deprecated As of version 1.121
  */
 DataType.registerEnum("sap.ui.mdc.TableType", thisLib.TableType);

 /**
  * @deprecated As of version 1.121
  */
 DataType.registerEnum("sap.ui.mdc.TableP13nMode", thisLib.TableP13nMode);

 /**
  * @deprecated As of version 1.121
  */
 DataType.registerEnum("sap.ui.mdc.GrowingMode", thisLib.GrowingMode);

 /**
  * @deprecated As of version 1.121
  */
 DataType.registerEnum("sap.ui.mdc.RowCountMode", thisLib.RowCountMode);

 /**
  * @deprecated As of version 1.121
  */
 DataType.registerEnum("sap.ui.mdc.ChartToolbarActionType", thisLib.ChartToolbarActionType);

 /**
  * @deprecated As of version 1.121
  */
 DataType.registerEnum("sap.ui.mdc.ChartP13nMode", thisLib.ChartP13nMode);

 /**
  * @deprecated As of version 1.121
  */
 DataType.registerEnum("sap.ui.mdc.SelectionMode", thisLib.SelectionMode);

 /**
  * @deprecated As of version 1.121
  */
 DataType.registerEnum("sap.ui.mdc.RowAction", thisLib.RowAction);

 /**
  * @deprecated As of version 1.121
  */
 DataType.registerEnum("sap.ui.mdc.FilterExpression", thisLib.FilterExpression);

 /**
  * @deprecated As of version 1.121
  */
 DataType.registerEnum("sap.ui.mdc.ChartItemType", thisLib.ChartItemType);

 /**
  * @deprecated As of version 1.121
  */
 DataType.registerEnum("sap.ui.mdc.ChartItemRoleType", thisLib.ChartItemRoleType);

 /**
  * @deprecated As of version 1.121
  */
 DataType.registerEnum("sap.ui.mdc.MultiSelectMode", thisLib.MultiSelectMode);

 /**
  * @typedef {object} sap.ui.mdc.TypeConfig
  * @property {string} [className] Model-specific data type
  * @property {sap.ui.model.SimpleType} typeInstance Type instance for given data type
  * @property {string} baseType Basic type category for given data type
  * @private
  * @ui5-restricted sap.ui.mdc
  */

 /**
  * @typedef {object} sap.ui.mdc.DelegateConfig
  * @property {string} name Delegate module path
  * @property {*} payload Delegate payload
  * @private
  * @ui5-restricted sap.ui.mdc
  */

 /**
  * Enumerations for <code>sap.ui.mdc</code> library
  * @namespace
  * @name sap.ui.mdc.enums
  * @since 1.74.0
  * @public
  */

 /**
  * @namespace
  * @name sap.ui.mdc.mixin
  * @private
  * @ui5-restricted sap.ui.mdc
  */

 /**
  * Modules for {@link sap.ui.mdc.FilterBar FilterBar}
  * @namespace
  * @name sap.ui.mdc.filterbar
  * @public
  * @since 1.112.0
  */

 /**
  * Utilities for <code>sap.ui.mdc</code> library
  * @namespace
  * @name sap.ui.mdc.util
  * @since 1.74.0
  * @public
  */

 /**
  * @namespace
  * @name sap.ui.mdc.chart
  * @public
  */

 /**
  * @namespace
  * @name sap.ui.mdc.State
  * @public
  * @since 1.113.0
  */
 /**
  * @namespace
  * @name sap.ui.mdc.State.XCondition
  * @public
  */
 /**
  * @namespace
  * @name sap.ui.mdc.State.Items
  * @public
  */
 /**
  * @namespace
  * @name sap.ui.mdc.State.Sorters
  * @public
  */
 /**
  * @namespace
  * @name sap.ui.mdc.State.GroupLevels
  * @public
  */
 /**
  * @namespace
  * @name sap.ui.mdc.State.Aggregations
  * @public
  */
 /**
  * Defines the values for each filter field path of a condition.
  *
  * @typedef {object} sap.ui.mdc.State.XCondition
  * @property {string} operator of the condition
  * @property {Array} values of the condition
  *
  * @public
  */
 /**
  * Defines the <code>items</code> to be added to the controls default aggregation.
  *
  * @typedef {object} sap.ui.mdc.State.Items
  * @property {string} key of the item
  * @property {int} [position] of the item in the aggregation
  * @property {boolean} [visible = true] State of the item
  *
  * @public
  */
 /**
  * Defines the <code>sorters</code> to be added to the controls sorting state.
  *
  * @typedef {object} sap.ui.mdc.State.Sorters
  * @property {string} key of the sorted item
  * @property {boolean} descending Sort order for this item
  * @property {boolean} [sorted = true] Defines if the item has to be sorted
  *
  * @public
  */
 /**
  * Defines the <code>groupes</code> to be added to the controls grouping state.
  *
  * @typedef {object} sap.ui.mdc.State.GroupLevels
  * @property {string} key of the grouped item
  * @property {boolean} [grouped = true] Defines if the item has to be grouped
  *
  * @public
  */
 /**
  * Defines the <code>aggregations</code> to be added to the controls agreggation state.
  *
  * Defines whether there is an aggregation for each item.
  *
  * @typedef {object} sap.ui.mdc.State.Aggregations
  * @property {boolean} [aggregated = true] Defines if the item has to be aggregated
  *
  * @public
  */
 /**
  * The <code>State</code> object describes the interface to apply and retrieve the current adaptation state from mdc controls.
  * The {@link sap.mdc.p13n.StateUtil StateUtil} class can be used to programatically apply changes considered for
  * the controls personalization to be part of its persistence.
  *
  * @typedef {object} sap.ui.mdc.State
  * @property {sap.ui.mdc.State.XCondition} [filter] Describes the filter conditions
  * @property {sap.ui.mdc.State.Items[]} [items] Describes the filter fields
  * @property {sap.ui.mdc.State.Sorters[]} [sorters] Describes the sorter fields
  * @property {sap.ui.mdc.State.GroupLevels[]} [groupLevels] Describes the grouped fields
  * @property {sap.ui.mdc.State.Aggregations} [aggregations] Describes the aggregated fields
  *
  * @public
  */

 /**
  * Map-like configuration object for filter creation.<br/>
  * The keys for this object must be aligned with any {@link sap.ui.mdc.util.FilterTypeConfig} the <code>FilterConditionMap</code> is combined with during filter creation.<br/>
  *
  *
  * <b>Structure:</b> Object.&lt;string, {@link sap.ui.mdc.condition.ConditionObject sap.ui.mdc.condition.ConditionObject[]}&gt;
  *
  * @typedef sap.ui.mdc.util.FilterConditionMap
  * @type {Object.<string, sap.ui.mdc.condition.ConditionObject[]>}
  * @public
  * @since 1.121.0
  */

 /**
  * Configuration object for filter creation.
  *
  * @typedef {object} sap.ui.mdc.util.FilterTypeConfigEntry
  * @property {sap.ui.model.Type} type Type instance
  * @property {boolean} [caseSensitive] Indicates if a created filter is case-sensitive
  * @property {sap.ui.mdc.enums.BaseType} [baseType] BaseType configuration for the given type useful for externalization/internalization of filter values
  * @public
  * @since 1.121.0
  */

 /**
  * Map-like configuration object for filter creation.<br/>
  * The keys for this object must be aligned with any {@link sap.ui.mdc.util.FilterConditionMap} the <code>FilterTypeConfig</code> is combined with during filter creation.
  *
  *
  * <b>Structure:</b> Object.&lt;string, {@link sap.ui.mdc.util.FilterTypeConfigEntry}&gt;
  *
  * @typedef sap.ui.mdc.util.FilterTypeConfig
  * @type {Object.<string, sap.ui.mdc.util.FilterTypeConfigEntry>}
  * @public
  * @since 1.121.0
  */


 return thisLib;
});