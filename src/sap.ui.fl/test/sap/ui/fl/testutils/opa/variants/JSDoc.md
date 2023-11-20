<a name="onFlVariantManagement"></a>

## onFlVariantManagement : <code>object</code>
**Kind**: global namespace  

* [onFlVariantManagement](#onFlVariantManagement) : <code>object</code>
    * [.iOpenMyView(sFlVMId)](#onFlVariantManagement.iOpenMyView) ⇒ <code>Promise</code>
    * [.iOpenSaveView(sFlVMId)](#onFlVariantManagement.iOpenSaveView) ⇒ <code>Promise</code>
    * [.iOpenManageViews(sFlVMId)](#onFlVariantManagement.iOpenManageViews) ⇒ <code>Promise</code>
    * [.iPressTheManageViewsSave(sFlVMId)](#onFlVariantManagement.iPressTheManageViewsSave) ⇒ <code>Promise</code>
    * [.iPressTheManageViewsCancel(sFlVMId)](#onFlVariantManagement.iPressTheManageViewsCancel) ⇒ <code>Promise</code>
    * [.iRenameVariant(sOriginalVariantName, sNewVariantName)](#onFlVariantManagement.iRenameVariant) ⇒ <code>Promise</code>
    * [.iSetDefaultVariant(sVariantName)](#onFlVariantManagement.iSetDefaultVariant) ⇒ <code>Promise</code>
    * [.iRemoveVariant(sVariantName)](#onFlVariantManagement.iRemoveVariant) ⇒ <code>Promise</code>
    * [.iApplyAutomaticallyVariant(sVariantName, bApplyAuto)](#onFlVariantManagement.iApplyAutomaticallyVariant) ⇒ <code>Promise</code>
    * [.iCreateNewVariant(sFlVMId, sVariantTitle, bDefault, bApplyAuto, bPublic)](#onFlVariantManagement.iCreateNewVariant) ⇒ <code>Promise</code>
    * [.theVariantShouldBeDisplayed(sFlVMId, sVariantTitle)](#onFlVariantManagement.theVariantShouldBeDisplayed) ⇒ <code>Promise</code>
    * [.theMyViewShouldContain(sFlVMId, aVariantNames)](#onFlVariantManagement.theMyViewShouldContain) ⇒ <code>Promise</code>
    * [.theOpenSaveViewDialog(sFlVMId)](#onFlVariantManagement.theOpenSaveViewDialog) ⇒ <code>Promise</code>
    * [.theOpenManageViewsDialog(sFlVMId)](#onFlVariantManagement.theOpenManageViewsDialog) ⇒ <code>Promise</code>
    * [.theOpenManageViewsDialogTitleShouldContain(aVariantNames)](#onFlVariantManagement.theOpenManageViewsDialogTitleShouldContain) ⇒ <code>Promise</code>
    * [.theOpenManageViewsDialogFavoritesShouldContain(aVariantFavorites)](#onFlVariantManagement.theOpenManageViewsDialogFavoritesShouldContain) ⇒ <code>Promise</code>
    * [.theOpenManageViewsDialogApplyAutomaticallyShouldContain(aVariantApplayAutos)](#onFlVariantManagement.theOpenManageViewsDialogApplyAutomaticallyShouldContain) ⇒ <code>Promise</code>
    * [.theOpenManageViewsDialogSharingShouldContain(aVariantSharing)](#onFlVariantManagement.theOpenManageViewsDialogSharingShouldContain) ⇒ <code>Promise</code>
    * [.theOpenManageViewsDialogDefaultShouldBe(sVariantName)](#onFlVariantManagement.theOpenManageViewsDialogDefaultShouldBe) ⇒ <code>Promise</code>

<a name="onFlVariantManagement.iOpenMyView"></a>

### onFlVariantManagement.iOpenMyView(sFlVMId) ⇒ <code>Promise</code>
Opens/Closes the My Views popup.

**Kind**: static method of [<code>onFlVariantManagement</code>](#onFlVariantManagement)  
**Returns**: <code>Promise</code> - The result of the [sap.ui.test.Opa5#waitFor](sap.ui.test.Opa5#waitFor) function, to be used for chained statements  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| sFlVMId | <code>string</code> | The fl variant management control ID. |

<a name="onFlVariantManagement.iOpenSaveView"></a>

### onFlVariantManagement.iOpenSaveView(sFlVMId) ⇒ <code>Promise</code>
Opens the Save View dialog.

**Kind**: static method of [<code>onFlVariantManagement</code>](#onFlVariantManagement)  
**Returns**: <code>Promise</code> - The result of the [sap.ui.test.Opa5#waitFor](sap.ui.test.Opa5#waitFor) function, to be used for chained statements  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| sFlVMId | <code>string</code> | The fl variant management control ID |

<a name="onFlVariantManagement.iOpenManageViews"></a>

### onFlVariantManagement.iOpenManageViews(sFlVMId) ⇒ <code>Promise</code>
Opens the Manage Views dialog.

**Kind**: static method of [<code>onFlVariantManagement</code>](#onFlVariantManagement)  
**Returns**: <code>Promise</code> - The result of the [sap.ui.test.Opa5#waitFor](sap.ui.test.Opa5#waitFor) function, to be used for chained statements  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| sFlVMId | <code>string</code> | The fl variant management control ID |

<a name="onFlVariantManagement.iPressTheManageViewsSave"></a>

### onFlVariantManagement.iPressTheManageViewsSave(sFlVMId) ⇒ <code>Promise</code>
Presses the Save button inside the Manage Views dialog.

**Kind**: static method of [<code>onFlVariantManagement</code>](#onFlVariantManagement)  
**Returns**: <code>Promise</code> - The result of the [sap.ui.test.Opa5#waitFor](sap.ui.test.Opa5#waitFor) function, to be used for chained statements  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| sFlVMId | <code>string</code> | The fl variant management control ID |

<a name="onFlVariantManagement.iPressTheManageViewsCancel"></a>

### onFlVariantManagement.iPressTheManageViewsCancel(sFlVMId) ⇒ <code>Promise</code>
Presses the Cancel button inside the Manage Views dialog.

**Kind**: static method of [<code>onFlVariantManagement</code>](#onFlVariantManagement)  
**Returns**: <code>Promise</code> - The result of the [sap.ui.test.Opa5#waitFor](sap.ui.test.Opa5#waitFor) function, to be used for chained statements  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| sFlVMId | <code>string</code> | The fl variant management control ID |

<a name="onFlVariantManagement.iRenameVariant"></a>

### onFlVariantManagement.iRenameVariant(sOriginalVariantName, sNewVariantName) ⇒ <code>Promise</code>
Renames a variant.
Prerequisite is an open Manage Views dialog.

**Kind**: static method of [<code>onFlVariantManagement</code>](#onFlVariantManagement)  
**Returns**: <code>Promise</code> - The result of the [sap.ui.test.Opa5#waitFor](sap.ui.test.Opa5#waitFor) function, to be used for chained statements  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| sOriginalVariantName | <code>string</code> | The previous name of a variant |
| sNewVariantName | <code>string</code> | The new name of a variant |

<a name="onFlVariantManagement.iSetDefaultVariant"></a>

### onFlVariantManagement.iSetDefaultVariant(sVariantName) ⇒ <code>Promise</code>
Sets the default for a variant.
Prerequisite is an open Manage Views dialog.

**Kind**: static method of [<code>onFlVariantManagement</code>](#onFlVariantManagement)  
**Returns**: <code>Promise</code> - The result of the [sap.ui.test.Opa5#waitFor](sap.ui.test.Opa5#waitFor) function, to be used for chained statements  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| sVariantName | <code>string</code> | The name of the new default variant |

<a name="onFlVariantManagement.iRemoveVariant"></a>

### onFlVariantManagement.iRemoveVariant(sVariantName) ⇒ <code>Promise</code>
Removes a variant.
Prerequisite is an open Manage Views dialog.

**Kind**: static method of [<code>onFlVariantManagement</code>](#onFlVariantManagement)  
**Returns**: <code>Promise</code> - The result of the [sap.ui.test.Opa5#waitFor](sap.ui.test.Opa5#waitFor) function, to be used for chained statements  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| sVariantName | <code>string</code> | The name of the new default variant |

<a name="onFlVariantManagement.iApplyAutomaticallyVariant"></a>

### onFlVariantManagement.iApplyAutomaticallyVariant(sVariantName, bApplyAuto) ⇒ <code>Promise</code>
Handles the Apply Automatically checkbox for a variant
Prerequisite is an open Manage Views dialog.

**Kind**: static method of [<code>onFlVariantManagement</code>](#onFlVariantManagement)  
**Returns**: <code>Promise</code> - The result of the [sap.ui.test.Opa5#waitFor](sap.ui.test.Opa5#waitFor) function, to be used for chained statements  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| sVariantName | <code>string</code> | The name of the variant |
| bApplyAuto | <code>boolean</code> | The Apply Automatically checkbox for the variant |

<a name="onFlVariantManagement.iCreateNewVariant"></a>

### onFlVariantManagement.iCreateNewVariant(sFlVMId, sVariantTitle, bDefault, bApplyAuto, bPublic) ⇒ <code>Promise</code>
Creates a new variant.

**Kind**: static method of [<code>onFlVariantManagement</code>](#onFlVariantManagement)  
**Returns**: <code>Promise</code> - The result of the [sap.ui.test.Opa5#waitFor](sap.ui.test.Opa5#waitFor) function, to be used for chained statements  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| sFlVMId | <code>string</code> | The fl variant management control ID |
| sVariantTitle | <code>string</code> | The name of the new variant |
| bDefault | <code>boolean</code> | Default checkbox for the variant |
| bApplyAuto | <code>boolean</code> | The Apply Automatically for the variant |
| bPublic | <code>boolean</code> | The Public information for the variant |

<a name="onFlVariantManagement.theVariantShouldBeDisplayed"></a>

### onFlVariantManagement.theVariantShouldBeDisplayed(sFlVMId, sVariantTitle) ⇒ <code>Promise</code>
Checks the expected variant title.

**Kind**: static method of [<code>onFlVariantManagement</code>](#onFlVariantManagement)  
**Returns**: <code>Promise</code> - The result of the [sap.ui.test.Opa5#waitFor](sap.ui.test.Opa5#waitFor) function, to be used for chained statements  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| sFlVMId | <code>string</code> | The fl variant management control ID |
| sVariantTitle | <code>string</code> | The name of the expected variant |

<a name="onFlVariantManagement.theMyViewShouldContain"></a>

### onFlVariantManagement.theMyViewShouldContain(sFlVMId, aVariantNames) ⇒ <code>Promise</code>
Checks the expected variant titles.
Prerequisite is an open My Views popup.

**Kind**: static method of [<code>onFlVariantManagement</code>](#onFlVariantManagement)  
**Returns**: <code>Promise</code> - The result of the [sap.ui.test.Opa5#waitFor](sap.ui.test.Opa5#waitFor) function, to be used for chained statements  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| sFlVMId | <code>string</code> | The fl variant management control ID |
| aVariantNames | <code>array</code> | List of the expected variants |

<a name="onFlVariantManagement.theOpenSaveViewDialog"></a>

### onFlVariantManagement.theOpenSaveViewDialog(sFlVMId) ⇒ <code>Promise</code>
Checks is the expected Save View dialog is open.

**Kind**: static method of [<code>onFlVariantManagement</code>](#onFlVariantManagement)  
**Returns**: <code>Promise</code> - The result of the [sap.ui.test.Opa5#waitFor](sap.ui.test.Opa5#waitFor) function, to be used for chained statements  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| sFlVMId | <code>string</code> | The fl variant management control ID |

<a name="onFlVariantManagement.theOpenManageViewsDialog"></a>

### onFlVariantManagement.theOpenManageViewsDialog(sFlVMId) ⇒ <code>Promise</code>
Checks is the expected Manage Views dialog is open.

**Kind**: static method of [<code>onFlVariantManagement</code>](#onFlVariantManagement)  
**Returns**: <code>Promise</code> - The result of the [sap.ui.test.Opa5#waitFor](sap.ui.test.Opa5#waitFor) function, to be used for chained statements  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| sFlVMId | <code>string</code> | The fl variant management control ID |

<a name="onFlVariantManagement.theOpenManageViewsDialogTitleShouldContain"></a>

### onFlVariantManagement.theOpenManageViewsDialogTitleShouldContain(aVariantNames) ⇒ <code>Promise</code>
Checks the variants in the Manage Views dialog.
Prerequisite is an open Manage Views dialog.

**Kind**: static method of [<code>onFlVariantManagement</code>](#onFlVariantManagement)  
**Returns**: <code>Promise</code> - The result of the [sap.ui.test.Opa5#waitFor](sap.ui.test.Opa5#waitFor) function, to be used for chained statements  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| aVariantNames | <code>array</code> | List of the expected variants |

<a name="onFlVariantManagement.theOpenManageViewsDialogFavoritesShouldContain"></a>

### onFlVariantManagement.theOpenManageViewsDialogFavoritesShouldContain(aVariantFavorites) ⇒ <code>Promise</code>
Checks the variants with the Favorite checkbox set in the Manage Views dialog.
Prerequisite is an open Manage Views dialog.

**Kind**: static method of [<code>onFlVariantManagement</code>](#onFlVariantManagement)  
**Returns**: <code>Promise</code> - The result of the [sap.ui.test.Opa5#waitFor](sap.ui.test.Opa5#waitFor) function, to be used for chained statements  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| aVariantFavorites | <code>array</code> | List of the expected variants |

<a name="onFlVariantManagement.theOpenManageViewsDialogApplyAutomaticallyShouldContain"></a>

### onFlVariantManagement.theOpenManageViewsDialogApplyAutomaticallyShouldContain(aVariantApplayAutos) ⇒ <code>Promise</code>
Checks the variants with the Apply Automatically checkbox set in the Manage Views dialog.
Prerequisite is an open Manage Views dialog.

**Kind**: static method of [<code>onFlVariantManagement</code>](#onFlVariantManagement)  
**Returns**: <code>Promise</code> - The result of the [sap.ui.test.Opa5#waitFor](sap.ui.test.Opa5#waitFor) function, to be used for chained statements  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| aVariantApplayAutos | <code>array</code> | List of the expected variants |

<a name="onFlVariantManagement.theOpenManageViewsDialogSharingShouldContain"></a>

### onFlVariantManagement.theOpenManageViewsDialogSharingShouldContain(aVariantSharing) ⇒ <code>Promise</code>
Checks the variants for its sharing information.
Prerequisite is an open Manage Views dialog.

**Kind**: static method of [<code>onFlVariantManagement</code>](#onFlVariantManagement)  
**Returns**: <code>Promise</code> - The result of the [sap.ui.test.Opa5#waitFor](sap.ui.test.Opa5#waitFor) function, to be used for chained statements  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| aVariantSharing | <code>array</code> | List of the expected sharing information of the variants |

<a name="onFlVariantManagement.theOpenManageViewsDialogDefaultShouldBe"></a>

### onFlVariantManagement.theOpenManageViewsDialogDefaultShouldBe(sVariantName) ⇒ <code>Promise</code>
Checks for the expected default variant.
Prerequisite is an open Manage Views dialog.

**Kind**: static method of [<code>onFlVariantManagement</code>](#onFlVariantManagement)  
**Returns**: <code>Promise</code> - The result of the [sap.ui.test.Opa5#waitFor](sap.ui.test.Opa5#waitFor) function, to be used for chained statements  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| sVariantName | <code>string</code> | The expected default variant |

