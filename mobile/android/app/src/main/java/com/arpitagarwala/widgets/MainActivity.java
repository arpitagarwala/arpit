package com.arpitagarwala.widgets;

import android.app.Activity;
import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.view.Gravity;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextClock;
import android.widget.TextView;
import android.widget.Toast;

public class MainActivity extends Activity {
    private static final Class<?>[] PROVIDERS={ClockWidget.class,FocusWidget.class,CalculatorWidget.class,GameWidget.class};
    private static final String[] TITLES={"Clock","Focus timer","Calculator","Tic Tac Toe"};
    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        LinearLayout page=StudioUi.column(this);
        StudioUi.inset(page,this);
        page.setBackgroundColor(StudioUi.BACKGROUND);

        LinearLayout brand=new LinearLayout(this);
        brand.setGravity(Gravity.CENTER_VERTICAL);
        ImageView logo=new ImageView(this);
        logo.setImageResource(R.drawable.app_icon);
        logo.setContentDescription("Arpit Agarwala monogram");
        brand.addView(logo,new LinearLayout.LayoutParams(StudioUi.dp(this,48),StudioUi.dp(this,48)));
        TextView name=StudioUi.text(this,"Arpit Agarwala",17,StudioUi.INK);
        name.setPadding(StudioUi.dp(this,12),0,0,0);
        brand.addView(name);
        page.addView(brand);

        TextView title=StudioUi.text(this,"Widgets",32,StudioUi.INK);
        title.setPadding(0,StudioUi.dp(this,28),0,StudioUi.dp(this,8));
        page.addView(title);
        TextView guide=StudioUi.text(this,"Add a widget, then press and hold it on your home screen to resize. Tap its ⋮ button to change its appearance.",14,StudioUi.MUTED);
        guide.setLineSpacing(StudioUi.dp(this,4),1);
        page.addView(guide);

        for(int index=0;index<PROVIDERS.length;index++) {
            final Class<?> provider=PROVIDERS[index];
            LinearLayout card=StudioUi.column(this);
            card.setPadding(StudioUi.dp(this,18),StudioUi.dp(this,16),StudioUi.dp(this,18),StudioUi.dp(this,16));
            card.setBackground(StudioUi.background(this,StudioUi.SURFACE,StudioUi.LINE,12));
            LinearLayout.LayoutParams cardParams=new LinearLayout.LayoutParams(-1,-2);
            cardParams.topMargin=StudioUi.dp(this,16);
            card.setLayoutParams(cardParams);
            card.addView(StudioUi.text(this,TITLES[index],16,StudioUi.INK));
            if(index==0) {
                TextClock clock=new TextClock(this);
                clock.setFormat12Hour("h:mm a");clock.setFormat24Hour("HH:mm");
                clock.setTextSize(36);clock.setTextColor(StudioUi.INK);
                clock.setPadding(0,StudioUi.dp(this,12),0,0);
                card.addView(clock);
            } else {
                String detail=index==1?"Focus and break durations, appearance and text size."
                    :index==2?"Calculate directly from your home screen."
                    :"A compact board for a short game.";
                TextView subtitle=StudioUi.text(this,detail,13,StudioUi.MUTED);
                subtitle.setPadding(0,StudioUi.dp(this,10),0,0);
                card.addView(subtitle);
            }
            card.addView(StudioUi.button(this,"Add widget",false,()->pin(provider)));
            int[] ids=getSystemService(AppWidgetManager.class).getAppWidgetIds(new ComponentName(this,provider));
            for(int position=0;position<ids.length;position++) {
                final int id=ids[position];
                String label=ids.length==1?"Customize existing widget":"Customize widget "+(position+1);
                card.addView(StudioUi.button(this,label,false,()->configure(id)));
            }
            page.addView(card);
        }
        TextView note=StudioUi.text(this,"Native widgets save on this phone. The web workspace provides your synced account tools.",12,StudioUi.MUTED);
        note.setPadding(0,StudioUi.dp(this,24),0,StudioUi.dp(this,8));
        page.addView(note);
        page.addView(StudioUi.button(this,"Open workspace",true,()->website("/widgets")));
        page.addView(StudioUi.button(this,"Website",false,()->website("/")));
        page.addView(StudioUi.button(this,"Email support",false,()->{
            try {startActivity(new Intent(Intent.ACTION_SENDTO,Uri.parse("mailto:connect@arpitagarwala.com")));}
            catch(android.content.ActivityNotFoundException failure){Toast.makeText(this,"connect@arpitagarwala.com",Toast.LENGTH_LONG).show();}
        }));
        ScrollView scroll=new ScrollView(this);scroll.setFillViewport(true);
        scroll.addView(page);setContentView(scroll);
    }
    private void configure(int id) {
        startActivity(new Intent(this,ConfigureActivity.class).putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID,id));
    }
    private void pin(Class<?> provider) {
        AppWidgetManager manager=getSystemService(AppWidgetManager.class);
        if(!manager.isRequestPinAppWidgetSupported()) {
            Toast.makeText(this,"Press and hold your home screen, then choose Widgets.",Toast.LENGTH_LONG).show();
            return;
        }
        Intent intent=new Intent(this,ConfigureActivity.class);
        PendingIntent callback=PendingIntent.getActivity(this,provider.getName().hashCode(),intent,
            PendingIntent.FLAG_UPDATE_CURRENT|PendingIntent.FLAG_MUTABLE);
        manager.requestPinAppWidget(new ComponentName(this,provider),null,callback);
    }
    private void website(String path) {
        Intent intent=new Intent(Intent.ACTION_VIEW,Uri.parse("https://arpitagarwala.com"+path));
        Bundle extras=new Bundle();
        extras.putBinder("android.support.customtabs.extra.SESSION",null);
        intent.putExtras(extras);
        try {startActivity(intent);}
        catch(android.content.ActivityNotFoundException failure){Toast.makeText(this,"Open arpitagarwala.com in a browser.",Toast.LENGTH_LONG).show();}
    }
}
