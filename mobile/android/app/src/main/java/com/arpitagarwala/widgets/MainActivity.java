package com.arpitagarwala.widgets;

import android.app.Activity;
import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

public class MainActivity extends Activity {
    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        LinearLayout layout = new LinearLayout(this);
        layout.setOrientation(LinearLayout.VERTICAL);
        int padding = (int) (24 * getResources().getDisplayMetrics().density);
        layout.setPadding(padding,padding,padding,padding);
        layout.setOnApplyWindowInsetsListener((view,insets) -> {
            view.setPadding(padding + insets.getSystemWindowInsetLeft(),
                padding + insets.getSystemWindowInsetTop(),
                padding + insets.getSystemWindowInsetRight(),
                padding + insets.getSystemWindowInsetBottom());
            return insets;
        });
        layout.setBackgroundColor(Color.rgb(11,24,19));
        TextView title = new TextView(this);
        title.setText("Arpit Agarwala\nYour everyday essentials.");
        title.setTextSize(28);
        title.setTextColor(Color.rgb(222,244,230));
        layout.addView(title);
        TextView guide = new TextView(this);
        guide.setText("Add a widget below, or long-press your home screen and choose Widgets → Arpit Agarwala.\n\nNative widgets save on this phone. Open the website for your synced account tools.");
        guide.setTextSize(15); guide.setTextColor(Color.rgb(168,196,179));
        guide.setPadding(0,24,0,24); layout.addView(guide);
        addButton(layout,"Add clock widget",() -> pin(ClockWidget.class));
        addButton(layout,"Add focus timer widget",() -> pin(FocusWidget.class));
        addButton(layout,"Add calculator widget",() -> pin(CalculatorWidget.class));
        addButton(layout,"Add Tic Tac Toe widget",() -> pin(GameWidget.class));
        addButton(layout,"Open the whole website",() -> website("/"));
        addButton(layout,"Open synced web widgets",() -> website("/widgets"));
        addButton(layout,"Email support",() -> {
            try { startActivity(new Intent(Intent.ACTION_SENDTO,Uri.parse("mailto:connect@arpitagarwala.com"))); }
            catch (android.content.ActivityNotFoundException failure) { Toast.makeText(this,"Email connect@arpitagarwala.com",Toast.LENGTH_LONG).show(); }
        });
        android.widget.ScrollView scroll = new android.widget.ScrollView(this);
        scroll.addView(layout); setContentView(scroll);
    }
    private void addButton(LinearLayout layout,String label,Runnable action) {
        Button button = new Button(this); button.setText(label); button.setTextSize(14);
        button.setOnClickListener(view -> action.run()); layout.addView(button);
    }
    private void pin(Class<?> provider) {
        AppWidgetManager manager = getSystemService(AppWidgetManager.class);
        if (manager.isRequestPinAppWidgetSupported()) manager.requestPinAppWidget(new ComponentName(this,provider),null,null);
        else Toast.makeText(this,"Long-press your home screen, then choose Widgets.",Toast.LENGTH_LONG).show();
    }
    private void website(String path) {
        Intent intent = new Intent(Intent.ACTION_VIEW,Uri.parse("https://arpitagarwala.com" + path));
        Bundle extras = new Bundle();
        extras.putBinder("android.support.customtabs.extra.SESSION",null);
        intent.putExtras(extras);
        try {startActivity(intent);}
        catch (android.content.ActivityNotFoundException failure) {Toast.makeText(this,"Install a browser to open arpitagarwala.com.",Toast.LENGTH_LONG).show();}
    }
}
