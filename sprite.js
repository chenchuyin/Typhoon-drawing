/**
 * 加载纹理
 */

const Images = require('./sprite.png')
const bindSprite_ = {
    /**
     * @description: - 闪烁的圆点
     * @param {Map} - 地图
     * @return {Number} - 尺寸
     */

    twinklingDot: (map, measurement) => {
        const size = measurement || 50
        const pulsingDot = {
            width: size,
            height: size,
            data: new Uint8Array(size * size * 4),

            // get rendering context for the map canvas when layer is added to the map
            onAdd: function() {
                const canvas = document.createElement('canvas')
                canvas.width = size
                canvas.height = size
                this.context = canvas.getContext('2d')
            },

            // called once before every frame where the icon will be used
            render: function() {
                const duration = 1000

                const t = (performance.now() % duration) / duration

                const radius = (size / 2) * 0.3
                const outerRadius = (size / 2) * 0.7 * t + radius
                const context = this.context

                // draw outer circle
                context.clearRect(0, 0, size, size)
                context.beginPath()
                context.arc(size / 2, size / 2, outerRadius, 0, Math.PI * 2)
                context.fillStyle = 'rgba(255, 200, 200,' + (1 - t) + ')'
                context.fill()

                // draw inner circle
                context.beginPath()
                context.arc(size / 2, size / 2, radius, 0, Math.PI * 2)
                context.fillStyle = 'rgba(255, 100, 100, 1)'
                context.strokeStyle = 'white'
                context.lineWidth = 2 + 4 * (1 - t)
                context.fill()
                context.stroke()

                // update this image's data with data from the canvas
                this.data = context.getImageData(0, 0, size, size).data

                // continuously repaint the map, resulting in the smooth animation of the dot
                map.triggerRepaint()

                // return `true` to let the map know that the image was updated
                return true
            },
        }
        return pulsingDot
    },

    /**
     * @description: 台风图标
     * @param {Map} - 地图
     * @return {Number} - 尺寸
     */

    typhoonMouth: (map, measurement) => {
        const size = measurement || 50
        const typhoonImage = {
            width: size,
            height: size,
            data: new Uint8Array(size * size * 4),

            onAdd: function() {
                const canvas = document.createElement('canvas')
                canvas.width = this.width
                canvas.height = this.height
                this.context = canvas.getContext('2d')
                this.img = new Image()
                this.img.src = Images
            },

            render: function() {
                const context = this.context
                context.clearRect(0, 0, this.width, this.height)
                // 通过偏移 控制中心点
                context.translate(size / 2, size / 2)
                context.rotate(Math.PI / 60)
                context.translate(-size / 2, -size / 2)

                context.drawImage(this.img, 0, 0, this.width, this.height)

                this.data = context.getImageData(0, 0, this.width, this.height).data
                map.triggerRepaint()
                return true
            },
        }
        return typhoonImage
    },

    /**
     * @description: - 台风圈
     * @param {Map} - 地图
     * @return {Number} - 尺寸
     */

    TyphoonCircle: (map, measurement = []) => {
        const size = measurement || [20, 50, 50, 100]
        const TyphoonCircleImage = {
            width: size,
            height: size,
            data: new Uint8Array(size * size * 4),
            // get rendering context for the map canvas when layer is added to the map
            onAdd: function() {},
            render: function() {},
        }

        return TyphoonCircleImage
    },
}

export { bindSprite_ }
