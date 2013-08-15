package com.sap.comparator;

import java.util.Comparator;
import java.util.Map;

import com.sap.constants.Constants;

public class FailedImageNameComparator implements Comparator<Map<String, Object>> {

    @SuppressWarnings("unchecked")
    @Override
    public int compare(Map<String, Object> o1, Map<String, Object> o2) {
        Map<String, Object> verifyObj1 = (Map<String, Object>)o1.get(Constants.VERIFY);
        Map<String, Object> verifyObj2 = (Map<String, Object>)o2.get(Constants.VERIFY);
        String imageName1 = (String)verifyObj1.get(Constants.NAME);
        String imageName2 = (String)verifyObj2.get(Constants.NAME);
        return imageName1.compareTo(imageName2);
    }

}
