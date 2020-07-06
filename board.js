function Board(e) {
  let width = 0;
  let height = 0;
  let canvasEl = null;
  let ctx = null;
  let lines = [];
  let linesColor;
  let linesWidth;
  window.addEventListener('resize', debounce(calcScale, 500))

  function init1(e) {
    let elWH = calcEl(e);
    width = elWH.width;
    height = elWH.height;
    canvasEl = document.createElement('canvas');
    canvasEl.setAttribute('width', width);
    canvasEl.setAttribute('height', height);
    e.appendChild(canvasEl);
    ctx = canvasEl.getContext('2d');
    drawLines();
  }

  init1(e);

  function drawLines() {
    ctx.lineWidth = linesWidth ? linesWidth : 1;
    ctx.strokeStyle = linesColor ? linesColor : '#000000';
    canvasEl.onmousedown = function (downE) {
      let target = downE.target
      const line = [];
      const point = {x: downE.offsetX, y: downE.offsetY, color: linesColor, width: linesWidth};
      line.push(point);
      ctx.beginPath();
      ctx.moveTo(point.x, point.y);
      document.onmousemove = function (moveE) {
        const point = {x: moveE.offsetX, y: moveE.offsetY, color: linesColor, width: linesWidth};
        line.push(point);
        ctx.lineTo(point.x, point.y);
        ctx.stroke();
      };
      document.onmouseup = function () {
        lines.push(line);
        ctx.closePath();
        document.onmousemove = null;
        document.onmouseup = null;
      }
    };
    canvasEl.ontouchstart = function (startE) {
      ctx.moveTo(startE.touches[0].clientX, startE.touches[0].clientY);
      document.ontouchmove = function (moveE) {
        ctx.lineTo(moveE.touches[0].clientX, moveE.touches[0].clientY);
        ctx.stroke();
      };
      document.ontouchend = function () {
        document.ontouchmove = null;
        document.ontouchend = null;
      }
    };
  }

  function drawLinesByData(lines) {
    ctx.save();
    lines.forEach((line) => {
      ctx.lineWidth = line[0].width ? line[0].width : 1;
      ctx.strokeStyle = line[0].color ? line[0].color : '#000000';
      ctx.beginPath();
      line.forEach((val, key) => {
        if (key === 0) {
          ctx.moveTo(val.x, val.y);
        }
        ctx.lineTo(val.x, val.y);
      });
      ctx.stroke();
      ctx.closePath();
    })
    ctx.restore();
  }

  function debounce(fn, await) {
    let timeout = null;
    return function () {
      if (timeout) {
        clearTimeout(timeout)
      }
      timeout = setTimeout(fn, await);
    }
  }

  function calcScale() {
    let elWH = calcEl(e);
    let widthCurrent = elWH.width;
    let heightCurrent = elWH.height;
    let scale = (widthCurrent / width).toFixed(2) * 100
    lines = lines.map((line) => {
      return line.map((val) => {
         return {
           x: val.x * scale / 100,
           y: val.y * scale / 100,
           width: val.width,
           color: val.color
         };
      })
    })
    canvasEl.setAttribute('width', widthCurrent);
    canvasEl.setAttribute('height', heightCurrent);
    width = widthCurrent;
    height = heightCurrent;
    drawLinesByData(lines);
    drawLines();
  }

  this.clear = () => {
    ctx.clearRect(0, 0, width, height);
  };
  this.destroy = () => {
    window.removeEventListener('resize', calcScale)
  };
  this.saveBase64 = (type = 'image/png', encoderOptions) => {
    return canvasEl.toDataURL(type, encoderOptions)
  };
  this.saveBold = (type = 'image/png', encoderOptions) => {
    let base64 = canvasEl.toDataURL(type, encoderOptions);
    let binary = atob(base64.split(',')[1]);
    let length = binary.length;
    let u8arr = new Uint8Array(length);
    while (length--) {
      u8arr[length] = binary.charCodeAt(length);
    }
    return new Blob([u8arr], {type: type})
  };
  this.resetDraw = () => {
    lines.pop();
    this.clear();
    ctx.restore();
    drawLinesByData(lines);
  }
  this.setOption = (width, color) => {
    linesWidth = width;
    linesColor = color;
    drawLines();
  }
}

/** 计算元素的宽度，除去 padding 和 border */
function calcEl(e) {
  let currentStyle = window.getComputedStyle(e);
  let paddingTop = parseInt(currentStyle.paddingTop);
  let paddingBottom = parseInt(currentStyle.paddingBottom);
  let paddingLeft = parseInt(currentStyle.paddingLeft);
  let paddingRight = parseInt(currentStyle.paddingRight);
  let width = e.clientWidth - paddingLeft - paddingRight;
  let height = e.clientHeight - paddingTop - paddingBottom;
  return {width: width, height: height}
}
