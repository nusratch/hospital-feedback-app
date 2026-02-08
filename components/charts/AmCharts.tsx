import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { BarChart, PieChart } from 'react-native-gifted-charts';
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


function isValidData<T extends Record<string, any>>(
  data: T[],
  categoryField: keyof T,
  valueField: keyof T
): boolean {
  if (!Array.isArray(data)) return false;
  return data.every(
    (d) =>
      d != null &&
      Object.prototype.hasOwnProperty.call(d, categoryField) &&
      Object.prototype.hasOwnProperty.call(d, valueField) &&
      typeof d[valueField] === 'number' &&
      (typeof d[categoryField] === 'string' || typeof d[categoryField] === 'number')
  );
}


// Helper function to generate colors for charts
const generateColors = (count: number): string[] => {
  const baseColors = [
    '#5470C6',
    '#91CC75',
    '#FAC858',
    '#EE6666',
    '#73C0DE',
    '#3BA272',
    '#FC8452',
    '#9A60B4',
    '#EA7CCC',
  ];

  const colors: string[] = [];
  for (let i = 0; i < count; i++) {
    colors.push(baseColors[i % baseColors.length]);
  }
  return colors;
};


export function AmChartsColumnChart<T extends Record<string, any>>(
  props: ChartBaseProps<T>
) {
  const {
    data,
    categoryField,
    valueField,
    height = 220,
    style,
    backgroundColor = 'transparent',
    errorText = 'No data to display',
  } = props;


  const valid = isValidData(data, categoryField, valueField);


  if (!valid || data.length === 0) {
    return (
      <View style={[styles.fallback, { height }, style]}>
        <Text style={styles.fallbackText}>{errorText}</Text>
      </View>
    );
  }


  // Transform data for BarChart
  const colors = generateColors(data.length);
  const barData = data.map((item, index) => ({
    value: item[valueField] as number,
    label: String(item[categoryField]),
    frontColor: colors[index],
    spacing: 2,
    labelWidth: 50,
    labelTextStyle: {
      color: Colors.text.secondary,
      fontSize: 10,
      fontFamily: 'System',
      fontWeight: '400' as const,
    },
    labelComponent: () => (
      <View style={{ transform: [{ rotate: '30deg' }], width: 100, marginLeft: -15, marginTop: 38 }}>
        <Text style={{ color: Colors.text.secondary, fontSize: 10, textAlign: 'center' }}>
          {String(item[categoryField])}
        </Text>
      </View>
    ),
  }));


  // Calculate max value for proper scaling
  const maxValue = Math.max(...data.map((item) => item[valueField] as number), 0);

  // Ensure we have at least 1 as maxValue to avoid division by zero
  const displayMaxValue = Math.max(1, Math.ceil(maxValue * 1.1));

  // To avoid repeating numbers (like 0, 0, 1, 1), we should ensure noOfSections 
  // results in integer increments. If maxValue is small, we use maxValue as sections.
  const noOfSections = displayMaxValue <= 5 ? displayMaxValue : 5;
  const roundedMaxValue = Math.ceil(displayMaxValue / noOfSections) * noOfSections;

  return (
    <View style={[{ height, backgroundColor, paddingVertical: 10 }, style]}>
      <BarChart
        data={barData}
        width={undefined}
        height={height - 120}
        barWidth={20}
        barBorderRadius={6}
        hideRules
        xAxisThickness={0.5}
        yAxisThickness={0.5}
        yAxisTextStyle={{
          color: Colors.text.secondary,
          fontSize: 10,
        }}
        xAxisLabelTextStyle={{
          color: Colors.text.secondary,
          fontSize: 10,
          fontFamily: 'System',
          fontWeight: '400' as const,
          textAlign: 'center' as const,
        }}
        rotateLabel
        xAxisTextNumberOfLines={1}
        labelsExtraHeight={100}
        xAxisLabelsHeight={50}
        noOfSections={noOfSections}
        maxValue={roundedMaxValue}
        stepValue={roundedMaxValue / noOfSections}
        initialSpacing={5}
        spacing={25}
        endSpacing={20}
        showGradient={false}
        isAnimated
        animationDuration={1000}
        backgroundColor={backgroundColor}
        disablePress={false}
      />
    </View>
  );
}


export function AmChartsPie3DChart<T extends Record<string, any>>(
  props: ChartBaseProps<T>
) {
  const {
    data,
    categoryField,
    valueField,
    height = 220,
    style,
    backgroundColor = 'transparent',
    errorText = 'No data to display',
  } = props;


  const valid = isValidData(data, categoryField, valueField);


  if (!valid || data.length === 0) {
    return (
      <View style={[styles.fallback, { height }, style]}>
        <Text style={styles.fallbackText}>{errorText}</Text>
      </View>
    );
  }


  // Transform data for PieChart
  const colors = generateColors(data.length);
  const pieData = data.map((item, index) => ({
    value: item[valueField] as number,
    color: colors[index],
    text: String(item[categoryField]),
    // For 3D effect
    shiftX: 0,
    shiftY: 0,
  }));


  return (
    <View style={[{ height, backgroundColor, paddingVertical: 10 }, style]}>
      <PieChart
        data={pieData}
        donut
        showGradient
        sectionAutoFocus
        radius={height / 3}
        innerRadius={30}
        innerCircleColor={backgroundColor === 'transparent' ? '#fff' : backgroundColor}
        centerLabelComponent={() => null}
        isAnimated
        animationDuration={1200}
        showText
        textColor="blue"
        textSize={12}
        fontWeight="bold"
        focusOnPress
        // Enable 3D-like effect
        semiCircle={false}
        toggleFocusOnPress
        labelsPosition="outward"
      />
      {/* Legend */}
      <View style={styles.legendContainer}>
        {pieData.map((item, index) => (
          <View key={index} style={styles.legendItem}>
            <View
              style={[
                styles.legendColor,
                { backgroundColor: item.color },
              ]}
            />
            <Text style={styles.legendText}>
              {item.text}: {item.value}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  fallbackText: {
    color: Colors.text.secondary,
    fontSize: 13,
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 15,
    paddingHorizontal: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
    marginBottom: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 2,
    marginRight: 6,
  },
  legendText: {
    fontSize: 11,
    color: Colors.text.secondary,
  },
});
