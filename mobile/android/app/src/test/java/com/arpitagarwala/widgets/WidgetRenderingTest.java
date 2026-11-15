package com.arpitagarwala.widgets;

import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProviderInfo;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.Spinner;
import android.widget.TextClock;
import android.widget.TextView;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.robolectric.Robolectric;
import org.robolectric.RobolectricTestRunner;
import org.robolectric.RuntimeEnvironment;
import org.robolectric.annotation.Config;
import org.robolectric.annotation.GraphicsMode;
import org.robolectric.shadows.ShadowAppWidgetManager;
import static org.junit.Assert.*;
import static org.robolectric.Shadows.shadowOf;

@RunWith(RobolectricTestRunner.class)
@Config(sdk=35,qualifiers="w400dp-h800dp")
public class WidgetRenderingTest {
    private final Context context=RuntimeEnvironment.getApplication();
    private final AppWidgetManager manager=context.getSystemService(AppWidgetManager.class);
    private final ShadowAppWidgetManager shadow=shadowOf(manager);

    private int bind(Class<?> provider,int layout,int id) {
        AppWidgetProviderInfo info=new AppWidgetProviderInfo();
        info.provider=new ComponentName(context,provider);
        info.initialLayout=layout;
        shadow.addInstalledProvider(info);
        shadow.setAllowedToBindAppWidgets(true);
        assertTrue(manager.bindAppWidgetIdIfAllowed(id,info.provider));
        return id;
    }
    private void size(int id,int width,int height) {
        Bundle options=new Bundle();
        options.putInt(AppWidgetManager.OPTION_APPWIDGET_MIN_WIDTH,width);
        options.putInt(AppWidgetManager.OPTION_APPWIDGET_MAX_WIDTH,width);
        options.putInt(AppWidgetManager.OPTION_APPWIDGET_MIN_HEIGHT,height);
        options.putInt(AppWidgetManager.OPTION_APPWIDGET_MAX_HEIGHT,height);
        manager.updateAppWidgetOptions(id,options);
        try {
            String provider=manager.getAppWidgetInfo(id).provider.getClassName();
            WidgetProvider receiver=(WidgetProvider)Class.forName(provider).getDeclaredConstructor().newInstance();
            receiver.onAppWidgetOptionsChanged(context,manager,id,options);
        } catch(ReflectiveOperationException failure) {throw new AssertionError(failure);}
    }
    @Test @GraphicsMode(GraphicsMode.Mode.NATIVE)
    public void renderNativeHomeAndCompactClock() throws Exception {
        MainActivity activity=Robolectric.buildActivity(MainActivity.class).setup().visible().get();
        saveImage(activity.getWindow().getDecorView(),400,800,"native-home.png");
        int id=bind(ClockWidget.class,R.layout.widget_clock,81);
        context.getSharedPreferences("widget-"+id,0).edit().putInt("theme",2).apply();
        size(id,180,100);
        saveImage(shadow.getViewFor(id),180,100,"native-clock-compact.png");
        int focus=bind(FocusWidget.class,R.layout.widget_focus,82);
        size(focus,190,140);
        saveImage(shadow.getViewFor(focus),190,140,"native-focus-compact.png");
        int calculator=bind(CalculatorWidget.class,R.layout.widget_calculator,83);
        size(calculator,180,220);
        saveImage(shadow.getViewFor(calculator),180,220,"native-calculator-compact.png");
        int game=bind(GameWidget.class,R.layout.widget_game,84);
        size(game,180,200);
        saveImage(shadow.getViewFor(game),180,200,"native-game-compact.png");
        Intent intent=new Intent(context,ConfigureActivity.class).putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID,focus);
        ConfigureActivity settings=Robolectric.buildActivity(ConfigureActivity.class,intent).setup().visible().get();
        saveImage(settings.getWindow().getDecorView(),400,800,"native-widget-settings.png");
    }
    private void saveImage(View view,int width,int height,String name) throws Exception {
        view.measure(View.MeasureSpec.makeMeasureSpec(width,View.MeasureSpec.EXACTLY),
            View.MeasureSpec.makeMeasureSpec(height,View.MeasureSpec.EXACTLY));
        view.layout(0,0,width,height);
        android.graphics.Bitmap bitmap=android.graphics.Bitmap.createBitmap(width,height,android.graphics.Bitmap.Config.ARGB_8888);
        view.draw(new android.graphics.Canvas(bitmap));
        java.io.File file=new java.io.File("build/reports/"+name);
        file.getParentFile().mkdirs();
        try(java.io.FileOutputStream output=new java.io.FileOutputStream(file)){
            assertTrue(bitmap.compress(android.graphics.Bitmap.CompressFormat.PNG,100,output));
        }
    }
    @Test public void clockResizesAndKeepsItsOwnAppearance() {
        int id=bind(ClockWidget.class,R.layout.widget_clock,41);
        context.getSharedPreferences("widget-"+id,0).edit().putBoolean("hour12",true).putInt("theme",2).apply();
        size(id,120,80);
        View small=shadow.getViewFor(id);
        assertEquals(View.GONE,small.findViewById(R.id.clock_date).getVisibility());
        TextClock smallClock=small.findViewById(R.id.clock_time);
        float smallText=smallClock.getTextSize();
        assertEquals("h:mm a",smallClock.getFormat24Hour().toString());
        size(id,320,180);
        View expanded=shadow.getViewFor(id);
        assertEquals(View.VISIBLE,expanded.findViewById(R.id.clock_date).getVisibility());
        assertTrue(((TextClock)expanded.findViewById(R.id.clock_time)).getTextSize()>smallText);
        assertEquals(0xff24282b,((TextView)expanded.findViewById(R.id.clock_time)).getCurrentTextColor());
        int other=bind(ClockWidget.class,R.layout.widget_clock,42);
        size(other,240,150);
        assertEquals(0xffeeeae2,((TextView)shadow.getViewFor(other).findViewById(R.id.clock_time)).getCurrentTextColor());
    }
    @Test public void calculatorAndGameStillWorkAfterCompactResize() {
        int calculator=bind(CalculatorWidget.class,R.layout.widget_calculator,51);
        size(calculator,180,220);
        View view=shadow.getViewFor(calculator);
        for(int key:new int[]{R.id.key_0,R.id.key_15,R.id.key_1,R.id.equals}) {
            view.findViewById(key).performClick();
            shadowOf(android.os.Looper.getMainLooper()).idle();
        }
        assertEquals("15",context.getSharedPreferences("widget-"+calculator,0).getString("expression",""));
        int game=bind(GameWidget.class,R.layout.widget_game,52);
        size(game,180,200);
        shadow.getViewFor(game).findViewById(R.id.cell_0).performClick();
        shadowOf(android.os.Looper.getMainLooper()).idle();
        assertEquals("X",context.getSharedPreferences("widget-"+game,0).getString("board","").substring(0,1));
    }
    @Test public void configureAppliesThemeWithoutResettingAExistingTimer() {
        int id=bind(FocusWidget.class,R.layout.widget_focus,61);
        long deadline=System.currentTimeMillis()+900000;
        context.getSharedPreferences("widget-"+id,0).edit().putLong("deadline",deadline).apply();
        Intent intent=new Intent(context,ConfigureActivity.class).putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID,id);
        ConfigureActivity activity=Robolectric.buildActivity(ConfigureActivity.class,intent).setup().get();
        Spinner theme=find(activity.findViewById(android.R.id.content),Spinner.class);
        theme.setSelection(2);
        Button apply=findButton(activity.findViewById(android.R.id.content),"Apply changes");
        assertNotNull(apply);
        apply.performClick();
        assertEquals(2,context.getSharedPreferences("widget-"+id,0).getInt("theme",0));
        assertEquals(deadline,context.getSharedPreferences("widget-"+id,0).getLong("deadline",0));
    }
    @Test public void focusUsesCustomDurationsForStartAndBreak() {
        int id=bind(FocusWidget.class,R.layout.widget_focus,71);
        context.getSharedPreferences("widget-"+id,0).edit().putInt("focusMinutes",45).putInt("breakMinutes",10).apply();
        size(id,190,140);
        View view=shadow.getViewFor(id);
        view.findViewById(R.id.toggle).performClick();
        shadowOf(android.os.Looper.getMainLooper()).idle();
        long remaining=context.getSharedPreferences("widget-"+id,0).getLong("deadline",0)-System.currentTimeMillis();
        assertTrue(remaining>44*60000L&&remaining<=45*60000L);
        view.findViewById(R.id.toggle).performClick();
        shadowOf(android.os.Looper.getMainLooper()).idle();
        view.findViewById(R.id.mode).performClick();
        shadowOf(android.os.Looper.getMainLooper()).idle();
        assertEquals(600000L,context.getSharedPreferences("widget-"+id,0).getLong("remaining",0));
    }
    private <T extends View> T find(View root,Class<T> type) {
        if(type.isInstance(root))return type.cast(root);
        if(root instanceof ViewGroup) {
            ViewGroup group=(ViewGroup)root;
            for(int i=0;i<group.getChildCount();i++) {
                T found=find(group.getChildAt(i),type);
                if(found!=null)return found;
            }
        }
        return null;
    }
    private Button findButton(View root,String title) {
        if(root instanceof Button&&title.contentEquals(((Button)root).getText()))return (Button)root;
        if(root instanceof ViewGroup) {
            ViewGroup group=(ViewGroup)root;
            for(int i=0;i<group.getChildCount();i++) {
                Button found=findButton(group.getChildAt(i),title);
                if(found!=null)return found;
            }
        }
        return null;
    }
}
