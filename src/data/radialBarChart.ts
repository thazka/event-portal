import { useAnalytics } from "/@src/stores/event/analytics"

export function useRadialBar() {
  const { analytics } = useAnalytics()
  const themeColors = useThemeColors()
  const series = shallowRef<any[]>([])

  watchEffect(() => {
    series.value = [analytics.data?.attendance_rate || 0]
  })

  return reactive({
    height: 295,
    type: 'radialBar',
    series,
    options: {
      title: {
        text: '',
      },
      chart: {
        sparkline: {
          enabled: true,
        },
        toolbar: {
          show: false,
        },
      },
      colors: [
        themeColors.purple,
        themeColors.info,
        themeColors.lime,
        themeColors.purple,
        themeColors.orange,
      ],
      plotOptions: {
        radialBar: {
          startAngle: -90,
          endAngle: 90,
          track: {
            background: '#e7e7e7',
            strokeWidth: '97%',
            margin: 5, // margin is in pixels
            dropShadow: {
              enabled: false,
              top: 2,
              left: 0,
              color: '#999',
              opacity: 1,
              blur: 2,
            },
          },
          dataLabels: {
            name: {
              show: false,
            },
            value: {
              offsetY: -2,
              fontSize: '22px',
            },
          },
        },
      },
      grid: {
        padding: {
          // top: -10
        },
      },
      fill: {
        type: 'gradient',
        gradient: {
          shade: 'light',
          shadeIntensity: 0.1,
          inverseColors: false,
          opacityFrom: 1,
          opacityTo: 1,
          stops: [0, 50, 53, 91],
        },
      },
      labels: ['Average Results'],
    },
  })
}
