package com.example.demoappepmperformance;

import android.os.Bundle;
import android.view.Menu;
import org.apache.cordova.*;

public class MainActivity extends DroidGap {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        //super.setIntegerProperty("loadUrlTimeoutValue", 10000);
        super.loadUrl("file:///android_asset/www/index.html");
        //setContentView(R.layout.activity_main);
    }

}
