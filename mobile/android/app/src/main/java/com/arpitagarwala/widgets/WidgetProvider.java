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
        long duration=shortBreak?300000:1500000;
        long deadline=state.getLong("deadline",0);
        long left=deadline>0?Math.max(0,deadline-now):state.getLong("remaining",duration);
        SharedPreferences.Editor edit=state.edit();
        AlarmManager alarms=context.getSystemService(AlarmManager.class);
        alarms.cancel(action(context,id,"finish"));
        if ("mode".equals(operation)) edit.putBoolean("break",!shortBreak).putLong("remaining",shortBreak?1500000:300000).putLong("deadline",0);
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
            long deadline=state.getLong("deadline",0);
            long left=deadline>0?Math.max(0,deadline-System.currentTimeMillis()):state.getLong("remaining",shortBreak?300000:1500000);
            boolean running=deadline>System.currentTimeMillis();
            if(running) context.getSystemService(AlarmManager.class).setAndAllowWhileIdle(
                AlarmManager.RTC_WAKEUP,deadline,action(context,id,"finish"));
            else if(deadline>0) state.edit().putLong("deadline",0).putLong("remaining",0).apply();
            views.setTextViewText(R.id.title,(shortBreak?"SHORT BREAK":"FOCUS")+" · ON THIS PHONE");
            views.setChronometerCountDown(R.id.timer,true);
            views.setChronometer(R.id.timer,SystemClock.elapsedRealtime()+left,null,running);
            if(!running) views.setTextViewText(R.id.timer,String.format(java.util.Locale.ROOT,"%02d:%02d",left/60000,(left/1000)%60));
            views.setTextViewText(R.id.toggle,running?"Pause":left==0||left==(shortBreak?300000:1500000)?"Start":"Resume");
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
            views.setTextViewText(R.id.game_status,result.equals("draw")?"A thoughtful draw.":!result.isEmpty()?result+" wins":state.getString("turn","X")+" to play · pass and play");
            for(int i=0;i<CELLS.length;i++) {
                String value=String.valueOf(board.charAt(i));
                views.setTextViewText(CELLS[i],value);
                views.setContentDescription(CELLS[i],"Square "+(i+1)+" "+(value.equals(" ")?"empty":value));
                views.setOnClickPendingIntent(CELLS[i],action(context,id,"cell-"+i));
            }
            views.setOnClickPendingIntent(R.id.new_game,action(context,id,"new"));
        }
        manager.updateAppWidget(id,views);
    }
}
