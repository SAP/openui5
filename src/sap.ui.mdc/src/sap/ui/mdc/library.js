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
  * Interface for valuehelp {@link sap.ui.mdc.valuehelp.base.Container Containers} / {@link sap.ui.mdc.valuehelp.base.Content Contents} supporting typeahead functionality
  *
  * @since 1.95
  * @name sap.ui.mdc.valuehelp.ITypeaheadContent
  * @interface
  * @private
  * @ui5-restricted sap.ui.mdc.valuehelp.ITypeaheadContainer
  */

 /**
  * This event is fired if the change is cancelled.
  *
  * @name sap.ui.mdc.valuehelp.ITypeaheadContent.cancel
  * @event
  * @param {sap.ui.base.Event} oControlEvent
  * @param {sap.ui.base.EventProvider} oControlEvent.getSource
  * @private
  * @ui5-restricted sap.ui.mdc.valuehelp.ITypeaheadContainer
  */

 /**
  * This event is fired if a change of the content is confirmed.
  *
  * @name sap.ui.mdc.valuehelp.ITypeaheadContent.confirm
  * @event
  * @param {sap.ui.base.Event} oControlEvent
  * @param {sap.ui.base.EventProvider} oControlEvent.getSource
  * @param {object} oControlEvent.getParameters
  * @param {boolean} oControlEvent.getParameters.close <code>true</code> if the value help needs to be closed
  * @private
  * @ui5-restricted sap.ui.mdc.valuehelp.ITypeaheadContainer
  */

 /**
  * This event is fired if the selected condition has changed.
  *
  * @name sap.ui.mdc.valuehelp.ITypeaheadContent.select
  * @event
  * @param {sap.ui.base.Event} oControlEvent
  * @param {sap.ui.base.EventProvider} oControlEvent.getSource
  * @param {object} oControlEvent.getParameters
  * @param {sap.ui.mdc.enums.ValueHelpSelectionType} oControlEvent.getParameters.type Type of the selection change (add, remove)
  * @param {object[]} oControlEvent.getParameters.conditions Changed conditions <br> <b>Note:</b> A condition must have the structure of {@link sap.ui.mdc.condition.ConditionObject ConditionObject}.
  * @private
  * @ui5-restricted sap.ui.mdc.valuehelp.ITypeaheadContainer
  */

 /**
  * Returns a title for the given Content
  *
  * @name sap.ui.mdc.valuehelp.ITypeaheadContent.getTitle
  * @function
  * @returns {string} Content title as string
  * @private
  * @ui5-restricted sap.ui.mdc.valuehelp.ITypeaheadContainer
  */

 /**
  * Returns info if the given content is in multi select mode
  *
  * @name sap.ui.mdc.valuehelp.ITypeaheadContent.isMultiSelect
  * @function
  * @returns {boolean} <code>true</code> if multi-selection is active.
  * @private
  * @ui5-restricted sap.ui.mdc.valuehelp.ITypeaheadContainer
  */

 /**
  * Loads additional dependencies, creates and returns displayed content.
  * @name sap.ui.mdc.valuehelp.ITypeaheadContent.getContent
  * @function
  * @returns {Promise<sap.ui.core.Control>} Promise resolving in displayed content
  * @private
  * @ui5-restricted sap.ui.mdc.valuehelp.ITypeaheadContainer
  */


 /**
  * Determines the item (key and description) for a given value.
  *
  * The content checks if there is an item with a key or description that fits this value.
  *
  * <b>Note:</b> This function must only be called by the <code>Container</code> element.
  * @name sap.ui.mdc.valuehelp.ITypeaheadContent.getItemForValue
  * @function
  * @param {sap.ui.mdc.valuehelp.base.ItemForValueConfiguration}} oConfig Configuration
  * @returns {Promise<sap.ui.mdc.valuehelp.ValueHelpItem>} Promise returning object containing description, key and payload.
  * @throws {sap.ui.model.FormatException|sap.ui.model.ParseException} if entry is not found or not unique
  * @private
  * @ui5-restricted sap.ui.mdc.valuehelp.ITypeaheadContainer
  */

 /**
  * Navigates the typeaheads values (optional)
  *
  * @name sap.ui.mdc.valuehelp.ITypeaheadContent.navigate
  * @function
  * @param {int} iStep Number of steps for navigation (e.g. 1 means next item, -1 means previous item)
  * @private
  * @ui5-restricted sap.ui.mdc.valuehelp.ITypeaheadContainer
  */

 /**
  * This optional event is fired if a navigation has been executed in the content.
  *
  * @name sap.ui.mdc.valuehelp.ITypeaheadContent.navigated
  * @event
  * @param {sap.ui.base.Event} oControlEvent
  * @param {sap.ui.base.EventProvider} oControlEvent.getSource
  * @param {object} oControlEvent.getParameters
  * @param {boolean} oControlEvent.getParameters.leaveFocus Indicates that the source control should be focused again
  * @param {object} oControlEvent.getParameters.condition Provides the target condition of the navigation <br> <b>Note:</b> A condition must have the structure of {@link sap.ui.mdc.condition.ConditionObject ConditionObject}.
  * @param {string} oControlEvent.getParameters.itemId Provides the navigated item's ID (used for ARIA attributes)
  * @param {boolean} oControlEvent.getParameters.caseSensitive If <code>true</code> the filtering was executed case sensitive
  * @private
  * @ui5-restricted sap.ui.mdc.valuehelp.ITypeaheadContainer
  */

 /**
  * This optional event is fired after a suggested item for type-ahead has been found.
  *
  * @name sap.ui.mdc.valuehelp.ITypeaheadContent.typeaheadSuggested
  * @event
  * @param {sap.ui.base.Event} oControlEvent
  * @param {sap.ui.base.EventProvider} oControlEvent.getSource
  * @param {object} oControlEvent.getParameters
  * @param {object} oControlEvent.getParameters.condition Provides the target condition of the suggested item. <br> <b>Note:</b> A condition must have the structure of {@link sap.ui.mdc.condition.ConditionObject ConditionObject}
  * @param {string} oControlEvent.getParameters.filterValue Provides the used filter value. (as the event might be fired asynchronously, and the current user input might have changed.)
  * @param {string} oControlEvent.getParameters.itemId Provides the ID of the suggested item (used for ARIA attributes)
  * @param {string} oControlEvent.getParameters.items Provides number of found items
  * @param {boolean} oControlEvent.getParameters.caseSensitive If <code>true</code> the filtering was executed case sensitive
  * @private
  * @ui5-restricted sap.ui.mdc.valuehelp.ITypeaheadContainer
  * @since 1.120.0
  */

 /**
  * This optional event can be fired by typaehead contents also supporting dialog mode.
  *
  * @name sap.ui.mdc.valuehelp.ITypeaheadContent.requestSwitchToDialog
  * @event
  * @param {sap.ui.base.Event} oControlEvent
  * @param {sap.ui.base.EventProvider} oControlEvent.getSource
  * @private
  * @ui5-restricted sap.ui.mdc.valuehelp.ITypeaheadContainer
  */

 /**
  * This optional event is fired if the visual focus is set to the value help.
  *
  * In this case the visual focus needs to be removed from the opening field, but the real focus must stay there.
  *
  * @name sap.ui.mdc.valuehelp.ITypeaheadContent.visualFocusSet
  * @event
  * @param {sap.ui.base.Event} oControlEvent
  * @param {sap.ui.base.EventProvider} oControlEvent.getSource
  * @private
  * @ui5-restricted sap.ui.mdc.valuehelp.ITypeaheadContainer
  * @since 1.127.0
  */

 /**
  * If the container is used for typeahead it might be wanted that the same content should also be shown as valuehelp. If not, the field should not show a valuehelp icon.
  *
  * @name sap.ui.mdc.valuehelp.ITypeaheadContent.getUseAsValueHelp
  * @function
  * @returns {boolean} <code>true</code> if the typeahead content can be used as value help
  * @private
  * @ui5-restricted sap.ui.mdc.valuehelp.ITypeaheadContainer
  */

 /**
  * Defines if the typeahead can be used for input validation.
  *
  * @name sap.ui.mdc.valuehelp.ITypeaheadContent.isValidationSupported
  * @function
  * @returns {boolean} True if the typeahead container can be used for input validation
  * @private
  * @ui5-restricted sap.ui.mdc.valuehelp.ITypeaheadContainer
  */

 /**
  * Defines if the typeahead containers values can be navigated without visibly opening the help
  *
  * @name sap.ui.mdc.valuehelp.ITypeaheadContent.shouldOpenOnNavigate
  * @function
  * @returns {boolean} If <code>true</code>, the value help should open when user used the arrow keys in the connected field control
  * @private
  * @ui5-restricted sap.ui.mdc.valuehelp.ITypeaheadContainer
  */

 /**
  * Defines if the typeahead content desires opening the typeahead whenever a user clicks on a connected control
  *
  * @name sap.ui.mdc.valuehelp.ITypeaheadContent.shouldOpenOnClick
  * @function
  * @returns {boolean} If <code>true</code>, the value help should open when user clicks into the connected field control
  * @private
  * @ui5-restricted sap.ui.mdc.valuehelp.ITypeaheadContainer
  */

 /**
  * The focus visualization of the field help needs to be removed as the user starts typing into the source control.
  * @name sap.ui.mdc.valuehelp.ITypeaheadContent.removeVisualFocus
  * @function
  * @private
  * @ui5-restricted sap.ui.mdc.valuehelp.ITypeaheadContainer
  */

 /**
  * The focus visualization of the field help needs to be set as the user starts naigation into the value help items.
  * @name sap.ui.mdc.valuehelp.ITypeaheadContent.setVisualFocus
  * @function
  * @private
  * @ui5-restricted sap.ui.mdc.valuehelp.ITypeaheadContainer
  * @since 1.127.0
  */


 /**
  *
  * Interface for valuehelp {@link sap.ui.mdc.valuehelp.base.Container Containers} supporting typeahead functionality
  *
  *
  * @since 1.95
  * @name sap.ui.mdc.valuehelp.ITypeaheadContainer
  * @interface
  * @private
  * @ui5-restricted sap.ui.mdc.ValueHelp
  */

 /**
  * This event is fired if the change is cancelled.
  *
  * @name sap.ui.mdc.valuehelp.ITypeaheadContainer.cancel
  * @event
  * @param {sap.ui.base.Event} oControlEvent
  * @param {sap.ui.base.EventProvider} oControlEvent.getSource
  * @private
  * @ui5-restricted sap.ui.mdc.ValueHelp
  */

 /**
  * This event is fired if a change of the value help is confirmed.
  *
  * @name sap.ui.mdc.valuehelp.ITypeaheadContainer.confirm
  * @event
  * @param {sap.ui.base.Event} oControlEvent
  * @param {sap.ui.base.EventProvider} oControlEvent.getSource
  * @param {object} oControlEvent.getParameters
  * @param {boolean} oControlEvent.getParameters.close <code>true</code> if the value help needs to be closed
  * @private
  * @ui5-restricted sap.ui.mdc.ValueHelp
  */

 /**
  * This event is fired if the container requests the delegate content.
  *
  * @name sap.ui.mdc.valuehelp.ITypeaheadContainer.requestDelegateContent
  * @event
  * @param {sap.ui.base.Event} oControlEvent
  * @param {sap.ui.base.EventProvider} oControlEvent.getSource
  * @param {object} oControlEvent.getParameters
  * @param {string} oControlEvent.getParameters.contentId Content wrapper ID for which contents are requested
  * @private
  * @ui5-restricted sap.ui.mdc.ValueHelp
  */

 /**
  * This event is fired if the selected condition has changed.
  *
  * @name sap.ui.mdc.valuehelp.ITypeaheadContainer.select
  * @event
  * @param {sap.ui.base.Event} oControlEvent
  * @param {sap.ui.base.EventProvider} oControlEvent.getSource
  * @param {object} oControlEvent.getParameters
  * @param {sap.ui.mdc.enums.ValueHelpSelectionType} oControlEvent.getParameters.type Type of the selection change (add, remove)
  * @param {object[]} oControlEvent.getParameters.conditions Changed conditions <br> <b>Note:</b> A condition must have the structure of {@link sap.ui.mdc.condition.ConditionObject ConditionObject}.
  * @private
  * @ui5-restricted sap.ui.mdc.ValueHelp
  */

 /**
  * This event is fired if the value help is opened.
  *
  * @name sap.ui.mdc.valuehelp.ITypeaheadContainer.opened
  * @event
  * @param {sap.ui.base.Event} oControlEvent
  * @param {sap.ui.base.EventProvider} oControlEvent.getSource
  * @param {object} oControlEvent.getParameters
  * @param {string} oControlEvent.getParameters.itemId ID of the initially selected item
  * @private
  * @ui5-restricted sap.ui.mdc.ValueHelp
  */

 /**
  * This event is fired if the value help is closed.
  *
  * @name sap.ui.mdc.valuehelp.ITypeaheadContainer.closed
  * @event
  * @param {sap.ui.base.Event} oControlEvent
  * @param {sap.ui.base.EventProvider} oControlEvent.getSource
  * @private
  * @ui5-restricted sap.ui.mdc.ValueHelp
  */

 /**
  * Opens the container
  *
  * @name sap.ui.mdc.valuehelp.ITypeaheadContainer.open
  * @function
  * @param {Promise} oValueHelpContentPromise Promise for content request
  * @param {boolean} bTypeahead Flag indicating whether the container is opened as type-ahead or dialog-like help
  * @returns {Promise} This promise resolves after the container completely opened.
  * @private
  * @ui5-restricted sap.ui.mdc.ValueHelp
  */

 /**
  * Closes the container
  *
  * @name sap.ui.mdc.valuehelp.ITypeaheadContainer.close
  * @function
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
  * @function
  * @param {sap.ui.mdc.valuehelp.base.ItemForValueConfiguration} oConfig Configuration
  * @returns {Promise<sap.ui.mdc.valuehelp.ValueHelpItem>} Promise returning object containing description, key and payload.
  * @throws {sap.ui.model.FormatException|sap.ui.model.ParseException} if entry is not found or not unique
  * @private
  * @ui5-restricted sap.ui.mdc.ValueHelp
  */

 /**
  * Navigates the typeaheads values (optional)
  *
  * As this could be asyncronous as data might be loaded a promise is returned.
  *
  * @name sap.ui.mdc.valuehelp.ITypeaheadContainer.navigate
  * @function
  * @param {int} iStep Number of steps for navigation (e.g. 1 means next item, -1 means previous item)
  * @returns {Promise<object>} Promise fulfilled after navigation is evecuted
  * @private
  * @ui5-restricted sap.ui.mdc.ValueHelp
  */

 /**
  * This optional event is fired if a navigation has been executed in the content of the container.
  *
  * @name sap.ui.mdc.valuehelp.ITypeaheadContainer.navigated
  * @event
  * @param {sap.ui.base.Event} oControlEvent
  * @param {sap.ui.base.EventProvider} oControlEvent.getSource
  * @param {object} oControlEvent.getParameters
  * @param {boolean} oControlEvent.getParameters.leaveFocus Indicates that the source control should be focused again
  * @param {object} oControlEvent.getParameters.condition Provides the target condition of the navigation <br> <b>Note:</b> A condition must have the structure of {@link sap.ui.mdc.condition.ConditionObject ConditionObject}.
  * @param {string} oControlEvent.getParameters.itemId Provides the navigated item's ID (used for ARIA attributes)
  * @param {boolean} oControlEvent.getParameters.caseSensitive If <code>true</code> the filtering was executed case sensitive
  * @private
  * @ui5-restricted sap.ui.mdc.ValueHelp
  */

 /**
  * This optional event is fired after a suggested item for type-ahead has been found.
  *
  * @name sap.ui.mdc.valuehelp.ITypeaheadContainer.typeaheadSuggested
  * @event
  * @param {sap.ui.base.Event} oControlEvent
  * @param {sap.ui.base.EventProvider} oControlEvent.getSource
  * @param {object} oControlEvent.getParameters
  * @param {object} oControlEvent.getParameters.condition Provides the target condition of the suggested item. <br> <b>Note:</b> A condition must have the structure of {@link sap.ui.mdc.condition.ConditionObject ConditionObject}
  * @param {string} oControlEvent.getParameters.filterValue Provides the used filter value. (as the event might be fired asynchronously, and the current user input might have changed.)
  * @param {string} oControlEvent.getParameters.itemId Provides the ID of the suggested item (used for ARIA attributes)
  * @param {string} oControlEvent.getParameters.items Provides number of found items
  * @param {boolean} oControlEvent.getParameters.caseSensitive If <code>true</code> the filtering was executed case sensitive
  * @private
  * @ui5-restricted sap.ui.mdc.ValueHelp
  * @since 1.120.0
  */

 /**
  * This optional event can be fired by typaehead contents also supporting dialog mode.
  *
  * @name sap.ui.mdc.valuehelp.ITypeaheadContainer.requestSwitchToDialog
  * @event
  * @param {sap.ui.base.Event} oControlEvent
  * @param {sap.ui.base.EventProvider} oControlEvent.getSource
  * @private
  * @ui5-restricted sap.ui.mdc.ValueHelp
  */

 /**
  * This optional event is fired if the visual focus is set to the value help.
  *
  * In this case the visual focus needs to be removed from the opening field, but the real focus must stay there.
  *
  * @name sap.ui.mdc.valuehelp.ITypeaheadContainer.visualFocusSet
  * @event
  * @param {sap.ui.base.Event} oControlEvent
  * @param {sap.ui.base.EventProvider} oControlEvent.getSource
  * @private
  * @ui5-restricted sap.ui.mdc.ValueHelp
  * @since 1.127.0
  */

 /**
  If the container is used for type-ahead it might be wanted that the same content should also be shown as valuehelp. If not, the field should not show a valuehelp icon.
  *
  * @name sap.ui.mdc.valuehelp.ITypeaheadContainer.getUseAsValueHelp
  * @function
  * @returns {boolean} <code>true</code> if the typeahead content can be used as value help
  * @private
  * @ui5-restricted sap.ui.mdc.ValueHelp
  */

 /**
  * Defines if the typeahead can be used for input validation.
  *
  * @name sap.ui.mdc.valuehelp.ITypeaheadContainer.isValidationSupported
  * @function
  * @returns {boolean} True if the typeahead container can be used for input validation
  * @private
  * @ui5-restricted sap.ui.mdc.ValueHelp
  */

 /**
  * Defines if the typeahead containers values can be navigated without visibly opening the help
  *
  * @name sap.ui.mdc.valuehelp.ITypeaheadContainer.shouldOpenOnNavigate
  * @function
  * @returns {boolean} If <code>true</code>, the value help should open when user used the arrow keys in the connected field control
  * @private
  * @ui5-restricted sap.ui.mdc.ValueHelp
  */

 /**
  * Defines if the typeahead container desires to be opened whenever a user focuses a connected control
  *
  * @name sap.ui.mdc.valuehelp.ITypeaheadContainer.shouldOpenOnFocus
  * @function
  * @returns {Promise<boolean>} If <code>true</code>, the value help should open when user focuses the connected field control
  * @private
  * @ui5-restricted sap.ui.mdc.ValueHelp
  */

 /**
  * Defines if the typeahead container desires to be opened whenever a user clicks on a connected control
  *
  * @name sap.ui.mdc.valuehelp.ITypeaheadContainer.shouldOpenOnClick
  * @function
  * @returns {Promise<boolean>} If <code>true</code>, the value help should open when user clicks into the connected field control
  * @private
  * @ui5-restricted sap.ui.mdc.ValueHelp
  */

 /**
  * The focus visualization of the field help needs to be removed as the user starts typing into the source control.
  * @name sap.ui.mdc.valuehelp.ITypeaheadContainer.removeVisualFocus
  * @function
  * @private
  * @ui5-restricted sap.ui.mdc.ValueHelp
  */

 /**
  * The focus visualization of the field help needs to be set as the user starts naigation into the value help items.
  * @name sap.ui.mdc.valuehelp.ITypeaheadContainer.setVisualFocus
  * @function
  * @private
  * @ui5-restricted sap.ui.mdc.ValueHelp
  */


 /**
  *
  * Interface for valuehelp containers / contents supporting dialog functionality
  *
  * @since 1.95
  * @name sap.ui.mdc.valuehelp.IDialogContent
  * @interface
  * @borrows sap.ui.mdc.valuehelp.ITypeaheadContent.isMultiSelect as #isMultiSelect
  * @private
  * @ui5-restricted sap.ui.mdc.valuehelp.IDialogContainer
  */

 /**
  * This event is fired if the change is cancelled.
  *
  * @name sap.ui.mdc.valuehelp.IDialogContent.cancel
  * @event
  * @param {sap.ui.base.Event} oControlEvent
  * @param {sap.ui.base.EventProvider} oControlEvent.getSource
  * @private
  * @ui5-restricted sap.ui.mdc.valuehelp.IDialogContainer
  */

 /**
  * This event is fired if a change of the content is confirmed.
  *
  * @name sap.ui.mdc.valuehelp.IDialogContent.confirm
  * @event
  * @param {sap.ui.base.Event} oControlEvent
  * @param {sap.ui.base.EventProvider} oControlEvent.getSource
  * @param {object} oControlEvent.getParameters
  * @param {boolean} oControlEvent.getParameters.close <code>true</code> if the value help needs to be closed
  * @private
  * @ui5-restricted sap.ui.mdc.valuehelp.IDialogContainer
  */

 /**
  * This event is fired if the selected condition has changed.
  *
  * @name sap.ui.mdc.valuehelp.IDialogContent.select
  * @event
  * @param {sap.ui.base.Event} oControlEvent
  * @param {sap.ui.base.EventProvider} oControlEvent.getSource
  * @param {object} oControlEvent.getParameters
  * @param {sap.ui.mdc.enums.ValueHelpSelectionType} oControlEvent.getParameters.type Type of the selection change (add, remove)
  * @param {object[]} oControlEvent.getParameters.conditions Changed conditions <br> <b>Note:</b> A condition must have the structure of {@link sap.ui.mdc.condition.ConditionObject ConditionObject}.
  * @private
  * @ui5-restricted sap.ui.mdc.valuehelp.IDialogContainer
  */

 /**
  *
  * Returns number of relevant conditions for this content
  *
  * @name sap.ui.mdc.valuehelp.IDialogContent.getCount
  * @function
  * @param {sap.ui.mdc.condition.ConditionObject[]} aConditions Array of conditions
  * @returns {number} Number of relevant conditions
  * @private
  * @ui5-restricted sap.ui.mdc.valuehelp.IDialogContainer
  */

 /**
  * Returns a title for the given Content
  *
  * @name sap.ui.mdc.valuehelp.IDialogContent.getTitle
  * @function
  * @returns {string} Content title as string
  * @private
  * @ui5-restricted sap.ui.mdc.valuehelp.IDialogContainer
  */

 /*
  * Returns info if the given content is in multi select mode
  *
  * @name sap.ui.mdc.valuehelp.IDialogContent.isMultiSelect
  * @function
  * @returns {boolean} <code>true</code> if multi-selection is active.
  * @private
  * @ui5-restricted sap.ui.mdc.valuehelp.IDialogContainer
  */

 /**
  * Loads additional dependencies, creates and returns displayed content.
  * @name sap.ui.mdc.valuehelp.IDialogContent.getContent
  * @function
  * @returns {Promise<sap.ui.core.Control>} Promise resolving in displayed content
  * @private
  * @ui5-restricted sap.ui.mdc.valuehelp.IDialogContainer
  */


 /**
  *
  * Interface for valuehelp containers shown on a dialog
  *
  * @since 1.95
  * @name sap.ui.mdc.valuehelp.IDialogContainer
  * @interface
  * @private
  * @ui5-restricted sap.ui.mdc.ValueHelp
  */

 /**
  * This event is fired if the change is cancelled.
  *
  * @name sap.ui.mdc.valuehelp.IDialogContainer.cancel
  * @event
  * @param {sap.ui.base.Event} oControlEvent
  * @param {sap.ui.base.EventProvider} oControlEvent.getSource
  * @private
  * @ui5-restricted sap.ui.mdc.ValueHelp
  */

 /**
  * This event is fired if a change of the value help is confirmed.
  *
  * @name sap.ui.mdc.valuehelp.IDialogContainer.confirm
  * @event
  * @param {sap.ui.base.Event} oControlEvent
  * @param {sap.ui.base.EventProvider} oControlEvent.getSource
  * @param {object} oControlEvent.getParameters
  * @param {boolean} oControlEvent.getParameters.close <code>true</code> if the value help needs to be closed
  * @private
  * @ui5-restricted sap.ui.mdc.ValueHelp
  */

 /**
  * This event is fired if the container requests the delegate content.
  *
  * @name sap.ui.mdc.valuehelp.IDialogContainer.requestDelegateContent
  * @event
  * @param {sap.ui.base.Event} oControlEvent
  * @param {sap.ui.base.EventProvider} oControlEvent.getSource
  * @param {object} oControlEvent.getParameters
  * @param {string} oControlEvent.getParameters.contentId Content wrapper ID for which contents are requested
  * @private
  * @ui5-restricted sap.ui.mdc.ValueHelp
  */

 /**
  * This event is fired if the selected condition has changed.
  *
  * @name sap.ui.mdc.valuehelp.IDialogContainer.select
  * @event
  * @param {sap.ui.base.Event} oControlEvent
  * @param {sap.ui.base.EventProvider} oControlEvent.getSource
  * @param {object} oControlEvent.getParameters
  * @param {sap.ui.mdc.enums.ValueHelpSelectionType} oControlEvent.getParameters.type Type of the selection change (add, remove)
  * @param {object[]} oControlEvent.getParameters.conditions Changed conditions <br> <b>Note:</b> A condition must have the structure of {@link sap.ui.mdc.condition.ConditionObject ConditionObject}.
  * @private
  * @ui5-restricted sap.ui.mdc.ValueHelp
  */

 /**
  * This event is fired if the value help is opened.
  *
  * @name sap.ui.mdc.valuehelp.IDialogContainer.opened
  * @event
  * @param {sap.ui.base.Event} oControlEvent
  * @param {sap.ui.base.EventProvider} oControlEvent.getSource
  * @param {object} oControlEvent.getParameters
  * @param {string} oControlEvent.getParameters.itemId ID of the initially selected item
  * @private
  * @ui5-restricted sap.ui.mdc.ValueHelp
  */

 /**
  * This event is fired if the value help is closed.
  *
  * @name sap.ui.mdc.valuehelp.IDialogContainer.closed
  * @event
  * @param {sap.ui.base.Event} oControlEvent
  * @param {sap.ui.base.EventProvider} oControlEvent.getSource
  * @private
  * @ui5-restricted sap.ui.mdc.ValueHelp
  */

 /**
  * Opens the container
  *
  * @name sap.ui.mdc.valuehelp.IDialogContainer.open
  * @function
  * @param {Promise} oValueHelpContentPromise Promise for content request
  * @param {boolean} bTypeahead Flag indicating whether the container is opened as type-ahead or dialog-like help
  * @returns {Promise} This promise resolves after the container completely opened.
  * @private
  * @ui5-restricted sap.ui.mdc.ValueHelp
  */

 /**
  * Closes the container
  *
  * @name sap.ui.mdc.valuehelp.IDialogContainer.close
  * @function
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
  * @returns {map} a map containing the conditions as used in the {@link sap.ui.mdc.FilterBar}
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