package com.sap.ui5.modules.librarytests.commons.pages;

import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.FindBy;

import com.sap.ui5.selenium.common.PageBase;

public class SplitterPO extends PageBase {

	@FindBy(id = "splitter1")
	public WebElement splitter1;

	@FindBy(id = "splitter1-hideSB")
	public WebElement splitter1HideBtn;

	@FindBy(id = "splitter1-showSB")
	public WebElement splitter1ShowBtn;

	@FindBy(id = "splitter1_SB")
	public WebElement splitter1Bar;

	@FindBy(id = "splitter1_firstPane")
	public WebElement splitter1FirstPane;

	@FindBy(id = "splitter1_secondPane")
	public WebElement splitter1SecondPane;

	@FindBy(id = "splitter5")
	public WebElement splitter5;

	@FindBy(id = "splitter5_SB")
	public WebElement splitter5Bar;

	@FindBy(id = "splitter5_firstPane")
	public WebElement splitter5FirstPane;

	@FindBy(id = "splitter5_secondPane")
	public WebElement splitter5SecondPane;

	@FindBy(id = "splitter3")
	public WebElement splitter3;

	@FindBy(id = "splitter3_SB")
	public WebElement splitter3Bar;

	@FindBy(id = "splitter3_firstPane")
	public WebElement splitter3FirstPane;

	@FindBy(id = "splitter3_secondPane")
	public WebElement splitter3SecondPane;

	public String target1Id = "target1";

	public String target3Id = "target3";

	public String target5Id = "target5";

	public void moveSplitter5BarToCenter(Actions actions, boolean isRtl) {
		int rtl = isRtl ? -1 : 1;
		int middleX = splitter5.getSize().width / 2 - splitter5FirstPane.getSize().width;
		actions.dragAndDropBy(splitter5Bar, middleX * rtl, splitter5.getSize().height / 2);
	}

	public void moveSplitter1BarToCenter(Actions actions) {
		int middleY = splitter1.getSize().height / 2 - splitter1FirstPane.getSize().height;
		actions.dragAndDropBy(splitter1Bar, splitter1.getSize().width / 2, middleY);
	}

}
