package com.arpitagarwala.widgets;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.appwidget.AppWidgetProviderInfo;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.SystemClock;
import android.os.Bundle;
import android.content.res.Configuration;
import android.util.TypedValue;
import android.view.View;
import android.widget.RemoteViews;

public class WidgetProvider extends AppWidgetProvider {
    private static final String ACTION = "com.arpitagarwala.widgets.ACTION";
    private static final int[] CALC_IDS = {R.id.key_0,R.id.key_1,R.id.key_2,R.id.key_3,R.id.key_4,R.id.key_5,R.id.key_6,R.id.key_7,R.id.key_8,R.id.key_9,R.id.key_10,R.id.key_11,R.id.key_12,R.id.key_13,R.id.key_14,R.id.key_15};
    private static final String[] CALC_KEYS = {"7","8","9","/","4","5","6","*","1","2","3","-","0",".","C","+"};
    private static final int[] CELLS = {R.id.cell_0,R.id.cell_1,R.id.cell_2,R.id.cell_3,R.id.cell_4,R.id.cell_5,R.id.cell_6,R.id.cell_7,R.id.cell_8};
    private static final int[][] LINES = {{0,1,2},{3,4,5},{6,7,8},{0,3,6},{1,4,7},{2,5,8},{0,4,8},{2,4,6}};

