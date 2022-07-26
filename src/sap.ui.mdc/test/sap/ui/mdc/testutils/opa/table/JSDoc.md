## Objects

<dl>
<dt><a href="#onTheMDCTable">onTheMDCTable</a> : <code>object</code></dt>
<dd></dd>
</dl>

## Typedefs

<dl>
<dt><a href="#FilterPersonalizationConfiguration">FilterPersonalizationConfiguration</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#GroupPersonalizationConfiguration">GroupPersonalizationConfiguration</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#SortPersonalizationConfiguration">SortPersonalizationConfiguration</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#FilterPersonalizationConfiguration">FilterPersonalizationConfiguration</a> : <code>object</code></dt>
<dd></dd>
</dl>

<a name="onTheMDCTable"></a>

## onTheMDCTable : <code>object</code>
**Kind**: global namespace  

* [onTheMDCTable](#onTheMDCTable) : <code>object</code>
    * [.iPersonalizeFilter(oControl, aSettings, fnOpen, bCancel)](#onTheMDCTable.iPersonalizeFilter) ⇒ <code>Promise</code>
    * [.iPersonalizeGroup(oControl, aSettings, fnOpenThePersonalizationDialog)](#onTheMDCTable.iPersonalizeGroup) ⇒ <code>Promise</code>
    * [.iPersonalizeColumns(oControl, aItems, fnOpenThePersonalizationDialog)](#onTheMDCTable.iPersonalizeColumns) ⇒ <code>Promise</code>
    * [.iPersonalizeSort(oControl, aSettings, fnOpenThePersonalizationDialog)](#onTheMDCTable.iPersonalizeSort) ⇒ <code>Promise</code>
    * [.iResetThePersonalization(oControl, fnOpenThePersonalizationDialog)](#onTheMDCTable.iResetThePersonalization) ⇒ <code>Promise</code>
    * [.iShouldSeeTheTableHeader(sName)](#onTheMDCTable.iShouldSeeTheTableHeader) ⇒ <code>Promise</code>
    * [.iShouldSeeRowsWithData(iAmountOfRows)](#onTheMDCTable.iShouldSeeRowsWithData) ⇒ <code>Promise</code>
    * [.iShouldSeeARowWithData(iIndexOfRow, aExpectedData)](#onTheMDCTable.iShouldSeeARowWithData) ⇒ <code>Promise</code>
    * [.iCheckFilterPersonalization(oControl, aConfigurations, fnOpenThePersonalizationDialog)](#onTheMDCTable.iCheckFilterPersonalization) ⇒ <code>Promise</code>
    * [.iCheckAvailableFilters(oControl, aFilters)](#onTheMDCTable.iCheckAvailableFilters) ⇒ <code>Promise</code>

<a name="onTheMDCTable.iPersonalizeFilter"></a>

### onTheMDCTable.iPersonalizeFilter(oControl, aSettings, fnOpen, bCancel) ⇒ <code>Promise</code>
OPA5 test action
1. Opens the personalization dialog of a given table.
2. Executes the given <code>FilterPersonalizationConfiguration</code>.
3. Closes the personalization dialog.

**Kind**: static method of [<code>onTheMDCTable</code>](#onTheMDCTable)  
**Returns**: <code>Promise</code> - OPA waitFor  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| oControl | <code>sap.ui.core.Control</code> \| <code>string</code> | Instance / ID of the <code>Control</code> that is filtered |
| aSettings | [<code>Array.&lt;FilterPersonalizationConfiguration&gt;</code>](#FilterPersonalizationConfiguration) | Array containing the filter personalization configuration objects |
| fnOpen | <code>function</code> | A function that opens the personalization dialog of the given control |
| bCancel | <code>boolean</code> | Cancel the personalization dialog after the configuration has been done instead of confirming it |

<a name="onTheMDCTable.iPersonalizeGroup"></a>

### onTheMDCTable.iPersonalizeGroup(oControl, aSettings, fnOpenThePersonalizationDialog) ⇒ <code>Promise</code>
Opa5 test action:
1. Opens the personalization dialog of a given table.
2. Executes the given <code>GroupPersonalizationConfiguration</code>.
3. Closes the personalization dialog.

**Kind**: static method of [<code>onTheMDCTable</code>](#onTheMDCTable)  
**Returns**: <code>Promise</code> - Opa waitFor  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| oControl | <code>sap.ui.core.Control</code> \| <code>string</code> | Instance / ID of the control that is reset |
| aSettings | [<code>Array.&lt;GroupPersonalizationConfiguration&gt;</code>](#GroupPersonalizationConfiguration) | An array containing the group personalization configuration objects |
| fnOpenThePersonalizationDialog | <code>function</code> | A function that opens the personalization dialog of the given control |

<a name="onTheMDCTable.iPersonalizeColumns"></a>

### onTheMDCTable.iPersonalizeColumns(oControl, aItems, fnOpenThePersonalizationDialog) ⇒ <code>Promise</code>
OPA5 test action
1. Opens the personalization dialog of a given table.
2. Selects all columns determined by the given labels. Also deselects all other columns that are selected but not included in the given labels.
3. Closes the personalization dialog.

**Kind**: static method of [<code>onTheMDCTable</code>](#onTheMDCTable)  
**Returns**: <code>Promise</code> - Opa waitFor  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| oControl | <code>sap.ui.core.Control</code> \| <code>string</code> | Instance / ID of the control that is personalized |
| aItems | <code>Array.&lt;string&gt;</code> | Array containing the labels of the columns that are the result of the personalization |
| fnOpenThePersonalizationDialog | <code>function</code> | A function that opens the personalization dialog of the given control |

<a name="onTheMDCTable.iPersonalizeSort"></a>

### onTheMDCTable.iPersonalizeSort(oControl, aSettings, fnOpenThePersonalizationDialog) ⇒ <code>Promise</code>
OPA5 test action
1. Opens the personalization dialog of a given table.
2. Executes the given <code>SortPersonalizationConfiguration</code>.
3. Closes the personalization dialog.

**Kind**: static method of [<code>onTheMDCTable</code>](#onTheMDCTable)  
**Returns**: <code>Promise</code> - OPA waitFor  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| oControl | <code>sap.ui.core.Control</code> \| <code>string</code> | Instance / ID of the <code>Control</code> that is sorted |
| aSettings | [<code>Array.&lt;SortPersonalizationConfiguration&gt;</code>](#SortPersonalizationConfiguration) | Array containing the sort personalization configuration objects |
| fnOpenThePersonalizationDialog | <code>function</code> | A function that opens the personalization dialog of the given control |

<a name="onTheMDCTable.iResetThePersonalization"></a>

### onTheMDCTable.iResetThePersonalization(oControl, fnOpenThePersonalizationDialog) ⇒ <code>Promise</code>
Opa5 test action
1. Opens the personalization dialog of a given table.
2. Presses the Reset personalization button.
3. Confirms the Reset dialog.
4. Closes the personalization dialog.

**Kind**: static method of [<code>onTheMDCTable</code>](#onTheMDCTable)  
**Returns**: <code>Promise</code> - OPA waitFor  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| oControl | <code>sap.ui.core.Control</code> \| <code>string</code> | Instance / ID of the <code>Control</code> that is reset |
| fnOpenThePersonalizationDialog | <code>function</code> | A function that opens the personalization dialog of the <code>mdc.Link</code> |

<a name="onTheMDCTable.iShouldSeeTheTableHeader"></a>

### onTheMDCTable.iShouldSeeTheTableHeader(sName) ⇒ <code>Promise</code>
Opa5 test assertion
1. Asserts that there is a <code>sap.ui.mdc.Table</code>.
2. Asserts that the table is parent of a <code>sap.m.Title</code> with given text property.

**Kind**: static method of [<code>onTheMDCTable</code>](#onTheMDCTable)  
**Returns**: <code>Promise</code> - OPA waitFor  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| sName | <code>string</code> | expected value of the <code>sap.m.Title</code> text property |

<a name="onTheMDCTable.iShouldSeeRowsWithData"></a>

### onTheMDCTable.iShouldSeeRowsWithData(iAmountOfRows) ⇒ <code>Promise</code>
Opa5 test assertion
1. Asserts that there is a <code>sap.ui.mdc.Table</code>.
2. Asserts that the table is parent of a defined number of <code>sap.m.ColumnListItem</code> controls.

**Kind**: static method of [<code>onTheMDCTable</code>](#onTheMDCTable)  
**Returns**: <code>Promise</code> - OPA waitFor  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| iAmountOfRows | <code>integer</code> | Number of <code>sap.m.ColumnListItem</code> controls which the table is a parent of |

<a name="onTheMDCTable.iShouldSeeARowWithData"></a>

### onTheMDCTable.iShouldSeeARowWithData(iIndexOfRow, aExpectedData) ⇒ <code>Promise</code>
Opa5 test assertion
1. Asserts that there is a <code>sap.ui.mdc.Table</code>.
2. Asserts that the table is parent of a <code>sap.m.ColumnListItem</code>.
3. Checks if the value of all cells inside the <code>sap.m.ColumnListItem</code> equals the expected data.

**Kind**: static method of [<code>onTheMDCTable</code>](#onTheMDCTable)  
**Returns**: <code>Promise</code> - OPA waitFor  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| iIndexOfRow | <code>integer</code> | Index of the <code>sap.m.ColumnListItem</code> in question |
| aExpectedData | <code>Array.&lt;Object&gt;</code> | Array containing the values of the cells inside the <code>sap.m.ColumnListItem</code> |

<a name="onTheMDCTable.iCheckFilterPersonalization"></a>

### onTheMDCTable.iCheckFilterPersonalization(oControl, aConfigurations, fnOpenThePersonalizationDialog) ⇒ <code>Promise</code>
OPA5 test assertion
1. Opens the personalization dialog of a given table.
2. Executes the given <code>FilterPersonalizationConfiguration</code>.
3. Closes the personalization dialog.

**Kind**: static method of [<code>onTheMDCTable</code>](#onTheMDCTable)  
**Returns**: <code>Promise</code> - OPA waitFor  

| Param | Type | Description |
| --- | --- | --- |
| oControl | <code>sap.ui.core.Control</code> \| <code>string</code> | Instance / ID of the <code>Control</code> that is filtered |
| aConfigurations | [<code>Array.&lt;FilterPersonalizationConfiguration&gt;</code>](#FilterPersonalizationConfiguration) | Array containing the filter personalization configuration objects |
| fnOpenThePersonalizationDialog | <code>function</code> | a function which opens the personalization dialog of the given control |

<a name="onTheMDCTable.iCheckAvailableFilters"></a>

### onTheMDCTable.iCheckAvailableFilters(oControl, aFilters) ⇒ <code>Promise</code>
OPA5 test assertion
1. Opens the personalization dialog of a given table.
2. Checks the availability of the provided filter texts (by opening and comparing the available items in the ComboBox)
3. Closes the personalization dialog.

**Kind**: static method of [<code>onTheMDCTable</code>](#onTheMDCTable)  
**Returns**: <code>Promise</code> - OPA waitFor  

| Param | Type | Description |
| --- | --- | --- |
| oControl | <code>sap.ui.core.Control</code> \| <code>string</code> | Instance / ID of the <code>Control</code> that is filtered |
| aFilters | <code>Array.&lt;string&gt;</code> | Array containing the names of selectable filters |

<a name="FilterPersonalizationConfiguration"></a>

## FilterPersonalizationConfiguration : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| key | <code>string</code> | Key of the value that is the result of the personalization |
| operator | <code>string</code> | Operator defining how the items are filtered |
| values | <code>Array.&lt;string&gt;</code> | Filter values for the given operator |
| inputControl | <code>string</code> | <code>Control</code> that is used as input for the value |

<a name="GroupPersonalizationConfiguration"></a>

## GroupPersonalizationConfiguration : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| key | <code>string</code> | of the item that is the result of the personalization |
| showFieldAsColumn | <code>boolean</code> | Determines if the Show Field as Column checkbox is checked |

<a name="SortPersonalizationConfiguration"></a>

## SortPersonalizationConfiguration : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| key | <code>string</code> | Key of the item that is the result of the personalization |
| descending | <code>boolean</code> | Determines whether the sort direction is descending |

<a name="FilterPersonalizationConfiguration"></a>

## FilterPersonalizationConfiguration : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| key | <code>string</code> | Key of the value that is the result of the personalization |
| operator | <code>string</code> | Operator defining how the items are filtered |
| values | <code>Array.&lt;string&gt;</code> | Filter values for the given operator |
| inputControl | <code>string</code> | <code>Control</code> that is used as input for the value |

