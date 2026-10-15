<a name="onVariantManagement"></a>

## onVariantManagement : <code>object</code>
**Kind**: global namespace  

* [onVariantManagement](#onVariantManagement) : <code>object</code>
    * [.iOpenMyView(sFlVMId)](#onVariantManagement.iOpenMyView) ⇒ <code>Promise</code>
    * [.iOpenSaveView(sFlVMId)](#onVariantManagement.iOpenSaveView) ⇒ <code>Promise</code>
    * [.iOpenManageViews(sFlVMId)](#onVariantManagement.iOpenManageViews) ⇒ <code>Promise</code>
    * [.iPressTheManageViewsSave(sFlVMId)](#onVariantManagement.iPressTheManageViewsSave) ⇒ <code>Promise</code>
    * [.iPressTheManageViewsCancel(sFlVMId)](#onVariantManagement.iPressTheManageViewsCancel) ⇒ <code>Promise</code>
    * [.iRenameVariant(sOriginalVariantName, sNewVariantName)](#onVariantManagement.iRenameVariant) ⇒ <code>Promise</code>
    * [.iSetDefaultVariant(sVariantName)](#onVariantManagement.iSetDefaultVariant) ⇒ <code>Promise</code>
    * [.iRemoveVariant(sVariantName)](#onVariantManagement.iRemoveVariant) ⇒ <code>Promise</code>
    * [.iApplyAutomaticallyVariant(sVariantName, bApplyAuto)](#onVariantManagement.iApplyAutomaticallyVariant) ⇒ <code>Promise</code>
    * [.iCreateNewVariant(sFlVMId, sVariantTitle, bDefault, bApplyAuto, bPublic)](#onVariantManagement.iCreateNewVariant) ⇒ <code>Promise</code>
    * [.theVariantShouldBeDisplayed(sFlVMId, sVariantTitle)](#onVariantManagement.theVariantShouldBeDisplayed) ⇒ <code>Promise</code>
    * [.theMyViewShouldContain(sFlVMId, aVariantNames)](#onVariantManagement.theMyViewShouldContain) ⇒ <code>Promise</code>
    * [.theOpenSaveViewDialog(sFlVMId)](#onVariantManagement.theOpenSaveViewDialog) ⇒ <code>Promise</code>
    * [.theOpenManageViewsDialog(sFlVMId)](#onVariantManagement.theOpenManageViewsDialog) ⇒ <code>Promise</code>
    * [.theOpenManageViewsDialogTitleShouldContain(aVariantNames)](#onVariantManagement.theOpenManageViewsDialogTitleShouldContain) ⇒ <code>Promise</code>
    * [.theOpenManageViewsDialogFavoritesShouldContain(aVariantFavorites)](#onVariantManagement.theOpenManageViewsDialogFavoritesShouldContain) ⇒ <code>Promise</code>
    * [.theOpenManageViewsDialogApplyAutomaticallyShouldContain(aVariantApplayAutos)](#onVariantManagement.theOpenManageViewsDialogApplyAutomaticallyShouldContain) ⇒ <code>Promise</code>
    * [.theOpenManageViewsDialogSharingShouldContain(aVariantSharing)](#onVariantManagement.theOpenManageViewsDialogSharingShouldContain) ⇒ <code>Promise</code>
    * [.theOpenManageViewsDialogDefaultShouldBe(sVariantName)](#onVariantManagement.theOpenManageViewsDialogDefaultShouldBe) ⇒ <code>Promise</code>

<a name="onVariantManagement.iOpenMyView"></a>

### onVariantManagement.iOpenMyView(sFlVMId) ⇒ <code>Promise</code>
Opens/Closes the My Views popup.

**Kind**: static method of [<code>onVariantManagement</code>](#onVariantManagement)  
**Returns**: <code>Promise</code> - The result of the [sap.ui.test.Opa5#waitFor](sap.ui.test.Opa5#waitFor) function, to be used for chained statements  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| sFlVMId | <code>string</code> | The fl variant management control ID. |

<a name="onVariantManagement.iOpenSaveView"></a>

### onVariantManagement.iOpenSaveView(sFlVMId) ⇒ <code>Promise</code>
Opens the Save View dialog.

**Kind**: static method of [<code>onVariantManagement</code>](#onVariantManagement)  
**Returns**: <code>Promise</code> - The result of the [sap.ui.test.Opa5#waitFor](sap.ui.test.Opa5#waitFor) function, to be used for chained statements  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| sFlVMId | <code>string</code> | The fl variant management control ID |

<a name="onVariantManagement.iOpenManageViews"></a>

### onVariantManagement.iOpenManageViews(sFlVMId) ⇒ <code>Promise</code>
Opens the Manage Views dialog.

**Kind**: static method of [<code>onVariantManagement</code>](#onVariantManagement)  
**Returns**: <code>Promise</code> - The result of the [sap.ui.test.Opa5#waitFor](sap.ui.test.Opa5#waitFor) function, to be used for chained statements  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| sFlVMId | <code>string</code> | The fl variant management control ID |

<a name="onVariantManagement.iPressTheManageViewsSave"></a>

### onVariantManagement.iPressTheManageViewsSave(sFlVMId) ⇒ <code>Promise</code>
Presses the Save button inside the Manage Views dialog.

**Kind**: static method of [<code>onVariantManagement</code>](#onVariantManagement)  
**Returns**: <code>Promise</code> - The result of the [sap.ui.test.Opa5#waitFor](sap.ui.test.Opa5#waitFor) function, to be used for chained statements  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| sFlVMId | <code>string</code> | The fl variant management control ID |

<a name="onVariantManagement.iPressTheManageViewsCancel"></a>

### onVariantManagement.iPressTheManageViewsCancel(sFlVMId) ⇒ <code>Promise</code>
Presses the Cancel button inside the Manage Views dialog.

**Kind**: static method of [<code>onVariantManagement</code>](#onVariantManagement)  
**Returns**: <code>Promise</code> - The result of the [sap.ui.test.Opa5#waitFor](sap.ui.test.Opa5#waitFor) function, to be used for chained statements  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| sFlVMId | <code>string</code> | The fl variant management control ID |

<a name="onVariantManagement.iRenameVariant"></a>

### onVariantManagement.iRenameVariant(sOriginalVariantName, sNewVariantName) ⇒ <code>Promise</code>
Renames a variant.
Prerequisite is an open Manage Views dialog.

**Kind**: static method of [<code>onVariantManagement</code>](#onVariantManagement)  
**Returns**: <code>Promise</code> - The result of the [sap.ui.test.Opa5#waitFor](sap.ui.test.Opa5#waitFor) function, to be used for chained statements  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| sOriginalVariantName | <code>string</code> | The previous name of a variant |
| sNewVariantName | <code>string</code> | The new name of a variant |

<a name="onVariantManagement.iSetDefaultVariant"></a>

### onVariantManagement.iSetDefaultVariant(sVariantName) ⇒ <code>Promise</code>
Sets the default for a variant.
Prerequisite is an open Manage Views dialog.

**Kind**: static method of [<code>onVariantManagement</code>](#onVariantManagement)  
**Returns**: <code>Promise</code> - The result of the [sap.ui.test.Opa5#waitFor](sap.ui.test.Opa5#waitFor) function, to be used for chained statements  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| sVariantName | <code>string</code> | The name of the new default variant |

<a name="onVariantManagement.iRemoveVariant"></a>

### onVariantManagement.iRemoveVariant(sVariantName) ⇒ <code>Promise</code>
Removes a variant.
Prerequisite is an open Manage Views dialog.

**Kind**: static method of [<code>onVariantManagement</code>](#onVariantManagement)  
**Returns**: <code>Promise</code> - The result of the [sap.ui.test.Opa5#waitFor](sap.ui.test.Opa5#waitFor) function, to be used for chained statements  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| sVariantName | <code>string</code> | The name of the new default variant |

<a name="onVariantManagement.iApplyAutomaticallyVariant"></a>

### onVariantManagement.iApplyAutomaticallyVariant(sVariantName, bApplyAuto) ⇒ <code>Promise</code>
Handles the Apply Automatically checkbox for a variant
Prerequisite is an open Manage Views dialog.

**Kind**: static method of [<code>onVariantManagement</code>](#onVariantManagement)  
**Returns**: <code>Promise</code> - The result of the [sap.ui.test.Opa5#waitFor](sap.ui.test.Opa5#waitFor) function, to be used for chained statements  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| sVariantName | <code>string</code> | The name of the variant |
| bApplyAuto | <code>boolean</code> | The Apply Automatically checkbox for the variant |

<a name="onVariantManagement.iCreateNewVariant"></a>

### onVariantManagement.iCreateNewVariant(sFlVMId, sVariantTitle, bDefault, bApplyAuto, bPublic) ⇒ <code>Promise</code>
Creates a new variant.

**Kind**: static method of [<code>onVariantManagement</code>](#onVariantManagement)  
**Returns**: <code>Promise</code> - The result of the [sap.ui.test.Opa5#waitFor](sap.ui.test.Opa5#waitFor) function, to be used for chained statements  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| sFlVMId | <code>string</code> | The fl variant management control ID |
| sVariantTitle | <code>string</code> | The name of the new variant |
| bDefault | <code>boolean</code> | Default checkbox for the variant |
| bApplyAuto | <code>boolean</code> | The Apply Automatically for the variant |
| bPublic | <code>boolean</code> | The Public information for the variant |

<a name="onVariantManagement.theVariantShouldBeDisplayed"></a>

### onVariantManagement.theVariantShouldBeDisplayed(sFlVMId, sVariantTitle) ⇒ <code>Promise</code>
Checks the expected variant title.

**Kind**: static method of [<code>onVariantManagement</code>](#onVariantManagement)  
**Returns**: <code>Promise</code> - The result of the [sap.ui.test.Opa5#waitFor](sap.ui.test.Opa5#waitFor) function, to be used for chained statements  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| sFlVMId | <code>string</code> | The fl variant management control ID |
| sVariantTitle | <code>string</code> | The name of the expected variant |

<a name="onVariantManagement.theMyViewShouldContain"></a>

### onVariantManagement.theMyViewShouldContain(sFlVMId, aVariantNames) ⇒ <code>Promise</code>
Checks the expected variant titles.
Prerequisite is an open My Views popup.

**Kind**: static method of [<code>onVariantManagement</code>](#onVariantManagement)  
**Returns**: <code>Promise</code> - The result of the [sap.ui.test.Opa5#waitFor](sap.ui.test.Opa5#waitFor) function, to be used for chained statements  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| sFlVMId | <code>string</code> | The fl variant management control ID |
| aVariantNames | <code>array</code> | List of the expected variants |

<a name="onVariantManagement.theOpenSaveViewDialog"></a>

### onVariantManagement.theOpenSaveViewDialog(sFlVMId) ⇒ <code>Promise</code>
Checks is the expected Save View dialog is open.

**Kind**: static method of [<code>onVariantManagement</code>](#onVariantManagement)  
**Returns**: <code>Promise</code> - The result of the [sap.ui.test.Opa5#waitFor](sap.ui.test.Opa5#waitFor) function, to be used for chained statements  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| sFlVMId | <code>string</code> | The fl variant management control ID |

<a name="onVariantManagement.theOpenManageViewsDialog"></a>

### onVariantManagement.theOpenManageViewsDialog(sFlVMId) ⇒ <code>Promise</code>
Checks is the expected Manage Views dialog is open.

**Kind**: static method of [<code>onVariantManagement</code>](#onVariantManagement)  
**Returns**: <code>Promise</code> - The result of the [sap.ui.test.Opa5#waitFor](sap.ui.test.Opa5#waitFor) function, to be used for chained statements  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| sFlVMId | <code>string</code> | The fl variant management control ID |

<a name="onVariantManagement.theOpenManageViewsDialogTitleShouldContain"></a>

### onVariantManagement.theOpenManageViewsDialogTitleShouldContain(aVariantNames) ⇒ <code>Promise</code>
Checks the variants in the Manage Views dialog.
Prerequisite is an open Manage Views dialog.

**Kind**: static method of [<code>onVariantManagement</code>](#onVariantManagement)  
**Returns**: <code>Promise</code> - The result of the [sap.ui.test.Opa5#waitFor](sap.ui.test.Opa5#waitFor) function, to be used for chained statements  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| aVariantNames | <code>array</code> | List of the expected variants |

<a name="onVariantManagement.theOpenManageViewsDialogFavoritesShouldContain"></a>

### onVariantManagement.theOpenManageViewsDialogFavoritesShouldContain(aVariantFavorites) ⇒ <code>Promise</code>
Checks the variants with the Favorite checkbox set in the Manage Views dialog.
Prerequisite is an open Manage Views dialog.

**Kind**: static method of [<code>onVariantManagement</code>](#onVariantManagement)  
**Returns**: <code>Promise</code> - The result of the [sap.ui.test.Opa5#waitFor](sap.ui.test.Opa5#waitFor) function, to be used for chained statements  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| aVariantFavorites | <code>array</code> | List of the expected variants |

<a name="onVariantManagement.theOpenManageViewsDialogApplyAutomaticallyShouldContain"></a>

### onVariantManagement.theOpenManageViewsDialogApplyAutomaticallyShouldContain(aVariantApplayAutos) ⇒ <code>Promise</code>
Checks the variants with the Apply Automatically checkbox set in the Manage Views dialog.
Prerequisite is an open Manage Views dialog.

**Kind**: static method of [<code>onVariantManagement</code>](#onVariantManagement)  
**Returns**: <code>Promise</code> - The result of the [sap.ui.test.Opa5#waitFor](sap.ui.test.Opa5#waitFor) function, to be used for chained statements  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| aVariantApplayAutos | <code>array</code> | List of the expected variants |

<a name="onVariantManagement.theOpenManageViewsDialogSharingShouldContain"></a>

### onVariantManagement.theOpenManageViewsDialogSharingShouldContain(aVariantSharing) ⇒ <code>Promise</code>
Checks the variants for its sharing information.
Prerequisite is an open Manage Views dialog.

**Kind**: static method of [<code>onVariantManagement</code>](#onVariantManagement)  
**Returns**: <code>Promise</code> - The result of the [sap.ui.test.Opa5#waitFor](sap.ui.test.Opa5#waitFor) function, to be used for chained statements  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| aVariantSharing | <code>array</code> | List of the expected sharing information of the variants |

<a name="onVariantManagement.theOpenManageViewsDialogDefaultShouldBe"></a>

### onVariantManagement.theOpenManageViewsDialogDefaultShouldBe(sVariantName) ⇒ <code>Promise</code>
Checks for the expected default variant.
Prerequisite is an open Manage Views dialog.

**Kind**: static method of [<code>onVariantManagement</code>](#onVariantManagement)  
**Returns**: <code>Promise</code> - The result of the [sap.ui.test.Opa5#waitFor](sap.ui.test.Opa5#waitFor) function, to be used for chained statements  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| sVariantName | <code>string</code> | The expected default variant |

