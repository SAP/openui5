<a name="onTheMDCFilterField"></a>

## onTheMDCFilterField : <code>object</code>
**Kind**: global namespace  

* [onTheMDCFilterField](#onTheMDCFilterField) : <code>object</code>
    * [.iEnterTextOnTheFilterField(sLabelName, sValue, oConfig)](#onTheMDCFilterField.iEnterTextOnTheFilterField) ⇒ <code>Promise</code>
    * [.iPressKeyOnFilterFieldWithLabel(sLabelName, sValue)](#onTheMDCFilterField.iPressKeyOnFilterFieldWithLabel) ⇒ <code>Promise</code>
    * [.iPressOnTheFilterFieldValueHelpButton(sLabelName)](#onTheMDCFilterField.iPressOnTheFilterFieldValueHelpButton) ⇒ <code>Promise</code>
    * [.iShouldSeeTheFilterFieldWithValues(sLabelName, oValues)](#onTheMDCFilterField.iShouldSeeTheFilterFieldWithValues) ⇒ <code>Promise</code>

<a name="onTheMDCFilterField.iEnterTextOnTheFilterField"></a>

### onTheMDCFilterField.iEnterTextOnTheFilterField(sLabelName, sValue, oConfig) ⇒ <code>Promise</code>
OPA5 test action

**Kind**: static method of [<code>onTheMDCFilterField</code>](#onTheMDCFilterField)  
**Returns**: <code>Promise</code> - OPA waitFor  

| Param | Type | Description |
| --- | --- | --- |
| sLabelName | <code>string</code> | Label of the given <code>FilterField</code> |
| sValue | <code>string</code> | Value which is to be entered in the <code>FilterField</code> |
| oConfig | <code>object</code> | TODO: to be clarified |

<a name="onTheMDCFilterField.iPressKeyOnFilterFieldWithLabel"></a>

### onTheMDCFilterField.iPressKeyOnFilterFieldWithLabel(sLabelName, sValue) ⇒ <code>Promise</code>
OPA5 test action

**Kind**: static method of [<code>onTheMDCFilterField</code>](#onTheMDCFilterField)  
**Returns**: <code>Promise</code> - OPA waitFor  

| Param | Type | Description |
| --- | --- | --- |
| sLabelName | <code>string</code> | Label of the given <code>FilterField</code> |
| sValue | <code>string</code> | Value of the Keycode which is to be pressed |

<a name="onTheMDCFilterField.iPressOnTheFilterFieldValueHelpButton"></a>

### onTheMDCFilterField.iPressOnTheFilterFieldValueHelpButton(sLabelName) ⇒ <code>Promise</code>
OPA5 test action

**Kind**: static method of [<code>onTheMDCFilterField</code>](#onTheMDCFilterField)  
**Returns**: <code>Promise</code> - OPA waitFor  

| Param | Type | Description |
| --- | --- | --- |
| sLabelName | <code>string</code> | Label of the given <code>FilterField</code> |

<a name="onTheMDCFilterField.iShouldSeeTheFilterFieldWithValues"></a>

### onTheMDCFilterField.iShouldSeeTheFilterFieldWithValues(sLabelName, oValues) ⇒ <code>Promise</code>
OPA5 test assertion

**Kind**: static method of [<code>onTheMDCFilterField</code>](#onTheMDCFilterField)  
**Returns**: <code>Promise</code> - OPA waitFor  

| Param | Type | Description |
| --- | --- | --- |
| sLabelName | <code>string</code> | Label of the given <code>FilterField</code> |
| oValues | <code>object</code> | Expected values |

