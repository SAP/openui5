<a name="onTheMDCValueHelp"></a>

## onTheMDCValueHelp : <code>object</code>
**Kind**: global namespace  

* [onTheMDCValueHelp](#onTheMDCValueHelp) : <code>object</code>
    * [.iOpenTheValueHelpForField(oField)](#onTheMDCValueHelp.iOpenTheValueHelpForField) ⇒ <code>Promise</code>
    * [.iCloseTheValueHelpDialog(bCancel)](#onTheMDCValueHelp.iCloseTheValueHelpDialog) ⇒ <code>Promise</code>

<a name="onTheMDCValueHelp.iOpenTheValueHelpForField"></a>

### onTheMDCValueHelp.iOpenTheValueHelpForField(oField) ⇒ <code>Promise</code>
OPA5 test action

**Kind**: static method of [<code>onTheMDCValueHelp</code>](#onTheMDCValueHelp)  
**Returns**: <code>Promise</code> - OPA waitFor
Opens the value help for a given <code>sap.ui.mdc.Field</code>.  

| Param | Type | Description |
| --- | --- | --- |
| oField | <code>sap.ui.core.Control</code> \| <code>string</code> | Instance / ID of the <code>sap.ui.mdc.Field</code> |

<a name="onTheMDCValueHelp.iCloseTheValueHelpDialog"></a>

### onTheMDCValueHelp.iCloseTheValueHelpDialog(bCancel) ⇒ <code>Promise</code>
OPA5 test action

**Kind**: static method of [<code>onTheMDCValueHelp</code>](#onTheMDCValueHelp)  
**Returns**: <code>Promise</code> - OPA waitFor
Closes an open value help dialog by pressing the OK / Cancel button.  

| Param | Type | Description |
| --- | --- | --- |
| bCancel | <code>boolean</code> | Boolean that defines if the Cancel button is pressed |

