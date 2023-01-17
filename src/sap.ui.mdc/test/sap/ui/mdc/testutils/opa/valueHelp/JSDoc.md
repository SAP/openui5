<a name="onTheMDCValueHelp"></a>

## onTheMDCValueHelp : <code>object</code>
**Kind**: global namespace  

* [onTheMDCValueHelp](#onTheMDCValueHelp) : <code>object</code>
    * [.iCloseTheValueHelpDialog(bCancel)](#onTheMDCValueHelp.iCloseTheValueHelpDialog) ⇒ <code>Promise</code>
    * [.iNavigateToValueHelpContent(oProperties, [sValueHelp])](#onTheMDCValueHelp.iNavigateToValueHelpContent) ⇒ <code>Promise</code>
    * [.iRemoveValueHelpToken(sValue, [sValueHelp])](#onTheMDCValueHelp.iRemoveValueHelpToken) ⇒ <code>Promise</code>
    * [.iRemoveAllValueHelpTokens([sValueHelp])](#onTheMDCValueHelp.iRemoveAllValueHelpTokens) ⇒ <code>Promise</code>
    * [.iShouldSeeValueHelpListItems(vTexts, [sValueHelp])](#onTheMDCValueHelp.iShouldSeeValueHelpListItems) ⇒ <code>Promise</code>
    * [.iShouldSeeTheValueHelpDialog([sValueHelp])](#onTheMDCValueHelp.iShouldSeeTheValueHelpDialog) ⇒ <code>Promise</code>
    * [.iShouldSeeValueHelpContent(oProperties, [sValueHelp])](#onTheMDCValueHelp.iShouldSeeValueHelpContent) ⇒ <code>Promise</code>
    * [.iShouldSeeValueHelpToken(sValue, [sValueHelp])](#onTheMDCValueHelp.iShouldSeeValueHelpToken) ⇒ <code>Promise</code>

<a name="onTheMDCValueHelp.iCloseTheValueHelpDialog"></a>

### onTheMDCValueHelp.iCloseTheValueHelpDialog(bCancel) ⇒ <code>Promise</code>
OPA5 test action

**Kind**: static method of [<code>onTheMDCValueHelp</code>](#onTheMDCValueHelp)  
**Returns**: <code>Promise</code> - OPA waitFor
Closes an open value help dialog by pressing the OK / Cancel button.  

| Param | Type | Description |
| --- | --- | --- |
| bCancel | <code>boolean</code> | Boolean that defines if the Cancel button is pressed |

<a name="onTheMDCValueHelp.iNavigateToValueHelpContent"></a>

### onTheMDCValueHelp.iNavigateToValueHelpContent(oProperties, [sValueHelp]) ⇒ <code>Promise</code>
OPA5 test action

**Kind**: static method of [<code>onTheMDCValueHelp</code>](#onTheMDCValueHelp)  
**Returns**: <code>Promise</code> - OPA waitFor
Navigates inside an open value help dialog programmatically and waits for rendering of expected display content  

| Param | Type | Description |
| --- | --- | --- |
| oProperties | <code>object</code> | Properties identifying the content to navigate to |
| [sValueHelp] | <code>string</code> | Optional identifier for the affected valuehelp |

<a name="onTheMDCValueHelp.iRemoveValueHelpToken"></a>

### onTheMDCValueHelp.iRemoveValueHelpToken(sValue, [sValueHelp]) ⇒ <code>Promise</code>
OPA5 test action

**Kind**: static method of [<code>onTheMDCValueHelp</code>](#onTheMDCValueHelp)  
**Returns**: <code>Promise</code> - OPA waitFor
Removes a token and the condition it represents from the given valuehelp  

| Param | Type | Description |
| --- | --- | --- |
| sValue | <code>string</code> | Identifier for the token to be removed (should equal it's text property) |
| [sValueHelp] | <code>string</code> | Optional identifier for the affected valuehelp |

<a name="onTheMDCValueHelp.iRemoveAllValueHelpTokens"></a>

### onTheMDCValueHelp.iRemoveAllValueHelpTokens([sValueHelp]) ⇒ <code>Promise</code>
OPA5 test action

**Kind**: static method of [<code>onTheMDCValueHelp</code>](#onTheMDCValueHelp)  
**Returns**: <code>Promise</code> - OPA waitFor
Removes all tokens and the conditions they represent from the given valuehelp  

| Param | Type | Description |
| --- | --- | --- |
| [sValueHelp] | <code>string</code> | Optional identifier for the affected valuehelp |

<a name="onTheMDCValueHelp.iShouldSeeValueHelpListItems"></a>

### onTheMDCValueHelp.iShouldSeeValueHelpListItems(vTexts, [sValueHelp]) ⇒ <code>Promise</code>
OPA5 test action

**Kind**: static method of [<code>onTheMDCValueHelp</code>](#onTheMDCValueHelp)  
**Returns**: <code>Promise</code> - OPA waitFor
Searches one or more listitems containing cells with the given text(s)  

| Param | Type | Description |
| --- | --- | --- |
| vTexts | <code>string</code> \| <code>Array.&lt;string&gt;</code> \| <code>Array.&lt;Array.&lt;String&gt;&gt;</code> | Text(s) the searched listitems must contain |
| [sValueHelp] | <code>string</code> | Optional identifier for the affected valuehelp |

<a name="onTheMDCValueHelp.iShouldSeeTheValueHelpDialog"></a>

### onTheMDCValueHelp.iShouldSeeTheValueHelpDialog([sValueHelp]) ⇒ <code>Promise</code>
OPA5 test action

**Kind**: static method of [<code>onTheMDCValueHelp</code>](#onTheMDCValueHelp)  
**Returns**: <code>Promise</code> - OPA waitFor
Searches for an open dialog which has a valuehelp ancestor  

| Param | Type | Description |
| --- | --- | --- |
| [sValueHelp] | <code>string</code> | Optional identifier for the affected valuehelp |

<a name="onTheMDCValueHelp.iShouldSeeValueHelpContent"></a>

### onTheMDCValueHelp.iShouldSeeValueHelpContent(oProperties, [sValueHelp]) ⇒ <code>Promise</code>
OPA5 test action

**Kind**: static method of [<code>onTheMDCValueHelp</code>](#onTheMDCValueHelp)  
**Returns**: <code>Promise</code> - OPA waitFor
Searches for an valuehelp content by properties and a given valuehelp ancestor  

| Param | Type | Description |
| --- | --- | --- |
| oProperties | <code>object</code> | Properties identifying the searched content |
| [sValueHelp] | <code>string</code> | Optional identifier for the affected valuehelp |

<a name="onTheMDCValueHelp.iShouldSeeValueHelpToken"></a>

### onTheMDCValueHelp.iShouldSeeValueHelpToken(sValue, [sValueHelp]) ⇒ <code>Promise</code>
OPA5 test action

**Kind**: static method of [<code>onTheMDCValueHelp</code>](#onTheMDCValueHelp)  
**Returns**: <code>Promise</code> - OPA waitFor
Searches a token in the valuehelp dialog's tokenizer by text  

| Param | Type | Description |
| --- | --- | --- |
| sValue | <code>object</code> | Text the token should hold |
| [sValueHelp] | <code>string</code> | Optional identifier for the affected valuehelp |

