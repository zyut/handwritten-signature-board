class Board {
    private config: BoardAttr = {width: 300, height: 150, color: '#000', weight: 1};
    private boardBox: BoardBox = {}
    private canvasEl: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D | null;
    private lines: Line[] = [];

    constructor(e: HTMLElement) {
        this.defineConfig()
        this.init(e)
        const hand = throttle(() => {
            this.calcScale(e)
        }, 500)
        window.addEventListener('resize', hand)
    }

    private defineConfig(): void {
        let _this = this;
        let width, height;
        Object.defineProperty(this.config, 'width', {
            enumerable : true,
            configurable : true,
            get(): any {
                return width
            },
            set(v: any) {
                width = v;
                _this.canvasEl && _this.canvasEl.setAttribute('width', v.toString())
            }
        })
        Object.defineProperty(this.config, 'height', {
            enumerable : true,
            configurable : true,
            get(): any {
                return height
            },
            set(v: any) {
                height = v;
                _this.canvasEl && _this.canvasEl.setAttribute('height', v.toString())
            }
        })
    }

    /** 计算元素的宽度，除去 padding 和 border */
    private calcEl(e): BoardAttr {
        let currentStyle = window.getComputedStyle(e);
        this.boardBox.borderTop = parseInt(currentStyle.borderTop);
        this.boardBox.borderLeft = parseInt(currentStyle.borderLeft);
        this.boardBox.paddingTop = parseInt(currentStyle.paddingTop);
        this.boardBox.paddingBottom = parseInt(currentStyle.paddingBottom);
        this.boardBox.paddingLeft = parseInt(currentStyle.paddingLeft);
        this.boardBox.paddingRight = parseInt(currentStyle.paddingRight);
        let width = e.clientWidth - this.canvasEl.offsetLeft - this.boardBox.paddingRight;
        let height = e.clientHeight - this.canvasEl.offsetTop - this.boardBox.paddingBottom;
        let boardAttr = {width: width, height: height, color: this.config.color, weight: this.config.weight}
        return boardAttr
    }

    private init(e): void {
        let elWH;
        this.canvasEl = document.createElement('canvas');
        e.appendChild(this.canvasEl);
        elWH = this.calcEl(e);
        this.config.width = elWH.width;
        this.config.height = elWH.height;
        console.log('this.canvasEl', this.canvasEl.clientTop, this.canvasEl.offsetTop)
        this.ctx = this.canvasEl.getContext('2d');
        this.drawLines();
    }

    private drawLines(): void {
        this.ctx.lineWidth = this.config.weight ? this.config.weight : 1;
        this.ctx.strokeStyle = this.config.color ? this.config.color : '#000000';
        this.canvasEl.onmousedown = (downE) => {
            let line = {points: [], color: this.config.color, weight: this.config.weight};
            const point: Point = {x: downE.offsetX, y: downE.offsetY};

            this.ctx.beginPath();
            this.ctx.moveTo(point.x, point.y);
            document.onmousemove = (moveE) => {
                const point = {x: moveE.offsetX, y: moveE.offsetY};
                line.points.push({...point});
                this.ctx.lineTo(point.x, point.y);
                this.ctx.stroke();
            };
            document.onmouseup = () => {
                this.lines.push(<Line>line);
                this.ctx.closePath();
                document.onmousemove = null;
                document.onmouseup = null;
            }
        };
        this.canvasEl.ontouchstart = (startE) => {
            let line = {points: [], color: this.config.color, weight: this.config.weight};
            const point: Point = {x: startE.touches[0].clientX - this.canvasEl.offsetLeft - this.boardBox.borderLeft,
                y: startE.touches[0].clientY - this.canvasEl.offsetTop - this.boardBox.borderTop};

            this.ctx.beginPath();
            this.ctx.moveTo(point.x, point.y);
            document.ontouchmove = (moveE) => {
                const point = {x: moveE.touches[0].clientX - this.canvasEl.offsetLeft - this.boardBox.borderLeft,
                    y: moveE.touches[0].clientY - this.canvasEl.offsetTop - this.boardBox.borderTop};
                line.points.push({...point});
                this.ctx.lineTo(point.x, point.y);
                this.ctx.stroke();
            };
            document.ontouchend = () => {
                this.lines.push(<Line>line);
                this.ctx.closePath();
                document.ontouchmove = null;
                document.ontouchend = null;
            }
        };
    }

    private drawLinesByData(): void {
        this.ctx.save();
        this.lines.forEach((line) => {
            this.ctx.lineWidth = line.weight;
            this.ctx.strokeStyle = line.color;
            this.ctx.beginPath();
            line.points.forEach((val, key) => {
                if (key === 0) {
                    this.ctx.moveTo(val.x, val.y);
                }
                this.ctx.lineTo(val.x, val.y);
            });
            this.ctx.stroke();
            this.ctx.closePath();
        })
        this.ctx.restore();
    }

    private calcScale(e): void {
        let elWH = this.calcEl(e);
        let widthCurrent: number = elWH.width;
        let heightCurrent: number = elWH.height;
        let scale: number = +(widthCurrent / this.config.width).toFixed(2) * 100;
        this.lines = this.lines.map((line) => {
            return {
                ...line,
                color: line.color,
                weight: line.weight,
                points: line.points.map((val) => {
                    return {
                        x: val.x * scale / 100,
                        y: val.y * scale / 100,
                    };
                })
            }
        })
        this.config.width = widthCurrent;
        this.config.height = heightCurrent;
        this.drawLinesByData();
        this.drawLines();
    }

    clear = () => {
        this.ctx.clearRect(0, 0, this.config.width, this.config.height);
    }

    destroy(): void {
        window.removeEventListener('resize', this.calcScale)
    }

    saveBase64(type = 'image/png', encoderOptions) {
        return this.canvasEl.toDataURL(type, encoderOptions)
    }

    saveBold(type = 'image/png', encoderOptions) {
        let base64 = this.canvasEl.toDataURL(type, encoderOptions);
        let binary = atob(base64.split(',')[1]);
        let length = binary.length;
        let u8arr = new Uint8Array(length);
        while (length--) {
            u8arr[length] = binary.charCodeAt(length);
        }
        return new Blob([u8arr], {type: type})
    }

    resetDraw() {
        this.lines.pop();
        this.clear();
        this.ctx.restore();
        this.drawLinesByData();
    }

    setOption(weight, color, e) {
        this.config.weight = weight;
        this.config.color = color;
        this.drawLines();
    }
}

interface BoardAttr {
    width: number
    height: number
    color: string
    weight: number
}

interface BoardBox {
    paddingTop?: number
    paddingBottom?: number
    paddingLeft?: number
    paddingRight?: number
    borderTop?: number
    borderLeft?: number
}

interface Point {
    x: number
    y: number
}

interface Line extends BoardAttr {
    points: Point[]
}

function throttle(fn, await): EventListenerOrEventListenerObject {
    let timeout: number = null;
    return function () {
        if (!timeout) {
            timeout = setTimeout(() => {
                fn()
                timeout = null
            }, await);
        }
    }
}
