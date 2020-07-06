var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var Board = /** @class */ (function () {
    function Board(e) {
        var _this_1 = this;
        this.config = { width: 300, height: 150, color: '#000', weight: 1 };
        this.boardBox = {};
        this.lines = [];
        this.clear = function () {
            _this_1.ctx.clearRect(0, 0, _this_1.config.width, _this_1.config.height);
        };
        this.defineConfig();
        this.init(e);
        var hand = throttle(function () {
            _this_1.calcScale(e);
        }, 500);
        window.addEventListener('resize', hand);
    }
    Board.prototype.defineConfig = function () {
        var _this = this;
        var width, height;
        Object.defineProperty(this.config, 'width', {
            enumerable: true,
            configurable: true,
            get: function () {
                return width;
            },
            set: function (v) {
                width = v;
                _this.canvasEl && _this.canvasEl.setAttribute('width', v.toString());
            }
        });
        Object.defineProperty(this.config, 'height', {
            enumerable: true,
            configurable: true,
            get: function () {
                return height;
            },
            set: function (v) {
                height = v;
                _this.canvasEl && _this.canvasEl.setAttribute('height', v.toString());
            }
        });
    };
    /** 计算元素的宽度，除去 padding 和 border */
    Board.prototype.calcEl = function (e) {
        var currentStyle = window.getComputedStyle(e);
        this.boardBox.borderTop = parseInt(currentStyle.borderTop);
        this.boardBox.borderLeft = parseInt(currentStyle.borderLeft);
        this.boardBox.paddingTop = parseInt(currentStyle.paddingTop);
        this.boardBox.paddingBottom = parseInt(currentStyle.paddingBottom);
        this.boardBox.paddingLeft = parseInt(currentStyle.paddingLeft);
        this.boardBox.paddingRight = parseInt(currentStyle.paddingRight);
        var width = e.clientWidth - this.canvasEl.offsetLeft - this.boardBox.paddingRight;
        var height = e.clientHeight - this.canvasEl.offsetTop - this.boardBox.paddingBottom;
        var boardAttr = { width: width, height: height, color: this.config.color, weight: this.config.weight };
        return boardAttr;
    };
    Board.prototype.init = function (e) {
        var elWH;
        this.canvasEl = document.createElement('canvas');
        e.appendChild(this.canvasEl);
        elWH = this.calcEl(e);
        this.config.width = elWH.width;
        this.config.height = elWH.height;
        console.log('this.canvasEl', this.canvasEl.clientTop, this.canvasEl.offsetTop);
        this.ctx = this.canvasEl.getContext('2d');
        this.drawLines();
    };
    Board.prototype.drawLines = function () {
        var _this_1 = this;
        this.ctx.lineWidth = this.config.weight ? this.config.weight : 1;
        this.ctx.strokeStyle = this.config.color ? this.config.color : '#000000';
        this.canvasEl.onmousedown = function (downE) {
            var line = { points: [], color: _this_1.config.color, weight: _this_1.config.weight };
            var point = { x: downE.offsetX, y: downE.offsetY };
            _this_1.ctx.beginPath();
            _this_1.ctx.moveTo(point.x, point.y);
            document.onmousemove = function (moveE) {
                var point = { x: moveE.offsetX, y: moveE.offsetY };
                line.points.push(__assign({}, point));
                _this_1.ctx.lineTo(point.x, point.y);
                _this_1.ctx.stroke();
            };
            document.onmouseup = function () {
                _this_1.lines.push(line);
                _this_1.ctx.closePath();
                document.onmousemove = null;
                document.onmouseup = null;
            };
        };
        this.canvasEl.ontouchstart = function (startE) {
            var line = { points: [], color: _this_1.config.color, weight: _this_1.config.weight };
            var point = { x: startE.touches[0].clientX - _this_1.canvasEl.offsetLeft - _this_1.boardBox.borderLeft,
                y: startE.touches[0].clientY - _this_1.canvasEl.offsetTop - _this_1.boardBox.borderTop };
            _this_1.ctx.beginPath();
            _this_1.ctx.moveTo(point.x, point.y);
            document.ontouchmove = function (moveE) {
                var point = { x: moveE.touches[0].clientX - _this_1.canvasEl.offsetLeft - _this_1.boardBox.borderLeft,
                    y: moveE.touches[0].clientY - _this_1.canvasEl.offsetTop - _this_1.boardBox.borderTop };
                line.points.push(__assign({}, point));
                _this_1.ctx.lineTo(point.x, point.y);
                _this_1.ctx.stroke();
            };
            document.ontouchend = function () {
                _this_1.lines.push(line);
                _this_1.ctx.closePath();
                document.ontouchmove = null;
                document.ontouchend = null;
            };
        };
    };
    Board.prototype.drawLinesByData = function () {
        var _this_1 = this;
        this.ctx.save();
        this.lines.forEach(function (line) {
            _this_1.ctx.lineWidth = line.weight;
            _this_1.ctx.strokeStyle = line.color;
            _this_1.ctx.beginPath();
            line.points.forEach(function (val, key) {
                if (key === 0) {
                    _this_1.ctx.moveTo(val.x, val.y);
                }
                _this_1.ctx.lineTo(val.x, val.y);
            });
            _this_1.ctx.stroke();
            _this_1.ctx.closePath();
        });
        this.ctx.restore();
    };
    Board.prototype.calcScale = function (e) {
        var elWH = this.calcEl(e);
        var widthCurrent = elWH.width;
        var heightCurrent = elWH.height;
        var scale = +(widthCurrent / this.config.width).toFixed(2) * 100;
        this.lines = this.lines.map(function (line) {
            return __assign(__assign({}, line), { color: line.color, weight: line.weight, points: line.points.map(function (val) {
                    return {
                        x: val.x * scale / 100,
                        y: val.y * scale / 100
                    };
                }) });
        });
        this.config.width = widthCurrent;
        this.config.height = heightCurrent;
        this.drawLinesByData();
        this.drawLines();
    };
    Board.prototype.destroy = function () {
        window.removeEventListener('resize', this.calcScale);
    };
    Board.prototype.saveBase64 = function (type, encoderOptions) {
        if (type === void 0) { type = 'image/png'; }
        return this.canvasEl.toDataURL(type, encoderOptions);
    };
    Board.prototype.saveBold = function (type, encoderOptions) {
        if (type === void 0) { type = 'image/png'; }
        var base64 = this.canvasEl.toDataURL(type, encoderOptions);
        var binary = atob(base64.split(',')[1]);
        var length = binary.length;
        var u8arr = new Uint8Array(length);
        while (length--) {
            u8arr[length] = binary.charCodeAt(length);
        }
        return new Blob([u8arr], { type: type });
    };
    Board.prototype.resetDraw = function () {
        this.lines.pop();
        this.clear();
        this.ctx.restore();
        this.drawLinesByData();
    };
    Board.prototype.setOption = function (weight, color, e) {
        this.config.weight = weight;
        this.config.color = color;
        this.drawLines();
    };
    return Board;
}());
function throttle(fn, await) {
    var timeout = null;
    return function () {
        if (!timeout) {
            timeout = setTimeout(function () {
                fn();
                timeout = null;
            }, await);
        }
    };
}
