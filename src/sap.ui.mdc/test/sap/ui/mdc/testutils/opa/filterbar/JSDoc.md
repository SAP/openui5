<a name="onTheMDCFilterBar"></a>

## onTheMDCFilterBar : <code>object</code>
**Kind**: global namespace  

* [onTheMDCFilterBar](#onTheMDCFilterBar) : <code>object</code>
    * [.iPersonalizeFilter(oFilterBar, oSettings)](#onTheMDCFilterBar.iPersonalizeFilter) ⇒ <code>Promise</code>
    * [.iResetThePersonalization(oFilterBar)](#onTheMDCFilterBar.iResetThePersonalization) ⇒ <code>Promise</code>
    * [.iExpectSearch(oFilterBar)](#onTheMDCFilterBar.iExpectSearch) ⇒ <code>Promise</code>
    * [.iEnterFilterValue(oFilterBar, mSettings)](#onTheMDCFilterBar.iEnterFilterValue) ⇒ <code>Promise</code>
    * [.iClearFilterValue(oFilterBar, sFilterLabel)](#onTheMDCFilterBar.iClearFilterValue) ⇒ <code>Promise</code>
    * [.iPressOnTheAdaptFiltersButton()](#onTheMDCFilterBar.iPressOnTheAdaptFiltersButton) ⇒ <code>Promise</code>
    * [.iShouldSeeFilters(oFilterBar, vSettings)](#onTheMDCFilterBar.iShouldSeeFilters) ⇒ <code>Promise</code>
    * [.iShouldSeeTheFilterBar()](#onTheMDCFilterBar.iShouldSeeTheFilterBar) ⇒ <code>Promise</code>
    * [.iShouldSeeTheFilterFieldsWithLabels(aLabelNames)](#onTheMDCFilterBar.iShouldSeeTheFilterFieldsWithLabels) ⇒ <code>Promise</code>
    * [.iShouldSeeTheAdaptFiltersButton()](#onTheMDCFilterBar.iShouldSeeTheAdaptFiltersButton) ⇒ <code>Promise</code>

<a name="onTheMDCFilterBar.iPersonalizeFilter"></a>

### onTheMDCFilterBar.iPersonalizeFilter(oFilterBar, oSettings) ⇒ <code>Promise</code>
OPA5 test action
<ol>
	<li>
		Opens the personalization dialog of the given <code>sap.ui.mdc.FilterBar</code>.
	</li>
 <li>
		Navigates to the Group tab.
	</li>
	<li>
		Opens all groups and selects / deselects all filter fields depending on <code>oSettings</code>. Only the labels defined in <code>oSettings</code> will be selected, others will be deselected.
	</li>
	<li>
		Closes the personalization dialog.
	</li>
</ol>

**Kind**: static method of [<code>onTheMDCFilterBar</code>](#onTheMDCFilterBar)  
**Returns**: <code>Promise</code> - OPA waitFor  

| Param | Type | Description |
| --- | --- | --- |
| oFilterBar | <code>sap.ui.core.Control</code> \| <code>string</code> | Instance / ID of the <code>sap.ui.mdc.FilterBar</code> that is filtered |
| oSettings | <code>Object</code> | Map containing the settings for the filter personalization. Key is the label of the given group in the <code>sap.ui.mdc.FilterBar</code> personalization dialog, and value is an array containing the labels of the <code>FilterField</code> |

<a name="onTheMDCFilterBar.iResetThePersonalization"></a>

### onTheMDCFilterBar.iResetThePersonalization(oFilterBar) ⇒ <code>Promise</code>
OPA5 test action
<ol>
	<li>
		Opens the personalization dialog of the given <code>sap.ui.mdc.FilterBar</code>.
	</li>
	<li>
		Presses the Reset personalization button.
	</li>
	<li>
		Confirms the Reset dialog.
	</li>
	<li>
		Closes the personalization dialog.
	</li>
</ol>

**Kind**: static method of [<code>onTheMDCFilterBar</code>](#onTheMDCFilterBar)  
**Returns**: <code>Promise</code> - OPA waitFor  

| Param | Type | Description |
| --- | --- | --- |
| oFilterBar | <code>sap.ui.core.Control</code> \| <code>string</code> | Instance / ID of the <code>sap.ui.mdc.FilterBar</code> |

<a name="onTheMDCFilterBar.iExpectSearch"></a>

### onTheMDCFilterBar.iExpectSearch(oFilterBar) ⇒ <code>Promise</code>
OPA5 test action
Presses the Apply Filters button of the <code>sap.ui.mdc.FilterBar</code>.

**Kind**: static method of [<code>onTheMDCFilterBar</code>](#onTheMDCFilterBar)  
**Returns**: <code>Promise</code> - OPA waitFor  

| Param | Type | Description |
| --- | --- | --- |
| oFilterBar | <code>sap.ui.core.Control</code> \| <code>string</code> | Instance / ID of the <code>sap.ui.mdc.FilterBar</code> |

<a name="onTheMDCFilterBar.iEnterFilterValue"></a>

### onTheMDCFilterBar.iEnterFilterValue(oFilterBar, mSettings) ⇒ <code>Promise</code>
OPA5 test action
<ol>
	<li>
		Opens the personalization dialog of the given <code>sap.ui.mdc.FilterBar</code>.
	</li>
	<li>
		Navigates to the Group tab.
	</li>
	<li>
		Opens the given groups and enters all values in the <code>FilterFields</code> depending on <code>oSettings</code>.
	</li>
	<li>
		Closes the personalization dialog.
	</li>
</ol>

**Kind**: static method of [<code>onTheMDCFilterBar</code>](#onTheMDCFilterBar)  
**Returns**: <code>Promise</code> - OPA waitFor  

| Param | Type | Description |
| --- | --- | --- |
| oFilterBar | <code>sap.ui.core.Control</code> \| <code>string</code> | Instance / ID of the <code>sap.ui.mdc.FilterBar</code> |
| mSettings | <code>Object</code> | Map containing the settings for the filter values. Key is the label of the given group in the <code>sap.ui.mdc.FilterBar</code> personalization dialog, and value is an object containing the label of the <code>FilterField</code> and the values that are entered |

<a name="onTheMDCFilterBar.iClearFilterValue"></a>

### onTheMDCFilterBar.iClearFilterValue(oFilterBar, sFilterLabel) ⇒ <code>Promise</code>
OPA5 test action
Clears all values of a <code>FilterField</code> with a given label on the <code>sap.ui.mdc.FilterBar</code>.

**Kind**: static method of [<code>onTheMDCFilterBar</code>](#onTheMDCFilterBar)  
**Returns**: <code>Promise</code> - OPA waitFor  

| Param | Type | Description |
| --- | --- | --- |
| oFilterBar | <code>sap.ui.core.Control</code> \| <code>string</code> | Instance / ID of the <code>sap.ui.mdc.FilterBar</code> |
| sFilterLabel | <code>string</code> | Label of the <code>FilterField</code> |

<a name="onTheMDCFilterBar.iPressOnTheAdaptFiltersButton"></a>

### onTheMDCFilterBar.iPressOnTheAdaptFiltersButton() ⇒ <code>Promise</code>
OPA5 test action
Checks if there is a button visible in the application with the Adapt Filters icon and presses that given button.

**Kind**: static method of [<code>onTheMDCFilterBar</code>](#onTheMDCFilterBar)  
**Returns**: <code>Promise</code> - OPA waitFor  
<a name="onTheMDCFilterBar.iShouldSeeFilters"></a>

### onTheMDCFilterBar.iShouldSeeFilters(oFilterBar, vSettings) ⇒ <code>Promise</code>
OPA5 test assertion
Checks if given filter fields are displayed on a given <code>sap.ui.mdc.FilterBar</code>.
Depending on the <code>vSettings</code> type this function can be used in two different ways:
<ul>
	<li>
		<code>vSettings</code> is an array of strings:
		Checks if all given strings are labels for <code>FilterFields</code> on a given <code>sap.ui.mdc.FilterBar</code>.
	</li>
	<li>
 	<code>vSettings</code> is an object:
		Checks for each key in the object if there is a label for a <code>FilterField</code> of a given <code>sap.ui.mdc.FilterBar</code>.
		The value of that key is an array containing objects with the operators and values that are expected for the given <code>FilterFields</code>.
		If the value is an empty array, the given <code>FilterFields</code> doesn't have a value.
 </li>
</ul>

**Kind**: static method of [<code>onTheMDCFilterBar</code>](#onTheMDCFilterBar)  
**Returns**: <code>Promise</code> - OPA waitFor  

| Param | Type | Description |
| --- | --- | --- |
| oFilterBar | <code>sap.ui.core.Control</code> \| <code>string</code> | Instance / ID of the <code>sap.ui.mdc.FilterBar</code> |
| vSettings | <code>Array.&lt;string&gt;</code> \| <code>Object</code> | Settings in which the expected filters are defined |

<a name="onTheMDCFilterBar.iShouldSeeTheFilterBar"></a>

### onTheMDCFilterBar.iShouldSeeTheFilterBar() ⇒ <code>Promise</code>
OPA5 test assertion
Checks if there is a <code>sap.ui.mdc.FilterBar</code> visible in the application.

**Kind**: static method of [<code>onTheMDCFilterBar</code>](#onTheMDCFilterBar)  
**Returns**: <code>Promise</code> - OPA waitFor  
<a name="onTheMDCFilterBar.iShouldSeeTheFilterFieldsWithLabels"></a>

### onTheMDCFilterBar.iShouldSeeTheFilterFieldsWithLabels(aLabelNames) ⇒ <code>Promise</code>
OPA5 test assertion
Checks if there are filter fields visible in the application with given labels.

**Kind**: static method of [<code>onTheMDCFilterBar</code>](#onTheMDCFilterBar)  
**Returns**: <code>Promise</code> - OPA waitFor  

| Param | Type | Description |
| --- | --- | --- |
| aLabelNames | <code>Array.&lt;string&gt;</code> | Array containing the labels of the expected <code>FilterFields</code> |

<a name="onTheMDCFilterBar.iShouldSeeTheAdaptFiltersButton"></a>

### onTheMDCFilterBar.iShouldSeeTheAdaptFiltersButton() ⇒ <code>Promise</code>
OPA5 test assertion
Checks if there is a button visible in the application with the Adapt Filters icon.

**Kind**: static method of [<code>onTheMDCFilterBar</code>](#onTheMDCFilterBar)  
**Returns**: <code>Promise</code> - OPA waitFor  
