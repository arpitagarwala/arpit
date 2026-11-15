package com.arpitagarwala.widgets;

import android.app.Activity;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProviderInfo;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.view.View;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.CheckBox;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.SeekBar;
import android.widget.Spinner;
import android.widget.TextView;
import android.widget.Toast;

public class ConfigureActivity extends Activity {
    private int widgetId;
    private SharedPreferences state;
    private Spinner theme;
    private Spinner focus;
    private Spinner rest;
    private SeekBar textSize;
    private CheckBox translucent;
    private CheckBox hour12;
    private CheckBox seconds;
    private TextView preview;
    private TextView previewDate;
    private LinearLayout previewBox;
    private final int[] focusMinutes={15,20,25,30,45,60,90};
    private final int[] breakMinutes={3,5,10,15,20};

    @Override public void onCreate(Bundle saved) {
        super.onCreate(saved);
        setResult(RESULT_CANCELED);
        widgetId=getIntent().getIntExtra(AppWidgetManager.EXTRA_APPWIDGET_ID,AppWidgetManager.INVALID_APPWIDGET_ID);
        AppWidgetProviderInfo info=getSystemService(AppWidgetManager.class).getAppWidgetInfo(widgetId);
        if(info==null||!info.provider.getPackageName().equals(getPackageName())) {finish();return;}
        state=getSharedPreferences("widget-"+widgetId,MODE_PRIVATE);
        boolean isClock=info.provider.getClassName().equals(ClockWidget.class.getName());
        boolean isFocus=info.provider.getClassName().equals(FocusWidget.class.getName());
        LinearLayout page=StudioUi.column(this);
        StudioUi.inset(page,this);page.setBackgroundColor(StudioUi.BACKGROUND);
        page.addView(StudioUi.text(this,"Customize widget",27,StudioUi.INK));
        TextView hint=StudioUi.text(this,"Resize on your home screen by pressing and holding the widget, then dragging its handles. Your launcher controls the available grid sizes.",14,StudioUi.MUTED);
        hint.setPadding(0,StudioUi.dp(this,12),0,StudioUi.dp(this,22));page.addView(hint);
        previewBox=StudioUi.column(this);
        previewBox.setPadding(StudioUi.dp(this,20),StudioUi.dp(this,20),StudioUi.dp(this,20),StudioUi.dp(this,20));
        previewBox.addView(StudioUi.text(this,"Preview",11,StudioUi.MUTED));
        preview=StudioUi.text(this,isClock?"09:41":isFocus?"25:00":"Arpit Agarwala",38,StudioUi.INK);
        previewBox.addView(preview);
        if(isClock) {
            previewDate=StudioUi.text(this,android.text.format.DateFormat.format("EEE, d MMM",new java.util.Date()).toString(),13,StudioUi.MUTED);
            previewBox.addView(previewDate);
        }
        page.addView(previewBox);

        theme=spinner(page,"Appearance",new String[]{"Graphite","Slate","Paper"},state.getInt("theme",0));
        translucent=new CheckBox(this);
        translucent.setText("Translucent background");translucent.setTextColor(StudioUi.INK);
        translucent.setChecked(state.getBoolean("translucent",false));page.addView(translucent);
        TextView sizeLabel=StudioUi.text(this,"Text size · "+state.getInt("textSize",100)+"%",14,StudioUi.INK);
        sizeLabel.setPadding(0,StudioUi.dp(this,18),0,StudioUi.dp(this,8));page.addView(sizeLabel);
        textSize=new SeekBar(this);textSize.setMax(50);
        textSize.setProgress(state.getInt("textSize",100)-80);page.addView(textSize);
        textSize.setOnSeekBarChangeListener(new SeekBar.OnSeekBarChangeListener(){
            public void onProgressChanged(SeekBar bar,int value,boolean user){sizeLabel.setText("Text size · "+(value+80)+"%");updatePreview();}
            public void onStartTrackingTouch(SeekBar bar){}
            public void onStopTrackingTouch(SeekBar bar){}
        });
        theme.setOnItemSelectedListener(new AdapterView.OnItemSelectedListener(){
            public void onItemSelected(AdapterView<?> parent,View view,int position,long id){updatePreview();}
            public void onNothingSelected(AdapterView<?> parent){}
        });
        translucent.setOnCheckedChangeListener((button,checked)->updatePreview());
        if(isClock) {
            hour12=new CheckBox(this);hour12.setText("12-hour clock");hour12.setTextColor(StudioUi.INK);
            hour12.setChecked(state.getBoolean("hour12",false));page.addView(hour12);
            seconds=new CheckBox(this);seconds.setText("Show date");seconds.setTextColor(StudioUi.INK);
            seconds.setChecked(state.getBoolean("showDate",true));page.addView(seconds);
            hour12.setOnCheckedChangeListener((button,checked)->updatePreview());
            seconds.setOnCheckedChangeListener((button,checked)->updatePreview());
            page.addView(StudioUi.text(this,"The date is hidden automatically at the smallest widget height.",12,StudioUi.MUTED));
        }
        if(isFocus) {
            focus=spinner(page,"Focus duration",new String[]{"15 minutes","20 minutes","25 minutes","30 minutes","45 minutes","60 minutes","90 minutes"},position(focusMinutes,state.getInt("focusMinutes",25)));
            rest=spinner(page,"Break duration",new String[]{"3 minutes","5 minutes","10 minutes","15 minutes","20 minutes"},position(breakMinutes,state.getInt("breakMinutes",5)));
            focus.setOnItemSelectedListener(new AdapterView.OnItemSelectedListener(){
                public void onItemSelected(AdapterView<?> parent,View view,int position,long id){updatePreview();}
                public void onNothingSelected(AdapterView<?> parent){}
            });
            TextView note=StudioUi.text(this,"Pause the timer before changing its duration. Changing duration resets the paused timer.",12,StudioUi.MUTED);
            page.addView(note);
        }
        page.addView(StudioUi.button(this,"Apply changes",true,this::save));
        page.addView(StudioUi.button(this,"Cancel",false,this::finish));
        ScrollView scroll=new ScrollView(this);scroll.addView(page);setContentView(scroll);
        updatePreview();
    }
    private int position(int[] values,int selected) {
        for(int index=0;index<values.length;index++)if(values[index]==selected)return index;
        return 0;
    }
    private Spinner spinner(LinearLayout page,String label,String[] options,int selected) {
        TextView title=StudioUi.text(this,label,14,StudioUi.INK);
        title.setPadding(0,StudioUi.dp(this,20),0,StudioUi.dp(this,8));page.addView(title);
        Spinner control=new Spinner(this);
        ArrayAdapter<String> adapter=new ArrayAdapter<>(this,android.R.layout.simple_spinner_dropdown_item,options);
        control.setAdapter(adapter);control.setSelection(Math.max(0,Math.min(options.length-1,selected)));
        control.setMinimumHeight(StudioUi.dp(this,48));
        page.addView(control);return control;
    }
    private void updatePreview() {
        if(theme==null||textSize==null||preview==null)return;
        int selected=theme.getSelectedItemPosition();
        int surface=selected==2?0xfff0eee8:selected==1?0xff18232c:0xff1a1d20;
        if(translucent!=null&&translucent.isChecked())surface=(surface&0x00ffffff)|0xcc000000;
        int ink=selected==2?0xff24282b:0xffeeeae2;
        previewBox.setBackground(StudioUi.background(this,surface,selected==2?0xffcccdc7:0xff3c444a,12));
        preview.setTextColor(ink);preview.setTextSize(38*(textSize.getProgress()+80)/100f);
        if(hour12!=null)preview.setText(hour12.isChecked()?"9:41 AM":"09:41");
        if(previewDate!=null) {
            previewDate.setTextColor(selected==2?0xff575f63:0xffa3a9ae);
            previewDate.setVisibility(seconds==null||seconds.isChecked()?View.VISIBLE:View.GONE);
        }
        if(focus!=null)preview.setText(String.format(java.util.Locale.ROOT,"%02d:00",focusMinutes[focus.getSelectedItemPosition()]));
    }
    private void save() {
        SharedPreferences.Editor edit=state.edit();
        if(focus!=null) {
            int focusValue=focusMinutes[focus.getSelectedItemPosition()];
            int breakValue=breakMinutes[rest.getSelectedItemPosition()];
            boolean changed=focusValue!=state.getInt("focusMinutes",25)||breakValue!=state.getInt("breakMinutes",5);
            if(changed&&state.getLong("deadline",0)>System.currentTimeMillis()){
                Toast.makeText(this,"Pause the timer before changing its duration.",Toast.LENGTH_LONG).show();return;
            }
            edit.putInt("focusMinutes",focusValue).putInt("breakMinutes",breakValue);
            if(changed)edit.putLong("deadline",0).putLong("remaining",(state.getBoolean("break",false)?breakValue:focusValue)*60000L);
        }
        edit.putInt("theme",theme.getSelectedItemPosition()).putInt("textSize",textSize.getProgress()+80)
            .putBoolean("translucent",translucent.isChecked());
        if(hour12!=null)edit.putBoolean("hour12",hour12.isChecked()).putBoolean("showDate",seconds.isChecked());
        edit.apply();
        WidgetProvider.refresh(this,widgetId);
        setResult(RESULT_OK,new Intent().putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID,widgetId));
        finish();
    }
}
