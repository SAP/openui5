<a name="onTheMDCFilterField"></a>

## onTheMDCFilterField : <code>object</code>
**Kind**: global namespace  

* [onTheMDCFilterField](#onTheMDCFilterField) : <code>object</code>
    * [.iEnterTextOnTheFilterField(oProperties, sValue, oConfig)](#onTheMDCFilterField.iEnterTextOnTheFilterField) ⇒ <code>Promise</code>
    * [.iPressKeyOnTheFilterField(vOptions, sValue)](#onTheMDCFilterField.iPressKeyOnTheFilterField) ⇒ <code>Promise</code>
    * [.iOpenTheValueHelpForFilterField(oField)](#onTheMDCFilterField.iOpenTheValueHelpForFilterField) ⇒ <code>Promise</code>
    * [.iShouldSeeTheFilterFieldWithValues(oProperties, oValues)](#onTheMDCFilterField.iShouldSeeTheFilterFieldWithValues) ⇒ <code>Promise</code>

<a name="onTheMDCFilterField.iEnterTextOnTheFilterField"></a>

### onTheMDCFilterField.iEnterTextOnTheFilterField(oProperties, sValue, oConfig) ⇒ <code>Promise</code>
OPA5 test action

**Kind**: static method of [<code>onTheMDCFilterField</code>](#onTheMDCFilterField)  
**Returns**: <code>Promise</code> - OPA waitFor  

| Param | Type | Description |
| --- | --- | --- |
| oProperties | <code>object</code> | Properties (e.g. id, label) of the given <code>sap.ui.mdc.FilterField</code> |
| sValue | <code>string</code> | Value that is entered in the <code>sap.ui.mdc.FilterField</code> |
| oConfig | <code>object</code> | TODO: to be clarified |

<a name="onTheMDCFilterField.iPressKeyOnTheFilterField"></a>

### onTheMDCFilterField.iPressKeyOnTheFilterField(vOptions, sValue) ⇒ <code>Promise</code>
OPA5 test action

**Kind**: static method of [<code>onTheMDCFilterField</code>](#onTheMDCFilterField)  
**Returns**: <code>Promise</code> - OPA waitFor  

| Param | Type | Description |
| --- | --- | --- |
| vOptions | <code>string</code> \| <code>object</code> | Id or a plain object providing properties identifying the given <code>sap.ui.mdc.FilterField</code> |
| sValue | <code>string</code> | Value of the key code that is pressed |

<a name="onTheMDCFilterField.iOpenTheValueHelpForFilterField"></a>

### onTheMDCFilterField.iOpenTheValueHelpForFilterField(oField) ⇒ <code>Promise</code>
OPA5 test action

**Kind**: static method of [<code>onTheMDCFilterField</code>](#onTheMDCFilterField)  
**Returns**: <code>Promise</code> - OPA waitFor
Opens the value help for a given <code>sap.ui.mdc.FilterField</code>.  

| Param | Type | Description |
| --- | --- | --- |
| oField | <code>Object</code> \| <code>string</code> | ID or identifying properties of the <code>sap.ui.mdc.FilterField</code> |

<a name="onTheMDCFilterField.iShouldSeeTheFilterFieldWithValues"></a>

### onTheMDCFilterField.iShouldSeeTheFilterFieldWithValues(oProperties, oValues) ⇒ <code>Promise</code>
OPA5 test assertion

**Kind**: static method of [<code>onTheMDCFilterField</code>](#onTheMDCFilterField)  
**Returns**: <code>Promise</code> - OPA waitFor  

| Param | Type | Description |
| --- | --- | --- |
| oProperties | <code>string</code> | Properties (e.g. id, label) of the given <code>sap.ui.mdc.FilterField</code> |
| oValues | <code>object</code> | Expected values |

