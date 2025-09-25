import React, { useMemo, useState } from 'react';
import { View, ActivityIndicator, Text, StyleSheet, ViewStyle, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import Colors from '@/constants/Colors';

export interface ChartBaseProps<T extends Record<string, any>> {
  data: T[];
  categoryField: keyof T;
  valueField: keyof T;
  height?: number;
  style?: ViewStyle;
  backgroundColor?: string;
  loadingText?: string;
  errorText?: string;
}

function isValidData<T extends Record<string, any>>(data: T[], categoryField: keyof T, valueField: keyof T): boolean {
  if (!Array.isArray(data)) return false;
  return data.every((d) =>
    d != null &&
    Object.prototype.hasOwnProperty.call(d, categoryField) &&
    Object.prototype.hasOwnProperty.call(d, valueField) &&
    typeof d[valueField] === 'number' &&
    (typeof d[categoryField] === 'string' || typeof d[categoryField] === 'number')
  );
}

function buildHtml(type: 'column' | 'pie3d', payload: any) {
  const { data, categoryField, valueField, theme } = payload;
  const safeJson = JSON.stringify({ data, categoryField, valueField });
  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
  <style>
    html, body, #chartdiv { width: 100%; height: 100%; margin: 0; padding: 0; background: transparent; }
  </style>
  <script src="https://cdn.amcharts.com/lib/4/core.js"></script>
  <script src="https://cdn.amcharts.com/lib/4/charts.js"></script>
  <script src="https://cdn.amcharts.com/lib/4/themes/animated.js"></script>
</head>
<body>
  <div id="chartdiv"></div>
  <script>
    (function() {
      var cfg = ${safeJson};
      am4core.ready(function() {
        am4core.useTheme(am4themes_animated);
        var chart;
        if ('${type}' === 'column') {
          chart = am4core.create('chartdiv', am4charts.XYChart);
          chart.data = cfg.data;
          // Disable amCharts watermark (requires appropriate license)
          chart.logo.disabled = true;
          var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
          categoryAxis.title.text = '';
          categoryAxis.dataFields.category = cfg.categoryField;
          categoryAxis.renderer.grid.template.location = 0;
          categoryAxis.renderer.minGridDistance = 20;
          // Rotate x-axis labels to 90 degrees
          categoryAxis.renderer.labels.template.rotation = -90;
          categoryAxis.renderer.labels.template.horizontalCenter = 'right';
          categoryAxis.renderer.labels.template.verticalCenter = 'middle';
          categoryAxis.renderer.labels.template.dy = 8;
          // Hide grid lines; keep axis line visible
          categoryAxis.renderer.grid.template.disabled = true;
          categoryAxis.renderer.line.strokeOpacity = 1;
          categoryAxis.renderer.line.strokeWidth = .5;

          var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
          valueAxis.min = 0;
          valueAxis.extraMax = 0.1;
          // Hide grid lines; keep axis line visible
          valueAxis.renderer.grid.template.disabled = true;
          valueAxis.renderer.baseGrid.disabled = true;
          valueAxis.renderer.line.strokeOpacity = 1;
          valueAxis.renderer.line.strokeWidth = .5;

          var series = chart.series.push(new am4charts.ColumnSeries());
          series.dataFields.valueY = cfg.valueField;
          series.dataFields.categoryX = cfg.categoryField;
          series.columns.template.tooltipText = '{' + cfg.categoryField + '}: [bold]{' + cfg.valueField + '}[/]';
          series.columns.template.strokeOpacity = 0;
          series.columns.template.column.cornerRadiusTopLeft = 6;
          series.columns.template.column.cornerRadiusTopRight = 6;
          // Use a different color for each bar
          series.columns.template.adapter.add('fill', function(fill, target) {
            return chart.colors.getIndex(target.dataItem.index);
          });
          series.columns.template.adapter.add('stroke', function(stroke, target) {
            return chart.colors.getIndex(target.dataItem.index);
          });

          chart.cursor = new am4charts.XYCursor();
          chart.cursor.lineX.disabled = true;
          chart.cursor.lineY.disabled = true;
          // Disable export/print menu for bar chart
          // chart.exporting.menu = new am4core.ExportMenu();
        } else {
          chart = am4core.create('chartdiv', am4charts.PieChart3D);
          chart.data = cfg.data;
          // Disable amCharts watermark (requires appropriate license)
          chart.logo.disabled = true;
          var pieSeries = chart.series.push(new am4charts.PieSeries3D());
          pieSeries.dataFields.value = cfg.valueField;
          pieSeries.dataFields.category = cfg.categoryField;
          pieSeries.ticks.template.disabled = true;
          pieSeries.labels.template.disabled = true;
          chart.innerRadius = am4core.percent(45);
          chart.legend = new am4charts.Legend();
        }
        // Post a ready message
        setTimeout(function(){
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ready' }));
          }
        }, 0);
      });
    })();
  </script>
</body>
</html>`;
}

function useChartHtml<T extends Record<string, any>>(type: 'column' | 'pie3d', props: ChartBaseProps<T>) {
  return useMemo(() => {
    const { data, categoryField, valueField } = props;
    return buildHtml(type, {
      data,
      categoryField,
      valueField
    });
  }, [type, props.data, props.categoryField, props.valueField]);
}

export function AmChartsColumnChart<T extends Record<string, any>>(props: ChartBaseProps<T>) {
  const {
    data,
    categoryField,
    valueField,
    height = 220,
    style,
    backgroundColor = 'transparent',
    loadingText = 'Loading chart...',
    errorText = 'No data to display'
  } = props;

  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const html = useChartHtml('column', props);

  const valid = isValidData(data, categoryField, valueField);

  if (!valid) {
    return (
      <View style={[styles.fallback, { height }, style]}> 
        <Text style={styles.fallbackText}>{errorText}</Text>
      </View>
    );
  }

  return (
    <View style={[{ height, backgroundColor }, style]}>
      {isLoading && (
        <View style={styles.loader}> 
          <ActivityIndicator size="small" color={Colors.primary} />
          <Text style={styles.loaderText}>{loadingText}</Text>
        </View>
      )}
      {Platform.OS === 'web' ? (
        // @ts-ignore - iframe is valid on web
        <iframe
          title="amcharts-column"
          srcDoc={html}
          style={{ width: '100%', height: '100%', border: '0' } as any}
          onLoad={() => setIsLoading(false)}
        />
      ) : (
        <WebView
          originWhitelist={["*"]}
          source={{ html }}
          style={{ backgroundColor: 'transparent' }}
          onError={() => setHasError(true)}
          onLoadStart={() => setIsLoading(true)}
          onLoadEnd={() => setIsLoading(false)}
          javaScriptEnabled
          domStorageEnabled
          onMessage={() => setIsLoading(false)}
        />
      )}
      {hasError && (
        <View style={styles.fallbackOverlay}>
          <Text style={styles.fallbackText}>{errorText}</Text>
        </View>
      )}
    </View>
  );
}

export function AmChartsPie3DChart<T extends Record<string, any>>(props: ChartBaseProps<T>) {
  const {
    data,
    categoryField,
    valueField,
    height = 220,
    style,
    backgroundColor = 'transparent',
    loadingText = 'Loading chart...',
    errorText = 'No data to display'
  } = props;

  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const html = useChartHtml('pie3d', props);

  const valid = isValidData(data, categoryField, valueField);

  if (!valid) {
    return (
      <View style={[styles.fallback, { height }, style]}> 
        <Text style={styles.fallbackText}>{errorText}</Text>
      </View>
    );
  }

  return (
    <View style={[{ height, backgroundColor }, style]}>
      {isLoading && (
        <View style={styles.loader}> 
          <ActivityIndicator size="small" color={Colors.primary} />
          <Text style={styles.loaderText}>{loadingText}</Text>
        </View>
      )}
      {Platform.OS === 'web' ? (
        // @ts-ignore - iframe is valid on web
        <iframe
          title="amcharts-pie3d"
          srcDoc={html}
          style={{ width: '100%', height: '100%', border: '0' } as any}
          onLoad={() => setIsLoading(false)}
        />
      ) : (
        <WebView
          originWhitelist={["*"]}
          source={{ html }}
          style={{ backgroundColor: 'transparent' }}
          onError={() => setHasError(true)}
          onLoadStart={() => setIsLoading(true)}
          onLoadEnd={() => setIsLoading(false)}
          javaScriptEnabled
          domStorageEnabled
          onMessage={() => setIsLoading(false)}
        />
      )}
      {hasError && (
        <View style={styles.fallbackOverlay}>
          <Text style={styles.fallbackText}>{errorText}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  loader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2
  },
  loaderText: {
    marginTop: 6,
    color: Colors.text.secondary,
    fontSize: 12
  },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent'
  },
  fallbackOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent'
  },
  fallbackText: {
    color: Colors.text.secondary,
    fontSize: 13
  }
});
