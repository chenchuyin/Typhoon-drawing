import { polygon, point } from '@turf/helpers'
import lineArc from '@turf/line-arc'

class WindCircle {
    /**
     * @param {*} features 后台数据
     * @returns {geoJson} 返回GeoJson
     */
    static dataProcessing(features) {
        const points = features.map((v, i) => {
            return {
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: v,
                },
                properties: {
                    id: `point${i + 1}`,
                    type: i === 0 ? 'switch' : i === features.length - 2 ? 'wind' : 'default',
                    WindType: String(i + 1),
                },
            }
        })

        const typhoonSource = {
            type: 'FeatureCollection',
            features: [
                {
                    type: 'Feature',
                    geometry: {
                        type: 'LineString',
                        coordinates: [...features.slice(0, 6)],
                    },
                    properties: {
                        lineType: 'solid',
                    },
                },
                {
                    type: 'Feature',
                    geometry: {
                        type: 'LineString',
                        coordinates: [...features.slice(5, 12)],
                    },
                    properties: {
                        lineType: 'dotted',
                    },
                },
                {
                    ...WindCircle.generateWindCircle(features[features.length - 1], '200|250|250|150'),
                },
                ...points,
            ],
        }
        return typhoonSource
    }

    /**
     * 四个方向的半径转为扇形风圈面, 生成台风点的风圈风圈（面）
     * @param {Array} center 绘制中心点
     * @param {String} radius 绘制风圈半径
     */

    static generateWindCircle(center, radius) {
        const radiusArr = radius.split('|')
        const rNE = radiusArr[0]
        const rSE = radiusArr[1]
        const rSW = radiusArr[2]
        const rNW = radiusArr[3]

        /**
         *  单位
         */

        const lineArcOptions = {
            units: 'kilometers', // 公里
            steps: 1024, // 圆弧插值点数
        }

        /**
         *  rCenter 半径中心点  r为半径  NE 东北  SE东南 SW 西南 Nm 西北  根据坐标系
         */

        const rCenter = point(center)
        const ne = lineArc(rCenter, rNE, 0, 90, lineArcOptions).geometry.coordinates
        const se = lineArc(rCenter, rSE, 90, 180, lineArcOptions).geometry.coordinates
        const sw = lineArc(rCenter, rSW, 180, 270, lineArcOptions).geometry.coordinates
        const nw = lineArc(rCenter, rNW, 270, 360, lineArcOptions).geometry.coordinates

        /**
         *  精度校准
         */
        const nes = this.calculateCalibration(ne, center, 'odd')
        const ses = this.calculateCalibration(se, center, 'even')
        const sws = this.calculateCalibration(sw, center, 'odd')
        const nws = this.calculateCalibration(nw, center, 'even')

        /**
         *  合并
         */

        return polygon([[...nes, ...ses, ...sws, ...nws, nes[0]]], {
            type: 'windCircle',
        })
    }

    /**
     * @param {String} type - 奇偶象限的判断
     * @param {geojson} data - 校准的数据
     * @returns {geoJson}
     */
    static calculateCalibration(data, center, type = 'odd') {
        const sdata = [...data]
        const radian = type === 'odd' ? [0, 1] : [1, 0]
        sdata[0][radian[0]] = center[radian[0]]
        sdata[sdata.length - 1][radian[1]] = center[radian[1]]
        return sdata
    }
}

export default WindCircle
