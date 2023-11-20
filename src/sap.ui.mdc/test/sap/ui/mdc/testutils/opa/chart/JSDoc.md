## Objects

<dl>
<dt><a href="#onTheMDCChart">onTheMDCChart</a> : <code>object</code></dt>
<dd></dd>
</dl>

## Typedefs

<dl>
<dt><a href="#ChartPersonalizationConfiguration">ChartPersonalizationConfiguration</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#FilterPersonalizationConfiguration">FilterPersonalizationConfiguration</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#SortPersonalizationConfiguration">SortPersonalizationConfiguration</a> : <code>object</code></dt>
<dd></dd>
</dl>

<a name="onTheMDCChart"></a>

## onTheMDCChart : <code>object</code>
**Kind**: global namespace  

* [onTheMDCChart](#onTheMDCChart) : <code>object</code>
    * [.iPersonalizeChart(oChart, aConfigurations)](#onTheMDCChart.iPersonalizeChart) ⇒ <code>Promise</code>
    * [.iPersonalizeFilter(oControl, aSettings, bCancel)](#onTheMDCChart.iPersonalizeFilter) ⇒ <code>Promise</code>
    * [.iPersonalizeSort(oChart, aConfigurations)](#onTheMDCChart.iPersonalizeSort) ⇒ <code>Promise</code>
    * [.iResetThePersonalization(oChart)](#onTheMDCChart.iResetThePersonalization) ⇒ <code>Promise</code>
    * [.iClickOnZoomIn(sId)](#onTheMDCChart.iClickOnZoomIn) ⇒ <code>Promise</code>
    * [.iClickOnZoomOut(sId)](#onTheMDCChart.iClickOnZoomOut) ⇒ <code>Promise</code>
    * [.iClickOnTheLegendToggleButton(sId)](#onTheMDCChart.iClickOnTheLegendToggleButton) ⇒ <code>Promise</code>
    * [.iClickOnTheSelectionDetailsButton(sId)](#onTheMDCChart.iClickOnTheSelectionDetailsButton) ⇒ <code>Promise</code>
    * [.iClickOnTheDrillDownButton(sId)](#onTheMDCChart.iClickOnTheDrillDownButton) ⇒ <code>Promise</code>
    * [.iClickOnTheChartTypeButton(sId)](#onTheMDCChart.iClickOnTheChartTypeButton) ⇒ <code>Promise</code>
    * [.iClickOnThePersonalisationButton(sId)](#onTheMDCChart.iClickOnThePersonalisationButton) ⇒ <code>Promise</code>
    * [.iSelectChartTypeInPopover(sChartTypeName)](#onTheMDCChart.iSelectChartTypeInPopover) ⇒ <code>Promise</code>
    * [.iClickOnTheBreadcrumbWithName(sName, sId)](#onTheMDCChart.iClickOnTheBreadcrumbWithName) ⇒ <code>Promise</code>
    * [.iSelectANewDrillDimensionInPopover(sDrillName)](#onTheMDCChart.iSelectANewDrillDimensionInPopover) ⇒ <code>Promise</code>
    * [.iSelectTheDatapoint(aDataPoints, sId)](#onTheMDCChart.iSelectTheDatapoint) ⇒ <code>Promise</code>
    * [.iSelectTheCategories(oCategories, sId)](#onTheMDCChart.iSelectTheCategories) ⇒ <code>Promise</code>
    * [.iDrillDownInDimension(sId, sDrillName)](#onTheMDCChart.iDrillDownInDimension) ⇒ <code>Promise</code>
    * [.iSelectAChartType(sId, sChartTypeName)](#onTheMDCChart.iSelectAChartType) ⇒ <code>Promise</code>
    * [.iShouldSeeAChart()](#onTheMDCChart.iShouldSeeAChart) ⇒ <code>Promise</code>
    * [.iShouldSeeALegend(sId)](#onTheMDCChart.iShouldSeeALegend) ⇒ <code>Promise</code>
    * [.iShouldSeeNoLegend(sId)](#onTheMDCChart.iShouldSeeNoLegend) ⇒ <code>Promise</code>
    * [.iShouldSeeAChartTypePopover()](#onTheMDCChart.iShouldSeeAChartTypePopover) ⇒ <code>Promise</code>
    * [.iShouldSeeTheChartWithChartType(sChartId, sChartType)](#onTheMDCChart.iShouldSeeTheChartWithChartType) ⇒ <code>Promise</code>
    * [.iShouldSeeTheDrillStack(aCheckDrillStack, sChartId)](#onTheMDCChart.iShouldSeeTheDrillStack) ⇒ <code>Promise</code>
    * [.iShouldSeeADrillDownPopover()](#onTheMDCChart.iShouldSeeADrillDownPopover) ⇒ <code>Promise</code>
    * [.iShouldSeeADetailsPopover()](#onTheMDCChart.iShouldSeeADetailsPopover) ⇒ <code>Promise</code>
    * [.iShouldSeeVisibleDimensionsInOrder(aDimensions, sId)](#onTheMDCChart.iShouldSeeVisibleDimensionsInOrder) ⇒ <code>Promise</code>
    * [.iShouldSeeVisibleMeasuresInOrder(aMeasures, sId)](#onTheMDCChart.iShouldSeeVisibleMeasuresInOrder) ⇒ <code>Promise</code>
    * [.iCheckFilterPersonalization(oControl, aConfigurations, fnOpenThePersonalizationDialog)](#onTheMDCChart.iCheckFilterPersonalization) ⇒ <code>Promise</code>
    * [.iCheckAvailableFilters(oControl, aFilters)](#onTheMDCChart.iCheckAvailableFilters) ⇒ <code>Promise</code>

<a name="onTheMDCChart.iPersonalizeChart"></a>

### onTheMDCChart.iPersonalizeChart(oChart, aConfigurations) ⇒ <code>Promise</code>
OPA5 test action

**Kind**: static method of [<code>onTheMDCChart</code>](#onTheMDCChart)  
**Returns**: <code>Promise</code> - OPA waitFor
1. Opens the personalization dialog of a given <code>sap.ui.mdc.Chart</code>.
2. Selects a chart type given by <code>sChartType</code>.
3. Executes the given <code>ChartPersonalizationConfigurations</code>.
4. Closes the personalization dialog.  

| Param | Type | Description |
| --- | --- | --- |
| oChart | <code>sap.ui.core.Control</code> \| <code>string</code> | Instance / ID of the <code>MDCChart</code> that is personalized |
| aConfigurations | [<code>Array.&lt;ChartPersonalizationConfiguration&gt;</code>](#ChartPersonalizationConfiguration) | Array containing the chart personalization configuration objects |

<a name="onTheMDCChart.iPersonalizeFilter"></a>

### onTheMDCChart.iPersonalizeFilter(oControl, aSettings, bCancel) ⇒ <code>Promise</code>
OPA5 test action
1. Opens the personalization dialog of a given chart.
2. Executes the given <code>FilterPersonalizationConfiguration</code>.
3. Closes the personalization dialog.

**Kind**: static method of [<code>onTheMDCChart</code>](#onTheMDCChart)  
**Returns**: <code>Promise</code> - OPA waitFor  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| oControl | <code>sap.ui.core.Control</code> \| <code>string</code> | Instance / ID of the <code>Control</code> that is filtered |
| aSettings | [<code>Array.&lt;FilterPersonalizationConfiguration&gt;</code>](#FilterPersonalizationConfiguration) | Array containing the filter personalization configuration objects |
| bCancel | <code>boolean</code> | Cancel the personalization dialog after the configuration has been done instead of confirming it |

<a name="onTheMDCChart.iPersonalizeSort"></a>

### onTheMDCChart.iPersonalizeSort(oChart, aConfigurations) ⇒ <code>Promise</code>
OPA5 test action

**Kind**: static method of [<code>onTheMDCChart</code>](#onTheMDCChart)  
**Returns**: <code>Promise</code> - OPA waitFor
1. Opens the personalization dialog of a given chart.
2. Executes the given <code>SortPersonalizationConfiguration</code>.
3. Closes the personalization dialog.  

| Param | Type | Description |
| --- | --- | --- |
| oChart | <code>sap.ui.core.Control</code> \| <code>string</code> | Instance / ID of the <code>MDCChart</code> that is sorted |
| aConfigurations | [<code>Array.&lt;SortPersonalizationConfiguration&gt;</code>](#SortPersonalizationConfiguration) | Array containing the sort personalization configuration objects |

<a name="onTheMDCChart.iResetThePersonalization"></a>

### onTheMDCChart.iResetThePersonalization(oChart) ⇒ <code>Promise</code>
Opa5 test action

**Kind**: static method of [<code>onTheMDCChart</code>](#onTheMDCChart)  
**Returns**: <code>Promise</code> - OPA waitFor
1. Opens the personalization dialog of a given chart.
2. Presses the Reset personalization button.
3. Confirms the Reset dialog.
4. Closes the personalization dialog.  

| Param | Type | Description |
| --- | --- | --- |
| oChart | <code>sap.ui.core.Control</code> \| <code>string</code> | Instance / ID of the <code>MDCChart</code> that is reset |

<a name="onTheMDCChart.iClickOnZoomIn"></a>

### onTheMDCChart.iClickOnZoomIn(sId) ⇒ <code>Promise</code>
OPA5 test action
Presses the "Zoom In" button in the toolbar of a <code>sap.ui.mdc.Chart</code>.

**Kind**: static method of [<code>onTheMDCChart</code>](#onTheMDCChart)  
**Returns**: <code>Promise</code> - OPA waitFor  

| Param | Type | Description |
| --- | --- | --- |
| sId | <code>string</code> | The ID of the <code>sap.ui.mdc.Chart</code> |

<a name="onTheMDCChart.iClickOnZoomOut"></a>

### onTheMDCChart.iClickOnZoomOut(sId) ⇒ <code>Promise</code>
OPA5 test action
Presses the "Zoom Out" button in the toolbar of a <code>sap.ui.mdc.Chart</code>.

**Kind**: static method of [<code>onTheMDCChart</code>](#onTheMDCChart)  
**Returns**: <code>Promise</code> - OPA waitFor  

| Param | Type | Description |
| --- | --- | --- |
| sId | <code>string</code> | The ID of the <code>sap.ui.mdc.Chart</code> |

<a name="onTheMDCChart.iClickOnTheLegendToggleButton"></a>

### onTheMDCChart.iClickOnTheLegendToggleButton(sId) ⇒ <code>Promise</code>
OPA5 test action
Presses the "Show Legend" toggle button in the toolbar of a <code>sap.ui.mdc.Chart</code>.

**Kind**: static method of [<code>onTheMDCChart</code>](#onTheMDCChart)  
**Returns**: <code>Promise</code> - OPA waitFor  

| Param | Type | Description |
| --- | --- | --- |
| sId | <code>string</code> | The ID of the <code>sap.ui.mdc.Chart</code> |

<a name="onTheMDCChart.iClickOnTheSelectionDetailsButton"></a>

### onTheMDCChart.iClickOnTheSelectionDetailsButton(sId) ⇒ <code>Promise</code>
OPA5 test action
Presses the "Show Details" button in the toolbar of a <code>sap.ui.mdc.Chart</code>.

**Kind**: static method of [<code>onTheMDCChart</code>](#onTheMDCChart)  
**Returns**: <code>Promise</code> - OPA waitFor  

| Param | Type | Description |
| --- | --- | --- |
| sId | <code>\*</code> | The ID of the <code>sap.ui.mdc.Chart</code> |

<a name="onTheMDCChart.iClickOnTheDrillDownButton"></a>

### onTheMDCChart.iClickOnTheDrillDownButton(sId) ⇒ <code>Promise</code>
OPA5 test action
Presses the "Drilldown" button in the toolbar of a <code>sap.ui.mdc.Chart</code>.

**Kind**: static method of [<code>onTheMDCChart</code>](#onTheMDCChart)  
**Returns**: <code>Promise</code> - OPA waitFor  

| Param | Type | Description |
| --- | --- | --- |
| sId | <code>string</code> | The ID of the <code>sap.ui.mdc.Chart</code> |

<a name="onTheMDCChart.iClickOnTheChartTypeButton"></a>

### onTheMDCChart.iClickOnTheChartTypeButton(sId) ⇒ <code>Promise</code>
OPA5 test action
Presses the "Chart Type" button in the toolbar of a <code>sap.ui.mdc.Chart</code>.

**Kind**: static method of [<code>onTheMDCChart</code>](#onTheMDCChart)  
**Returns**: <code>Promise</code> - OPA waitFor  

| Param | Type | Description |
| --- | --- | --- |
| sId | <code>string</code> | The ID of the <code>sap.ui.mdc.Chart</code> |

<a name="onTheMDCChart.iClickOnThePersonalisationButton"></a>

### onTheMDCChart.iClickOnThePersonalisationButton(sId) ⇒ <code>Promise</code>
OPA5 test action
Presses the "Personalization" button in the toolbar of a <code>sap.ui.mdc.Chart</code>.

**Kind**: static method of [<code>onTheMDCChart</code>](#onTheMDCChart)  
**Returns**: <code>Promise</code> - OPA waitFor  

| Param | Type | Description |
| --- | --- | --- |
| sId | <code>string</code> | The ID of the <code>sap.ui.mdc.Chart</code> |

<a name="onTheMDCChart.iSelectChartTypeInPopover"></a>

### onTheMDCChart.iSelectChartTypeInPopover(sChartTypeName) ⇒ <code>Promise</code>
OPA5 test action
Selects a specific chart type for a <code>sap.ui.mdc.Chart</code> in an open chart type popover.

**Kind**: static method of [<code>onTheMDCChart</code>](#onTheMDCChart)  
**Returns**: <code>Promise</code> - OPA waitFor  

| Param | Type | Description |
| --- | --- | --- |
| sChartTypeName | <code>string</code> | The name of the chart type |

<a name="onTheMDCChart.iClickOnTheBreadcrumbWithName"></a>

### onTheMDCChart.iClickOnTheBreadcrumbWithName(sName, sId) ⇒ <code>Promise</code>
OPA5 test action
Presses an drill-down breadcrumb with a given name for a given <code>sap.ui.mdc.Chart</code>.

**Kind**: static method of [<code>onTheMDCChart</code>](#onTheMDCChart)  
**Returns**: <code>Promise</code> - OPA waitFor  

| Param | Type | Description |
| --- | --- | --- |
| sName | <code>string</code> | The name of the breadcrumbs |
| sId | <code>string</code> | The ID of the <code>sap.ui.mdc.Chart</code> |

<a name="onTheMDCChart.iSelectANewDrillDimensionInPopover"></a>

### onTheMDCChart.iSelectANewDrillDimensionInPopover(sDrillName) ⇒ <code>Promise</code>
OPA5 test action
Selects a specific dimension to drill-down for a <code>sap.ui.mdc.Chart</code> in an open chart drill-down popover.

**Kind**: static method of [<code>onTheMDCChart</code>](#onTheMDCChart)  
**Returns**: <code>Promise</code> - OPA waitFor  

| Param | Type | Description |
| --- | --- | --- |
| sDrillName | <code>string</code> | Name of the dimension to which a drill-down takes place |

<a name="onTheMDCChart.iSelectTheDatapoint"></a>

### onTheMDCChart.iSelectTheDatapoint(aDataPoints, sId) ⇒ <code>Promise</code>
OPA5 test action
Selects given data points on a given <code>sap.ui.mdc.Chart</code>.

**Kind**: static method of [<code>onTheMDCChart</code>](#onTheMDCChart)  
**Returns**: <code>Promise</code> - OPA waitFor  

| Param | Type | Description |
| --- | --- | --- |
| aDataPoints | <code>array</code> | Data point objects to select |
| sId | <code>string</code> | The ID of the <code>sap.ui.mdc.Chart</code> |

<a name="onTheMDCChart.iSelectTheCategories"></a>

### onTheMDCChart.iSelectTheCategories(oCategories, sId) ⇒ <code>Promise</code>
OPA5 test action
Selects given categories (dimensions) for the given <code>sap.ui.mdc.Chart</code>.

**Kind**: static method of [<code>onTheMDCChart</code>](#onTheMDCChart)  
**Returns**: <code>Promise</code> - OPA waitFor  

| Param | Type | Description |
| --- | --- | --- |
| oCategories | <code>object</code> | Categories to select |
| sId | <code>string</code> | The ID of the <code>sap.ui.mdc.Chart</code> |

<a name="onTheMDCChart.iDrillDownInDimension"></a>

### onTheMDCChart.iDrillDownInDimension(sId, sDrillName) ⇒ <code>Promise</code>
OPA5 test action
Performs a drill-down on the <code>sap.ui.mdc.Chart</code>

**Kind**: static method of [<code>onTheMDCChart</code>](#onTheMDCChart)  
**Returns**: <code>Promise</code> - OPA waitFor  

| Param | Type | Description |
| --- | --- | --- |
| sId | <code>string</code> | The ID of the <code>sap.ui.mdc.Chart</code> |
| sDrillName | <code>string</code> | Name of the dimension to which a drill-down takes place |

<a name="onTheMDCChart.iSelectAChartType"></a>

### onTheMDCChart.iSelectAChartType(sId, sChartTypeName) ⇒ <code>Promise</code>
OPA5 test action
Performs a drill-down on the <code>sap.ui.mdc.Chart</code>

**Kind**: static method of [<code>onTheMDCChart</code>](#onTheMDCChart)  
**Returns**: <code>Promise</code> - OPA waitFor  

| Param | Type | Description |
| --- | --- | --- |
| sId | <code>string</code> | The ID of the <code>sap.ui.mdc.Chart</code> |
| sChartTypeName | <code>string</code> | Name of the chart type which is to be selected |

<a name="onTheMDCChart.iShouldSeeAChart"></a>

### onTheMDCChart.iShouldSeeAChart() ⇒ <code>Promise</code>
OPA5 assertion
Assertion to check that there is a <code>sap.ui.mdc.Chart</code> visible on the screen.

**Kind**: static method of [<code>onTheMDCChart</code>](#onTheMDCChart)  
**Returns**: <code>Promise</code> - OPA waitFor  
<a name="onTheMDCChart.iShouldSeeALegend"></a>

### onTheMDCChart.iShouldSeeALegend(sId) ⇒ <code>Promise</code>
Assertion to check that there is a legend visible on the screen for a given <code>sap.ui.mdc.Chart</code>.

**Kind**: static method of [<code>onTheMDCChart</code>](#onTheMDCChart)  
**Returns**: <code>Promise</code> - OPA waitFor  

| Param | Type | Description |
| --- | --- | --- |
| sId | <code>string</code> | The ID of the <code>sap.ui.mdc.Chart</code> to be checked for a visible legend |

<a name="onTheMDCChart.iShouldSeeNoLegend"></a>

### onTheMDCChart.iShouldSeeNoLegend(sId) ⇒ <code>Promise</code>
Assertion to check that there is no legend visible on the screen for a given <code>sap.ui.mdc.Chart</code>.

**Kind**: static method of [<code>onTheMDCChart</code>](#onTheMDCChart)  
**Returns**: <code>Promise</code> - OPA waitFor  

| Param | Type | Description |
| --- | --- | --- |
| sId | <code>string</code> | The ID of the <code>sap.ui.mdc.Chart</code> to be checked for a visible legend |

<a name="onTheMDCChart.iShouldSeeAChartTypePopover"></a>

### onTheMDCChart.iShouldSeeAChartTypePopover() ⇒ <code>Promise</code>
Assertion to check that there is a chart type popover visible on the screen.

**Kind**: static method of [<code>onTheMDCChart</code>](#onTheMDCChart)  
**Returns**: <code>Promise</code> - OPA waitFor  
<a name="onTheMDCChart.iShouldSeeTheChartWithChartType"></a>

### onTheMDCChart.iShouldSeeTheChartWithChartType(sChartId, sChartType) ⇒ <code>Promise</code>
Assertion to check that there is a <code>sap.ui.mdc.Chart</code> visible with a given chart type.

**Kind**: static method of [<code>onTheMDCChart</code>](#onTheMDCChart)  
**Returns**: <code>Promise</code> - OPA waitFor  

| Param | Type | Description |
| --- | --- | --- |
| sChartId | <code>string</code> | The ID of the <code>sap.ui.mdc.Chart</code> to be checked for a chart type |
| sChartType | <code>string</code> | Chart type which is selected for the given chart |

<a name="onTheMDCChart.iShouldSeeTheDrillStack"></a>

### onTheMDCChart.iShouldSeeTheDrillStack(aCheckDrillStack, sChartId) ⇒ <code>Promise</code>
Assertion to check that there is a chart with a given drillstack visible.

**Kind**: static method of [<code>onTheMDCChart</code>](#onTheMDCChart)  
**Returns**: <code>Promise</code> - OPA waitFor  

| Param | Type | Description |
| --- | --- | --- |
| aCheckDrillStack | <code>array</code> | Drillstack to check for |
| sChartId | <code>string</code> | The ID of the <code>sap.ui.mdc.Chart</code> |

<a name="onTheMDCChart.iShouldSeeADrillDownPopover"></a>

### onTheMDCChart.iShouldSeeADrillDownPopover() ⇒ <code>Promise</code>
Assertion to check that there is a drilldown popover visible.

**Kind**: static method of [<code>onTheMDCChart</code>](#onTheMDCChart)  
**Returns**: <code>Promise</code> - OPA waitFor  
<a name="onTheMDCChart.iShouldSeeADetailsPopover"></a>

### onTheMDCChart.iShouldSeeADetailsPopover() ⇒ <code>Promise</code>
Assertion to check that there is a details popover visible.

**Kind**: static method of [<code>onTheMDCChart</code>](#onTheMDCChart)  
**Returns**: <code>Promise</code> - OPA waitFor  
<a name="onTheMDCChart.iShouldSeeVisibleDimensionsInOrder"></a>

### onTheMDCChart.iShouldSeeVisibleDimensionsInOrder(aDimensions, sId) ⇒ <code>Promise</code>
Assertion to check visible dimensions on the <code>sap.ui.mdc.Chart</code>.

**Kind**: static method of [<code>onTheMDCChart</code>](#onTheMDCChart)  
**Returns**: <code>Promise</code> - OPA waitFor  

| Param | Type | Description |
| --- | --- | --- |
| aDimensions | <code>Array.&lt;string&gt;</code> | Array containing the expected dimensions |
| sId | <code>string</code> | The ID of the <code>sap.ui.mdc.Chart</code> |

<a name="onTheMDCChart.iShouldSeeVisibleMeasuresInOrder"></a>

### onTheMDCChart.iShouldSeeVisibleMeasuresInOrder(aMeasures, sId) ⇒ <code>Promise</code>
Assertion to check visible measures on the <code>sap.ui.mdc.Chart</code>.

**Kind**: static method of [<code>onTheMDCChart</code>](#onTheMDCChart)  
**Returns**: <code>Promise</code> - OPA waitFor  

| Param | Type | Description |
| --- | --- | --- |
| aMeasures | <code>Array.&lt;string&gt;</code> | Array containing the expected measures |
| sId | <code>string</code> | The ID of the <code>sap.ui.mdc.Chart</code> |

<a name="onTheMDCChart.iCheckFilterPersonalization"></a>

### onTheMDCChart.iCheckFilterPersonalization(oControl, aConfigurations, fnOpenThePersonalizationDialog) ⇒ <code>Promise</code>
OPA5 test assertion
1. Opens the personalization dialog of a given chart.
2. Executes the given <code>FilterPersonalizationConfiguration</code>.
3. Closes the personalization dialog.

**Kind**: static method of [<code>onTheMDCChart</code>](#onTheMDCChart)  
**Returns**: <code>Promise</code> - OPA waitFor  

| Param | Type | Description |
| --- | --- | --- |
| oControl | <code>sap.ui.core.Control</code> \| <code>string</code> | Instance / ID of the <code>Control</code> that is filtered |
| aConfigurations | [<code>Array.&lt;FilterPersonalizationConfiguration&gt;</code>](#FilterPersonalizationConfiguration) | Array containing the filter personalization configuration objects |
| fnOpenThePersonalizationDialog | <code>function</code> | a function which opens the personalization dialog of the given control |

<a name="onTheMDCChart.iCheckAvailableFilters"></a>

### onTheMDCChart.iCheckAvailableFilters(oControl, aFilters) ⇒ <code>Promise</code>
OPA5 test assertion
1. Opens the personalization dialog of a given table.
2. Checks the availability of the provided filter texts (by opening and comparing the available items in the ComboBox)
3. Closes the personalization dialog.

**Kind**: static method of [<code>onTheMDCChart</code>](#onTheMDCChart)  
**Returns**: <code>Promise</code> - OPA waitFor  

| Param | Type | Description |
| --- | --- | --- |
| oControl | <code>sap.ui.core.Control</code> \| <code>string</code> | Instance / ID of the <code>Control</code> that is filtered |
| aFilters | <code>Array.&lt;string&gt;</code> | Array containing the names of selectable filters |

<a name="ChartPersonalizationConfiguration"></a>

## ChartPersonalizationConfiguration : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| key | <code>string</code> | Key of the value that is the result of the personalization |
| role | <code>string</code> | Role of the given value |

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

<a name="SortPersonalizationConfiguration"></a>

## SortPersonalizationConfiguration : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| key | <code>string</code> | Key of the item that is the result of the personalization |
| descending | <code>boolean</code> | Determines whether the sort direction is descending |