    @Override public void onUpdate(Context context,AppWidgetManager manager,int[] ids) {
        for (int id : ids) render(context,manager,id);
    }
    @Override public void onAppWidgetOptionsChanged(Context context,AppWidgetManager manager,int id,Bundle options) {
        render(context,manager,id);
    }
    static void refresh(Context context,int id) {
        AppWidgetManager manager=AppWidgetManager.getInstance(context);
        AppWidgetProviderInfo info=manager.getAppWidgetInfo(id);
        if(info==null||!info.provider.getPackageName().equals(context.getPackageName()))return;
        String name=info.provider.getClassName();
        WidgetProvider provider;
        if(name.equals(ClockWidget.class.getName()))provider=new ClockWidget();
        else if(name.equals(FocusWidget.class.getName()))provider=new FocusWidget();
        else if(name.equals(CalculatorWidget.class.getName()))provider=new CalculatorWidget();
        else if(name.equals(GameWidget.class.getName()))provider=new GameWidget();
        else return;
        provider.render(context,manager,id);
    }
    @Override public void onDeleted(Context context,int[] ids) {
        for (int id : ids) {
            context.getSharedPreferences("widget-"+id,Context.MODE_PRIVATE).edit().clear().apply();
            context.getSystemService(AlarmManager.class).cancel(action(context,id,"finish"));
        }
    }
    @Override public void onReceive(Context context,Intent intent) {
        super.onReceive(context,intent);
        if (!ACTION.equals(intent.getAction())) return;
        int id=intent.getIntExtra(AppWidgetManager.EXTRA_APPWIDGET_ID,-1);
        AppWidgetManager manager=AppWidgetManager.getInstance(context);
        AppWidgetProviderInfo info=manager.getAppWidgetInfo(id);
        if (info==null || !info.provider.getPackageName().equals(context.getPackageName()) || !info.provider.getClassName().equals(getClass().getName())) return;
        String operation=intent.getStringExtra("operation");
        if (operation==null) return;
        SharedPreferences state=context.getSharedPreferences("widget-"+id,Context.MODE_PRIVATE);
        if (this instanceof FocusWidget) focus(context,id,state,operation);
        if (this instanceof CalculatorWidget) calculator(state,operation);
        if (this instanceof GameWidget) game(state,operation);
        render(context,manager,id);
    }
    private PendingIntent action(Context context,int id,String operation) {
        Intent intent=new Intent(context,getClass()).setAction(ACTION);
        intent.setData(android.net.Uri.parse("arpit-widget://"+id+"/"+android.net.Uri.encode(operation)));
        intent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID,id);
        intent.putExtra("operation",operation);
        return PendingIntent.getBroadcast(context,id,intent,PendingIntent.FLAG_UPDATE_CURRENT|PendingIntent.FLAG_IMMUTABLE);
    }
    private void focus(Context context,int id,SharedPreferences state,String operation) {
        long now=System.currentTimeMillis();
        boolean shortBreak=state.getBoolean("break",false);
        long focusDuration=state.getInt("focusMinutes",25)*60000L;
        long breakDuration=state.getInt("breakMinutes",5)*60000L;
        long duration=shortBreak?breakDuration:focusDuration;
        long deadline=state.getLong("deadline",0);
        long left=deadline>0?Math.max(0,deadline-now):state.getLong("remaining",duration);
        SharedPreferences.Editor edit=state.edit();
        AlarmManager alarms=context.getSystemService(AlarmManager.class);
        alarms.cancel(action(context,id,"finish"));
        if ("mode".equals(operation)) edit.putBoolean("break",!shortBreak).putLong("remaining",shortBreak?focusDuration:breakDuration).putLong("deadline",0);
        else if ("reset".equals(operation)) edit.putLong("remaining",duration).putLong("deadline",0);
        else if ("finish".equals(operation) && deadline>now) {
            alarms.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP,deadline,action(context,id,"finish"));
        } else if ("finish".equals(operation)) edit.putLong("remaining",0).putLong("deadline",0);
        else if ("toggle".equals(operation)) {
            if (deadline>0) edit.putLong("remaining",left).putLong("deadline",0);
            else {
                if (left<=0)left=duration;
                deadline=now+left;
                edit.putLong("remaining",left).putLong("deadline",deadline);
                alarms.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP,deadline,action(context,id,"finish"));
            }
        }
        edit.apply();
    }
    private void calculator(SharedPreferences state,String operation) {
        String expression=state.getString("expression","");
        if ("C".equals(operation)) expression="";
        else if ("=".equals(operation)) {
            try { expression=Arithmetic.calculate(expression); }
            catch (RuntimeException failure) { expression="Error"; }
        } else {
            if ("Error".equals(expression)) expression="";
            if (expression.length()<60 && "0123456789.+-*/".contains(operation)) expression+=operation;
        }
        state.edit().putString("expression",expression).apply();
    }
    static String winner(String board) {
        for(int[] line:LINES) if(board.charAt(line[0])!=' ' && board.charAt(line[0])==board.charAt(line[1]) && board.charAt(line[0])==board.charAt(line[2])) return String.valueOf(board.charAt(line[0]));
        return board.contains(" ")?"":"draw";
    }
    private void game(SharedPreferences state,String operation) {
        String board=state.getString("board","         ");
        String turn=state.getString("turn","X");
        if("new".equals(operation)) {board="         ";turn="X";}
        else if(operation.startsWith("cell-") && winner(board).isEmpty()) {
            try {
                int index=Integer.parseInt(operation.substring(5));
                if(index>=0 && index<9 && board.charAt(index)==' ') {
                    char[] cells=board.toCharArray();cells[index]=turn.charAt(0);board=new String(cells);
                    turn="X".equals(turn)?"O":"X";
                }
            } catch(NumberFormatException ignored) {}
        }
        state.edit().putString("board",board).putString("turn",turn).apply();
    }
    private void render(Context context,AppWidgetManager manager,int id) {
        SharedPreferences state=context.getSharedPreferences("widget-"+id,Context.MODE_PRIVATE);
        RemoteViews views;
        if(this instanceof ClockWidget) {
            views=new RemoteViews(context.getPackageName(),R.layout.widget_clock);
            Intent launch=new Intent(context,MainActivity.class);
            views.setOnClickPendingIntent(R.id.widget_root,PendingIntent.getActivity(context,id,launch,PendingIntent.FLAG_UPDATE_CURRENT|PendingIntent.FLAG_IMMUTABLE));
        } else if(this instanceof FocusWidget) {
            views=new RemoteViews(context.getPackageName(),R.layout.widget_focus);
            boolean shortBreak=state.getBoolean("break",false);
            long duration=state.getInt(shortBreak?"breakMinutes":"focusMinutes",shortBreak?5:25)*60000L;
            long deadline=state.getLong("deadline",0);
            long left=deadline>0?Math.max(0,deadline-System.currentTimeMillis()):state.getLong("remaining",duration);
            boolean running=deadline>System.currentTimeMillis();
            if(running) context.getSystemService(AlarmManager.class).setAndAllowWhileIdle(
                AlarmManager.RTC_WAKEUP,deadline,action(context,id,"finish"));
            else if(deadline>0) state.edit().putLong("deadline",0).putLong("remaining",0).apply();
            views.setTextViewText(R.id.widget_label,shortBreak?"BREAK":"FOCUS");
            views.setChronometerCountDown(R.id.timer,true);
            views.setChronometer(R.id.timer,SystemClock.elapsedRealtime()+left,null,running);
            if(!running) views.setTextViewText(R.id.timer,String.format(java.util.Locale.ROOT,"%02d:%02d",left/60000,(left/1000)%60));
            views.setTextViewText(R.id.toggle,running?"Pause":left==0||left==duration?"Start":"Resume");
            views.setTextViewText(R.id.reset,"Reset");
            views.setTextViewText(R.id.mode,shortBreak?"Focus":"Break");
            views.setOnClickPendingIntent(R.id.toggle,action(context,id,"toggle"));
            views.setOnClickPendingIntent(R.id.reset,action(context,id,"reset"));
            views.setOnClickPendingIntent(R.id.mode,action(context,id,"mode"));
        } else if(this instanceof CalculatorWidget) {
            views=new RemoteViews(context.getPackageName(),R.layout.widget_calculator);
            views.setTextViewText(R.id.display,state.getString("expression","").isEmpty()?"0":state.getString("expression",""));
            for(int i=0;i<CALC_IDS.length;i++)views.setOnClickPendingIntent(CALC_IDS[i],action(context,id,CALC_KEYS[i]));
            views.setOnClickPendingIntent(R.id.equals,action(context,id,"="));
        } else {
            views=new RemoteViews(context.getPackageName(),R.layout.widget_game);
            String board=state.getString("board","         ");
            String result=winner(board);
            views.setTextViewText(R.id.game_status,result.equals("draw")?"Draw.":!result.isEmpty()?result+" wins":state.getString("turn","X")+" to play · pass and play");
            for(int i=0;i<CELLS.length;i++) {
                String value=String.valueOf(board.charAt(i));
                views.setTextViewText(CELLS[i],value);
                views.setContentDescription(CELLS[i],"Square "+(i+1)+" "+(value.equals(" ")?"empty":value));
                views.setOnClickPendingIntent(CELLS[i],action(context,id,"cell-"+i));
            }
            views.setOnClickPendingIntent(R.id.new_game,action(context,id,"new"));
        }
        if(this instanceof ClockWidget)views.setTextViewText(R.id.widget_label,"CLOCK");
        if(this instanceof CalculatorWidget)views.setTextViewText(R.id.widget_label,"CALCULATOR");
        if(this instanceof GameWidget)views.setTextViewText(R.id.widget_label,"TIC TAC TOE");
        Intent configure=new Intent(context,ConfigureActivity.class)
            .putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID,id)
            .setData(android.net.Uri.parse("arpit-widget://settings/"+id));
        views.setOnClickPendingIntent(R.id.widget_settings,PendingIntent.getActivity(context,id,configure,
            PendingIntent.FLAG_UPDATE_CURRENT|PendingIntent.FLAG_IMMUTABLE));
        applyStyle(context,manager,id,state,views);
        manager.updateAppWidget(id,views);
    }

    private void applyStyle(Context context,AppWidgetManager manager,int id,SharedPreferences state,RemoteViews views) {
        int theme=Math.max(0,Math.min(2,state.getInt("theme",0)));
        boolean translucent=state.getBoolean("translucent",false);
        int[][] backgrounds={
            {R.drawable.widget_background,R.drawable.widget_graphite_translucent},
            {R.drawable.widget_slate,R.drawable.widget_slate_translucent},
            {R.drawable.widget_paper,R.drawable.widget_paper_translucent}
        };
        int[] keys={R.drawable.key_background,R.drawable.key_slate,R.drawable.key_paper};
        int ink=theme==2?0xff24282b:0xffeeeae2;
        int muted=theme==2?0xff575f63:0xffa3a9ae;
        views.setInt(R.id.widget_root,"setBackgroundResource",backgrounds[theme][translucent?1:0]);
        views.setTextColor(R.id.widget_label,muted);
        views.setTextColor(R.id.widget_settings,muted);
        Bundle options=manager.getAppWidgetOptions(id);
        boolean landscape=context.getResources().getConfiguration().orientation==Configuration.ORIENTATION_LANDSCAPE;
        int width=options.getInt(landscape?AppWidgetManager.OPTION_APPWIDGET_MAX_WIDTH:AppWidgetManager.OPTION_APPWIDGET_MIN_WIDTH,240);
        int height=options.getInt(landscape?AppWidgetManager.OPTION_APPWIDGET_MIN_HEIGHT:AppWidgetManager.OPTION_APPWIDGET_MAX_HEIGHT,250);
        if(width<=0)width=240;
        if(height<=0)height=250;
        float scale=Math.max(80,Math.min(130,state.getInt("textSize",100)))/100f;
        int padding=StudioUi.dp(context,width<200?8:12);
        views.setViewPadding(R.id.widget_root,padding,StudioUi.dp(context,6),padding,StudioUi.dp(context,6));
        if(this instanceof ClockWidget) {
            boolean hour12=state.getBoolean("hour12",false);
            String format=hour12?"h:mm a":"HH:mm";
            views.setCharSequence(R.id.clock_time,"setFormat12Hour",format);
            views.setCharSequence(R.id.clock_time,"setFormat24Hour",format);
            float clockText=Math.min(Math.min(48,Math.max(20,width*(hour12?.14f:.19f)))*scale,Math.max(18,(height-44)/1.3f));
            views.setTextViewTextSize(R.id.clock_time,TypedValue.COMPLEX_UNIT_SP,clockText);
            views.setTextViewTextSize(R.id.clock_date,TypedValue.COMPLEX_UNIT_SP,12*scale);
            views.setTextColor(R.id.clock_time,ink);views.setTextColor(R.id.clock_date,muted);
            views.setViewVisibility(R.id.clock_date,state.getBoolean("showDate",true)&&height>=105?View.VISIBLE:View.GONE);
        } else if(this instanceof FocusWidget) {
            views.setTextColor(R.id.timer,ink);
            float timerText=Math.min(Math.min(46,Math.max(24,height*.22f))*scale,Math.max(18,(height-84)/1.3f));
            views.setTextViewTextSize(R.id.timer,TypedValue.COMPLEX_UNIT_SP,timerText);
            for(int viewId:new int[]{R.id.toggle,R.id.reset,R.id.mode})styleKey(views,viewId,keys[theme],ink,12*scale);
        } else if(this instanceof CalculatorWidget) {
            views.setTextColor(R.id.display,ink);
            views.setTextViewTextSize(R.id.display,TypedValue.COMPLEX_UNIT_SP,Math.min(26,Math.max(16,width*.09f))*scale);
            float keyText=Math.min(Math.min(20,height<260?15:18)*scale,Math.max(12,(height-126)/5.2f));
            for(int viewId:CALC_IDS)styleKey(views,viewId,keys[theme],ink,keyText);
            styleKey(views,R.id.equals,keys[theme],ink,18*scale);
        } else {
            views.setTextColor(R.id.game_status,muted);
            float cellText=Math.min(Math.min(32,Math.max(18,height*.1f))*scale,Math.max(16,(height-110)/3.9f));
            for(int viewId:CELLS)styleKey(views,viewId,keys[theme],ink,cellText);
            styleKey(views,R.id.new_game,keys[theme],ink,12*scale);
        }
    }
    private void styleKey(RemoteViews views,int id,int background,int color,float size) {
        views.setInt(id,"setBackgroundResource",background);
        views.setTextColor(id,color);
        views.setTextViewTextSize(id,TypedValue.COMPLEX_UNIT_SP,size);
    }
}
