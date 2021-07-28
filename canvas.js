class Canvas {
  FPS = 60;

  boxes = [];

  constructor(canvas) {
    this.canvas = canvas;
    this.context = this.canvas.getContext('2d');
    this.context.font = '20px Arial';
    this.context.textAlign = 'center';
    this.context.textBaseline = 'middle';
    this.isDrawing = false;

    this.drawInterval = setInterval(this.draw.bind(this), 1000 / this.FPS);

    this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this), false);
    this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this), false);
    this.canvas.addEventListener('mouseup', this.onMouseUp.bind(this), false);
    this.canvas.addEventListener('click', this.onClick.bind(this), false);
    this.canvas.addEventListener('dblclick', this.onDoubleClick.bind(this), false);

    this.loadImages();
  }

  async loadImages() {
    this.REMOVE_BOX_IMAGE = await Canvas.loadImage('./remove-box.png');
  }

  get canvasWidth() {
    return this.canvas.width;
  }

  get canvasHeight() {
    return this.canvas.height;
  }

  clearCanvas() {
    this.context.beginPath();
    this.context.fillStyle = 'rgba(255, 255, 255, 255)';
    this.context.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
    this.context.stroke();
  }

  drawBox(box) {
    this.context.beginPath();

    this.context.strokeStyle = '#000000';
    if (box.isValid === false) {
      this.context.strokeStyle = '#FF0000';
    }

    this.context.rect(box.x, box.y, box.width, box.height);
    this.context.stroke();
  }

  drawCloseBoxImage(box) {
    if (!box.done) {
      return;
    }

    const boxCoordinates = Canvas.getBoxCoordinates(box);
    this.context.drawImage(
      this.REMOVE_BOX_IMAGE,
      boxCoordinates.start.x - 8,
      boxCoordinates.start.y - 8
    );
  }

  drawText(box) {
    if (!box.text) {
      return;
    }

    this.context.fillText(box.text, box.x + box.width / 2, box.y + box.height / 2);
  }

  draw() {
    this.clearCanvas();
    this.context.fillStyle = '#000000';

    this.boxes.forEach((box) => {
      this.drawBox(box);
      this.drawText(box);
    });

    // done after, so no line stays in front of the image
    this.boxes.forEach((box) => this.drawCloseBoxImage(box));
  }

  /**
   * Calculates the start and ends pixels
   * @param box
   * @returns {{start: {x: number, y: number}, end: {x: number, y: number}}}
   */
  static getBoxCoordinates(box) {
    const xs = [box.x, box.width + box.x];
    const ys = [box.y, box.height + box.y];

    return {
      start: {
        x: Math.min(...xs),
        y: Math.min(...ys),
      },
      end: {
        x: Math.max(...xs),
        y: Math.max(...ys),
      },
    };
  }

  // https://gist.github.com/Daniel-Hug/d7984d82b58d6d2679a087d896ca3d2b
  static overlaps(a, b) {
    // no horizontal overlap
    if (a.start.x >= b.end.x || b.start.x >= a.end.x) return false;

    // no vertical overlap
    if (a.start.y >= b.end.y || b.start.y >= a.end.y) return false;

    return true;
  }

  isNewBoxValid() {
    if (!this.isDrawing) {
      return null;
    }

    const newBox = this.boxes.find(({ done }) => !done);

    // check if width or height is good enough
    if (Math.abs(newBox.width) < 100 || Math.abs(newBox.height) < 20) {
      return false;
    }

    // check if new box overlaps existing boxes
    const otherBoxes = this.boxes.filter(({ done }) => done);

    const newBoxCoordinates = Canvas.getBoxCoordinates(newBox);

    return !otherBoxes.some((box) => {
      const boxCoordinates = Canvas.getBoxCoordinates(box);
      return Canvas.overlaps(boxCoordinates, newBoxCoordinates);
    });
  }

  onMouseDown({ layerX: x, layerY: y }) {
    this.boxes.push({
      id: this.boxes.length,
      x,
      y,
      width: 0,
      height: 0,
      done: false,
      text: '',
    });
    this.isDrawing = true;
  }

  onMouseMove({ layerX: x, layerY: y }) {
    if (!this.isDrawing) {
      return;
    }

    this.boxes = this.boxes.map((box) => {
      if (box.done !== false) {
        return box;
      }

      return {
        ...box,
        width: x - box.x,
        height: y - box.y,
        isValid: this.isNewBoxValid(),
      };
    });
  }

  onMouseUp({ layerX: x, layerY: y }) {
    this.boxes = this.boxes
      .map((box) => {
        if (box.done !== false) {
          return box;
        }

        if (!box.isValid) {
          return null;
        }

        return {
          id: box.id,
          x: box.x,
          y: box.y,
          width: x - box.x,
          height: y - box.y,
          done: true,
          text: '',
        };
      })
      .filter((box) => !!box);

    this.isDrawing = false;
  }

  onDoubleClick({ layerX: x, layerY: y }) {
    const selectedBox = this.boxes.find((box) => {
      const boxCoordinates = Canvas.getBoxCoordinates(box);
      return (
        boxCoordinates.start.x <= x &&
        boxCoordinates.end.x >= x &&
        boxCoordinates.start.y <= y &&
        boxCoordinates.end.y >= y
      );
    });

    if (!selectedBox) {
      return;
    }

    // eslint-disable-next-line no-alert
    const text = window.prompt('Input text');
    this.boxes = this.boxes.map((box) => {
      if (box.id !== selectedBox.id) {
        return box;
      }

      return {
        ...box,
        text,
      };
    });
  }

  onClick({ layerX: x, layerY: y }) {
    const selectedBoxToClose = this.boxes.find((box) => {
      const boxCoordinates = Canvas.getBoxCoordinates(box);
      const startX = boxCoordinates.start.x - 8;
      const startY = boxCoordinates.start.y - 8;
      const endX = boxCoordinates.start.x + 8;
      const endY = boxCoordinates.start.y + 8;
      return startX <= x && endX >= x && startY <= y && endY >= y;
    });

    if (!selectedBoxToClose) {
      return;
    }

    this.boxes = this.boxes
      .filter((box) => {
        return box.id !== selectedBoxToClose.id;
      })
      .map((box, index) => ({ ...box, id: index }));
  }

  static loadImage(src) {
    const image = new Image();
    image.src = src;
    return new Promise((resolve) => {
      image.onload = () => resolve(image);
    });
  }
}

new Canvas(document.getElementById('myCanvas'));
