/**
 * 加载静态资源
 */
import { bindSprite_ } from './sprite'
import WindCircle from './utils'
import mapboxgl from 'mapbox-gl'
class TyphoonRouteLayer {
    /**
     *
     * @param {Map} map - 地图
     * @param {*} features -传入的数据
     */
    constructor(map, features) {
        if (!map) {
            console.warn('not_map_instance')
            return false
        }

        this.map = map
        this.source = 'typhoon-route-path-source'

        /**
         *  交互弹窗
         */
        this.popupWindow = null
        /**
         *  描述弹窗
         */
        this.popupWindowDescribe = null

        this.Throttling = true

        /**
         *  模拟数据
         */
        this.simulation = [
            [-75.59, 41.69],
            [-73.98, 40.12],
            [-73.7, 39.971],
            [-72.68, 38.82],
            [-71.73, 36.39],
            [-70.73, 36.39],
            [-69.73, 37.39],
            [-68.73, 37.39],
            [-67.73, 35.39],
            [-66.54, 35.12],
            [-66.54, 35.65],
            [-65.54, 35.65],
        ]

        this.typhoonSource = WindCircle.dataProcessing(features || this.simulation)

        /**
         *  添加canvas 图层
         */
        this.map.addImage('pulsing-dot', bindSprite_.twinklingDot(this.map, 100), { pixelRatio: 2 })
        this.map.addImage('wind-dot', bindSprite_.typhoonMouth(this.map, 100), { pixelRatio: 2 })

        /**
         * 台风数据源处理
         */

        this.map.addSource(this.source, {
            type: 'geojson',
            data: this.typhoonSource,
        })
    }

    /**
     *  添加图层
     */

    addLayer() {
        /**
         * 台风风圈
         */

        this.map.addLayer({
            id: 'track-route-windCircle-layer',
            type: 'fill',
            source: this.source,
            paint: {
                'fill-color': '#0080ff',
                'fill-opacity': 0.5,
                'fill-outline-color': '#0080ff',
            },
            layout: {
                visibility: 'visible',
            },
            filter: ['==', '$type', 'Polygon'],
        })

        /**
         *  台风路径线 实线
         */

        this.map.addLayer({
            id: 'track-route-line-solid-layer',
            type: 'line',
            source: this.source,
            paint: {
                'line-width': 1,
                'line-color': '#293032',
            },
            layout: { visibility: 'visible' },
            filter: ['==', 'lineType', 'solid'],
        })

        /**
         *  台风路径线 虚线
         */

        this.map.addLayer({
            id: 'track-route-line-dotted-layer',
            type: 'line',
            source: this.source,
            paint: {
                'line-width': 1,
                'line-color': '#293032',
                'line-dasharray': [2, 2],
            },
            layout: { visibility: 'visible' },
            filter: ['==', 'lineType', 'dotted'],
        })

        /**
         * 台风路径点添加
         */

        this.map.addLayer({
            id: 'track-route-point-layer',
            type: 'circle',
            source: this.source,
            paint: {
                'circle-radius': 5,
                'circle-color': [
                    'match',
                    ['get', 'WindType'],
                    '3',
                    '#007ACC',
                    '4',
                    '#0000FF',
                    '5',
                    '#FFCD42',
                    '#3B93DB',
                ],
                'circle-opacity': 1,
                'circle-stroke-width': 1,
                'circle-stroke-color': 'rgba(0, 0, 0, 1)',
            },
            layout: { visibility: 'visible' },
            filter: ['==', '$type', 'Point'],
        })

        /**
         * 台风扩散点添加
         */

        this.map.addLayer({
            id: 'track-route-symbol-layer',
            type: 'symbol',
            source: this.source,
            paint: {},
            layout: { visibility: 'visible', 'icon-image': 'pulsing-dot' },
            filter: ['==', 'type', 'switch'],
        })

        /**
         * 台风旋转图标添加
         */

        this.map.addLayer({
            id: 'track-route-wind-layer',
            type: 'symbol',
            source: this.source,
            paint: {},
            layout: {
                visibility: 'visible',
                'icon-image': 'wind-dot',
                'icon-allow-overlap': true,
                'icon-ignore-placement': true,
            },
            filter: ['==', 'type', 'wind'],
        })

        /**
         * 绑定事件
         */

        this.listLayer = [
            'track-route-wind-layer',
            'track-route-symbol-layer',
            'track-route-point-layer',
            'track-route-line-dotted-layer',
            'track-route-line-solid-layer',
            'track-route-windCircle-layer',
        ]
        this.bindMapEvent(this.map, this.listLayer)

        /**
         *  绑定每一个台风名称
         */
        this.bindTyphoonName()
    }

    /**
     * 台风数据更新
     */

    update() {
        this.map.getSource(this.source).setData(this.typhoonSource)
    }

    /**
     *
     * @param {Map} map  - 地图实例
     */
    bindMapEvent(map) {
        map.on('mousemove', 'track-route-windCircle-layer', e => {
            /**
             *  添加交互弹窗
             */
            if (this.Throttling)
                if (!this.popupWindow) {
                    this.popupWindow = new mapboxgl.Popup({
                        closeButton: false,
                        closeOnClick: false,
                        anchor: 'left', // 锚点
                        offset: [0, 0], // 偏移
                    })
                        .setLngLat([e.lngLat.lng, e.lngLat.lat])
                        .setHTML('<h1 style="padding:0;margin:0;">Hello World!</h1>')
                        .addTo(this.map)
                } else {
                    this.popupWindow.setLngLat([e.lngLat.lng, e.lngLat.lat])
                }
        })

        this.map.on('mouseenter', 'track-route-point-layer', e => {
            console.log('pppp', e)
            // this.map.setPaintProperty('track-route-point-layer', 'circle-radius', 10)
        })

        this.map.on('mouseleave', 'track-route-point-layer', () => {
            this.map.setPaintProperty('track-route-point-layer', 'circle-radius', 5)
        })

        this.listLayer.map(v => {
            map.on('mouseenter', v, () => {
                map.getCanvas().style.cursor = 'pointer'
            })

            // Change it back to a pointer when it leaves.
            map.on('mouseleave', v, () => {
                map.getCanvas().style.cursor = ''
                if (this.popupWindow) {
                    this.popupWindow.remove()
                    this.popupWindow = null
                }
            })
        })
    }

    /**
     *
     * @param {Map} map 绑定地图实例
     * @param {Array<Object>} features 名称集合及参数
     */

    bindTyphoonName(map, feature = { name: '大西洋', lngLat: this.simulation[0] }) {
        this.popupWindowDescribe = new mapboxgl.Popup({
            closeButton: false,
            closeOnClick: false,
            anchor: 'left', // 锚点
            offset: [0, 0], // 偏移
        })
            .setLngLat(feature.lngLat)
            .setHTML(`<h1 style="padding:0;margin:0;">${feature.name}</h1>`)
            .addTo(this.map)
    }
    /**
     *  实例销毁
     */

    destory() {
        this.listLayer.map(v => {
            this.map.removeLayer(v)
        })
        this.popupWindowDescribe.remove()
        this.map.removeSource(this.source)
    }

    /**
     *
     *  显示状态
     */
    show() {
        this.listLayer.map(v => {
            this.map.setLayoutProperty(v, 'visibility', 'visible')
        })
    }

    hide() {
        this.listLayer.map(v => {
            this.map.setLayoutProperty(v, 'visibility', 'none')
        })
    }
}

export default TyphoonRouteLayer
