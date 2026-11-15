package com.arpitagarwala.widgets;

import android.content.Context;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.view.View;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;

final class StudioUi {
    static final int BACKGROUND = Color.rgb(16,18,20);
    static final int SURFACE = Color.rgb(27,31,34);
    static final int INK = Color.rgb(237,234,227);
    static final int MUTED = Color.rgb(157,168,176);
    static final int LINE = Color.rgb(61,69,75);
    static final int ACCENT = Color.rgb(184,202,215);

    static int dp(Context context,int value) {
        return Math.round(value*context.getResources().getDisplayMetrics().density);
    }
    static GradientDrawable background(Context context,int color,int border,int radius) {
        GradientDrawable shape=new GradientDrawable();
        shape.setColor(color);
        shape.setCornerRadius(dp(context,radius));
        shape.setStroke(dp(context,1),border);
        return shape;
    }
    static TextView text(Context context,String value,int size,int color) {
        TextView view=new TextView(context);
        view.setText(value);
        view.setTextSize(size);
        view.setTextColor(color);
        view.setFontFeatureSettings("tnum");
        return view;
    }
    static LinearLayout column(Context context) {
        LinearLayout view=new LinearLayout(context);
        view.setOrientation(LinearLayout.VERTICAL);
        return view;
    }
    static Button button(Context context,String label,boolean primary,Runnable action) {
        Button button=new Button(context);
        button.setText(label);
        button.setTextSize(14);
        button.setAllCaps(false);
        button.setTypeface(Typeface.create("sans-serif-medium",Typeface.NORMAL));
        button.setTextColor(primary?BACKGROUND:INK);
        button.setBackground(background(context,primary?ACCENT:SURFACE,primary?ACCENT:LINE,8));
        button.setMinHeight(dp(context,48));
        button.setPadding(dp(context,16),dp(context,10),dp(context,16),dp(context,10));
        button.setOnClickListener(view->action.run());
        LinearLayout.LayoutParams params=new LinearLayout.LayoutParams(-1,-2);
        params.topMargin=dp(context,10);
        button.setLayoutParams(params);
        return button;
    }
    static void inset(LinearLayout view,Context context) {
        int padding=dp(context,22);
        view.setPadding(padding,padding,padding,padding);
        view.setOnApplyWindowInsetsListener((target,insets)->{
            target.setPadding(padding+insets.getSystemWindowInsetLeft(),
                padding+insets.getSystemWindowInsetTop(),
                padding+insets.getSystemWindowInsetRight(),
                padding+insets.getSystemWindowInsetBottom());
            return insets;
        });
    }
}
