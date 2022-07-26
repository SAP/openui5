## Objects

<dl>
<dt><a href="#onTheMDCLink">onTheMDCLink</a> : <code>object</code></dt>
<dd></dd>
</dl>

## Typedefs

<dl>
<dt><a href="#LinkIdentifier">LinkIdentifier</a> : <code>object</code></dt>
<dd><p>Object to identify a <code>sap.ui.mdc.Link</code>. Should contain at least one of the following properties: <code>text</code> and <code>id</code>.</p>
</dd>
</dl>

<a name="onTheMDCLink"></a>

## onTheMDCLink : <code>object</code>
**Kind**: global namespace  

* [onTheMDCLink](#onTheMDCLink) : <code>object</code>
    * [.iPersonalizeTheLinks(oLinkIdentifier, aLinks)](#onTheMDCLink.iPersonalizeTheLinks) ⇒ <code>Promise</code>
    * [.iResetThePersonalization(oLinkIdentifier)](#onTheMDCLink.iResetThePersonalization) ⇒ <code>Promise</code>
    * [.iPressTheLink(oLinkIdentifier)](#onTheMDCLink.iPressTheLink) ⇒ <code>Promise</code>
    * [.iPressLinkOnPopover(oLinkIdentifier, sLink)](#onTheMDCLink.iPressLinkOnPopover) ⇒ <code>Promise</code>
    * [.iCloseThePopover()](#onTheMDCLink.iCloseThePopover) ⇒ <code>Promise</code>
    * [.iShouldSeeAPopover(oLinkIdentifier)](#onTheMDCLink.iShouldSeeAPopover) ⇒ <code>Promise</code>
    * [.iShouldSeeLinksOnPopover(oLinkIdentifier, aLinks)](#onTheMDCLink.iShouldSeeLinksOnPopover) ⇒ <code>Promise</code>

<a name="onTheMDCLink.iPersonalizeTheLinks"></a>

### onTheMDCLink.iPersonalizeTheLinks(oLinkIdentifier, aLinks) ⇒ <code>Promise</code>
Opa5 test action

**Kind**: static method of [<code>onTheMDCLink</code>](#onTheMDCLink)  
**Returns**: <code>Promise</code> - OPA waitFor
1. Opens the personalization dialog of a given <code>sap.ui.mdc.Link</code>.
2. Selects all links given by <code>aLinks</code> and deselects all other links.
3. Closes the personalization dialog.  

| Param | Type | Description |
| --- | --- | --- |
| oLinkIdentifier | [<code>LinkIdentifier</code>](#LinkIdentifier) | The object to identify the <code>sap.ui.mdc.Link</code> |
| aLinks | <code>Array.&lt;string&gt;</code> | Array containing the texts of the links that are the result of the personalization |

<a name="onTheMDCLink.iResetThePersonalization"></a>

### onTheMDCLink.iResetThePersonalization(oLinkIdentifier) ⇒ <code>Promise</code>
Opa5 test action

**Kind**: static method of [<code>onTheMDCLink</code>](#onTheMDCLink)  
**Returns**: <code>Promise</code> - OPA waitFor
1. Opens the personalization dialog of a given <code>sap.ui.mdc.Link</code>.
2. Presses the Reset personalization button.
3. Confirms the Reset dialog.
4. Closes the personalization dialog.  

| Param | Type | Description |
| --- | --- | --- |
| oLinkIdentifier | [<code>LinkIdentifier</code>](#LinkIdentifier) | The object to identify the <code>sap.ui.mdc.Link</code> that is reset |

<a name="onTheMDCLink.iPressTheLink"></a>

### onTheMDCLink.iPressTheLink(oLinkIdentifier) ⇒ <code>Promise</code>
Opa5 test action

**Kind**: static method of [<code>onTheMDCLink</code>](#onTheMDCLink)  
**Returns**: <code>Promise</code> - OPA waitFor  

| Param | Type | Description |
| --- | --- | --- |
| oLinkIdentifier | [<code>LinkIdentifier</code>](#LinkIdentifier) | The object to identify the <code>sap.ui.mdc.Link</code> that is pressed |

<a name="onTheMDCLink.iPressLinkOnPopover"></a>

### onTheMDCLink.iPressLinkOnPopover(oLinkIdentifier, sLink) ⇒ <code>Promise</code>
Opa5 test action

**Kind**: static method of [<code>onTheMDCLink</code>](#onTheMDCLink)  
**Returns**: <code>Promise</code> - OPA waitFor
1. Presses a given <code>sap.ui.mdc.Link</code> to open its popover.
2. Presses a link on the opened popover defined by <code>sLink</code>.  

| Param | Type | Description |
| --- | --- | --- |
| oLinkIdentifier | [<code>LinkIdentifier</code>](#LinkIdentifier) | The object to identify the <code>sap.ui.mdc.Link</code> that opens the popover |
| sLink | <code>string</code> | The text of the link that is clicked on the popover |

<a name="onTheMDCLink.iCloseThePopover"></a>

### onTheMDCLink.iCloseThePopover() ⇒ <code>Promise</code>
Opa5 test action

**Kind**: static method of [<code>onTheMDCLink</code>](#onTheMDCLink)  
**Returns**: <code>Promise</code> - OPA waitFor
Closes an open popover of the <code>sap.ui.mdc.Link</code>.  
<a name="onTheMDCLink.iShouldSeeAPopover"></a>

### onTheMDCLink.iShouldSeeAPopover(oLinkIdentifier) ⇒ <code>Promise</code>
Opa5 test action

**Kind**: static method of [<code>onTheMDCLink</code>](#onTheMDCLink)  
**Returns**: <code>Promise</code> - OPA waitFor
Creates an assumption that there is an open popover for a given <code>sap.ui.mdc.Link</code>.  

| Param | Type | Description |
| --- | --- | --- |
| oLinkIdentifier | [<code>LinkIdentifier</code>](#LinkIdentifier) | The object to identify the <code>sap.ui.mdc.Link</code> that opens the popover |

<a name="onTheMDCLink.iShouldSeeLinksOnPopover"></a>

### onTheMDCLink.iShouldSeeLinksOnPopover(oLinkIdentifier, aLinks) ⇒ <code>Promise</code>
Opa5 test action

**Kind**: static method of [<code>onTheMDCLink</code>](#onTheMDCLink)  
**Returns**: <code>Promise</code> - OPA waitFor
Creates an assumption that there is an open popover for a given <code>sap.ui.mdc.Link</code> and checks that all given links defined in <code>aLinks</code> are on that popover in a defined order.  

| Param | Type | Description |
| --- | --- | --- |
| oLinkIdentifier | [<code>LinkIdentifier</code>](#LinkIdentifier) | The object to identify the <code>sap.ui.mdc.Link</code> that opens the popover |
| aLinks | <code>Array.&lt;string&gt;</code> | Array containing the texts of the links that are visible on the popover |

<a name="LinkIdentifier"></a>

## LinkIdentifier : <code>object</code>
Object to identify a <code>sap.ui.mdc.Link</code>. Should contain at least one of the following properties: <code>text</code> and <code>id</code>.

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| id | <code>string</code> | ID of a given <code>sap.m.Link</code> that represents the <code>sap.ui.mdc.Link</code> |
| text | <code>string</code> | Text of a given <code>sap.m.Link</code> that represents the <code>sap.ui.mdc.Link</code> |

