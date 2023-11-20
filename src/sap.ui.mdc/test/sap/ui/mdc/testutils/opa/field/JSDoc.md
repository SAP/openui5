<a name="onTheMDCField"></a>

## onTheMDCField : <code>object</code>
**Kind**: global namespace  

* [onTheMDCField](#onTheMDCField) : <code>object</code>
    * [.iEnterTextOnTheField(sId, oValue)](#onTheMDCField.iEnterTextOnTheField) ⇒ <code>Promise</code>
    * [.iShouldSeeTheFieldWithValues(sId, oValues)](#onTheMDCField.iShouldSeeTheFieldWithValues) ⇒ <code>Promise</code>

<a name="onTheMDCField.iEnterTextOnTheField"></a>

### onTheMDCField.iEnterTextOnTheField(sId, oValue) ⇒ <code>Promise</code>
Opa5 test action

**Kind**: static method of [<code>onTheMDCField</code>](#onTheMDCField)  
**Returns**: <code>Promise</code> - OPA waitFor  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| sId | <code>string</code> | ID of the given <code>sap.ui.mdc.Field</code> |
| oValue | <code>Object</code> | Value that is entered in the <code>sap.ui.mdc.Field</code> |

<a name="onTheMDCField.iShouldSeeTheFieldWithValues"></a>

### onTheMDCField.iShouldSeeTheFieldWithValues(sId, oValues) ⇒ <code>Promise</code>
Opa5 test assertion

**Kind**: static method of [<code>onTheMDCField</code>](#onTheMDCField)  
**Returns**: <code>Promise</code> - OPA waitFor  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| sId | <code>string</code> | ID of the given <code>sap.ui.mdc.Field</code> |
| oValues | <code>object</code> | Values that are expected in the <code>sap.ui.mdc.Field</code> |

