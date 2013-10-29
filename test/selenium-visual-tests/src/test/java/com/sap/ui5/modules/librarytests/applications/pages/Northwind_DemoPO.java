package com.sap.ui5.modules.librarytests.applications.pages;

import com.sap.ui5.selenium.common.PageBase;

public class Northwind_DemoPO extends PageBase {

	public String oTableId = "oTable";

	public String row1SelectorId = oTableId + "-rowsel0";

	public String row10SelectorId = oTableId + "-rowsel9";

	public String row1ProductId = "__view1-col0-row0";

	public String oTableScrollbarId = oTableId + "-vsb";

	public String productPanelArrowId = "__panel0-collArrow";

	public String productPanelIconId = "__panel0-collIco";

	public String supplierPanelArrowId = "__panel1-collArrow";

	public String categoryPanelIconId = "__panel2-collIco";

	public String categoryPanelArrowId = "__panel2-collArrow";

	public String supplierPanelIconId = "__panel1-collIco";

	public String openButtonId = "__button0";

	public String backButtonId = "__button2";

	public String productIDId = "__label0";

	public String productSortDescId = "__column0-menu-desc";

	public String productSortAscId = "__column0-menu-asc";

	public String productNameFilterId = "__column1-menu-filter-tf";

	public String categoryFilterId = "__column3-menu-filter-tf";

	public String quantityFilterId = "__column4-menu-filter-tf";

	public String discontinuedFilterId = "__column9-menu-filter-tf";

}