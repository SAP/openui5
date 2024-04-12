<a name="onTheMDCMultiValueField"></a>

## onTheMDCMultiValueField : <code>object</code>
**Kind**: global namespace

* [onTheMDCMultiValueField](#onTheMDCMultiValueField) : <code>object</code>
    * [.iEnterTextOnTheMultiValueField(vIdentifier, sValue)](#onTheMDCMultiValueField.iEnterTextOnTheMultiValueField) ⇒ <code>Promise</code>
    * [.iShouldSeeTheMultiValueFieldWithValues(vIdentifier, sValue)](#onTheMDCMultiValueField.iShouldSeeTheMultiValueFieldWithValues) ⇒ <code>Promise</code>
    * [.iShouldSeeTheMultiValueField(vIdentifier)](#onTheMDCMultiValueField.iShouldSeeTheMultiValueField) ⇒ <code>Promise</code>
    * [.iShouldSeeConditions(vIdentifier, aConditions)](#onTheMDCMultiValueField.iShouldSeeConditions) ⇒ <code>Promise</code>
    * [.iShouldSeeTheKeys(vIdentifier, aKeys)](#onTheMDCMultiValueField.iShouldSeeTheKeys) ⇒ <code>Promise</code>

<a name="onTheMDCMultiValueField.iEnterTextOnTheMultiValueField"></a>

### onTheMDCMultiValueField.iEnterTextOnTheMultiValueField(vIdentifier, oValue) ⇒ <code>Promise</code>
Opa5 test action

**Kind**: static method of [<code>onTheMDCMultiValueField</code>](#onTheMDCMultiValueField)
**Returns**: <code>Promise</code> - OPA waitFor
**Access**: private

| Param | Type | Description |
| --- | --- | --- |
| vIdentifier | <code>string</code> | ID or a plain object providing properties identifying of the given <code>sap.ui.mdc.MultiValueField</code> |
| sValue | <code>Object</code> | Value that is entered in the <code>sap.ui.mdc.MultiValueField</code> |

<a name="onTheMDCMultiValueField.iShouldSeeTheMultiValueFieldWithValues"></a>

### onTheMDCMultiValueField.iShouldSeeTheMultiValueFieldWithValues(vIdentifier, oValues) ⇒ <code>Promise</code>
Opa5 test assertion

**Kind**: static method of [<code>onTheMDCMultiValueField</code>](#onTheMDCMultiValueField)
**Returns**: <code>Promise</code> - OPA waitFor
**Access**: private

| Param | Type | Description |
| --- | --- | --- |
| vIdentifier | <code>string</code> | ID or a plain object providing properties identifying of the given <code>sap.ui.mdc.MultiValueField</code> |
| sValue | <code>object</code> | Value that is expected in the <code>sap.ui.mdc.MultiValueField</code> |

<a name="onTheMDCMultiValueField.iShouldSeeTheMultiValueField"></a>

### onTheMDCMultiValueField.iShouldSeeTheMultiValueField(vIdentifier) ⇒ <code>Promise</code>
Opa5 test assertion

**Kind**: static method of [<code>onTheMDCMultiValueField</code>](#onTheMDCMultiValueField)
**Returns**: <code>Promise</code> - OPA waitFor
**Access**: private

| Param | Type | Description |
| --- | --- | --- |
| vIdentifier | <code>string</code> | ID or a plain object providing properties identifying of the given <code>sap.ui.mdc.MultiValueField</code> |

<a name="onTheMDCMultiValueField.iShouldSeeConditions"></a>

### onTheMDCMultiValueField.iShouldSeeConditions(vIdentifier, aConditions) ⇒ <code>Promise</code>
Opa5 test assertion

**Kind**: static method of [<code>onTheMDCMultiValueField</code>](#onTheMDCMultiValueField)
**Returns**: <code>Promise</code> - OPA waitFor
**Access**: private

| Param | Type | Description |
| --- | --- | --- |
| vIdentifier | <code>string</code> | ID or a plain object providing properties identifying of the given <code>sap.ui.mdc.MultiValueField</code> |
| aConditions | <code>object[]</code> | Conditions of the <code>sap.ui.mdc.MultiValueField</code> |

<a name="onTheMDCMultiValueField.iShouldSeeTheKeys"></a>

### onTheMDCMultiValueField.iShouldSeeTheKeys(vIdentifier, aKeys) ⇒ <code>Promise</code>
Opa5 test assertion

**Kind**: static method of [<code>onTheMDCMultiValueField</code>](#onTheMDCMultiValueField)
**Returns**: <code>Promise</code> - OPA waitFor
**Access**: private

| Param | Type | Description |
| --- | --- | --- |
| vIdentifier | <code>string</code> | ID or a plain object providing properties identifying of the given <code>sap.ui.mdc.MultiValueField</code> |
| aKeys | <code>string[]</code> | Keys of the values that are shown in a <code>sap.ui.mdc.MultiValueField</code> |
