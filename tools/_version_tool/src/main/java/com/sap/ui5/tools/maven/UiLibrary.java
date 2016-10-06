package com.sap.ui5.tools.maven;

public class UiLibrary {
	private String propertyName;
	private Boolean hasSnapshot;
	
	public UiLibrary(String propName, Boolean hasSnapshot){
		this.propertyName = propName;
		this.hasSnapshot = hasSnapshot;				
	}
	
	String getName(){
		return propertyName;
	}
	
	Boolean hasSnapshot(){
		return hasSnapshot;
	}			
}
