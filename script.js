const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const colorPicker = document.getElementById('color');
const sizePicker = document.getElementById('size');
const clearButton = document.getElementById('clear');
const saveButton = document.getElementById('save');

const tools = {
    pencil: document.getElementById('pencil'),
    rectangle: document.getElementById('rectangle'),
    square: document.getElementById('square'),
    circle: document.getElementById('circle'),
    line: document.getElementById('line')
};

let currentTool = 'pencil';
let isDrawing = false;
let lastX = 0;
let lastY = 0;
let startX = 0;
let startY = 0;

// Mảng lưu trữ các hình đã vẽ
let shapes = [];
// Lưu trữ trạng thái hiện tại của hình đang vẽ
let currentShape = null;

// Thiết lập các sự kiện cho canvas
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);

// Thiết lập sự kiện cho các nút công cụ
Object.entries(tools).forEach(([tool, element]) => {
    element.addEventListener('click', () => {
        currentTool = tool;
        Object.values(tools).forEach(btn => btn.classList.remove('active'));
        element.classList.add('active');
    });
});

// Xử lý sự kiện bắt đầu vẽ
function startDrawing(e) {
    isDrawing = true;
    [lastX, lastY] = [e.offsetX, e.offsetY];
    [startX, startY] = [e.offsetX, e.offsetY];
    
    if (currentTool !== 'pencil') {
        ctx.beginPath();
        ctx.moveTo(startX, startY);
    }
}

// Hàm vẽ lại tất cả các hình
function redrawShapes() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    shapes.forEach(shape => {
        ctx.strokeStyle = shape.color;
        ctx.lineWidth = shape.size;
        ctx.lineCap = 'round';
        ctx.beginPath();

        if (shape.type === 'pencil') {
            shape.points.forEach((point, index) => {
                if (index === 0) {
                    ctx.moveTo(point.x, point.y);
                } else {
                    ctx.lineTo(point.x, point.y);
                }
            });
            ctx.stroke();
        } else {
            switch(shape.type) {
                case 'rectangle':
                    ctx.strokeRect(shape.startX, shape.startY, shape.width, shape.height);
                    break;
                case 'square':
                    ctx.strokeRect(shape.startX, shape.startY, shape.size * shape.signX, shape.size * shape.signY);
                    break;
                case 'circle':
                    ctx.arc(shape.startX, shape.startY, shape.radius, 0, Math.PI * 2);
                    ctx.stroke();
                    break;
                case 'line':
                    ctx.moveTo(shape.startX, shape.startY);
                    ctx.lineTo(shape.endX, shape.endY);
                    ctx.stroke();
                    break;
            }
        }
    });
}

// Xử lý sự kiện vẽ
function draw(e) {
    if (!isDrawing) return;

    const currentX = e.offsetX;
    const currentY = e.offsetY;
    
    ctx.strokeStyle = colorPicker.value;
    ctx.lineWidth = sizePicker.value;
    ctx.lineCap = 'round';

    if (currentTool === 'pencil') {
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(currentX, currentY);
        ctx.stroke();
        [lastX, lastY] = [currentX, currentY];

        if (!currentShape) {
            currentShape = {
                type: 'pencil',
                color: colorPicker.value,
                size: sizePicker.value,
                points: [{x: startX, y: startY}]
            };
        }
        currentShape.points.push({x: currentX, y: currentY});
    } else {
        redrawShapes();
        ctx.beginPath();

        switch(currentTool) {
            case 'rectangle':
                const width = currentX - startX;
                const height = currentY - startY;
                ctx.strokeRect(startX, startY, width, height);
                currentShape = {
                    type: 'rectangle',
                    startX, startY, width, height,
                    color: colorPicker.value,
                    size: sizePicker.value
                };
                break;
            case 'square':
                const size = Math.min(Math.abs(currentX - startX), Math.abs(currentY - startY));
                const signX = Math.sign(currentX - startX);
                const signY = Math.sign(currentY - startY);
                ctx.strokeRect(startX, startY, size * signX, size * signY);
                currentShape = {
                    type: 'square',
                    startX, startY, size, signX, signY,
                    color: colorPicker.value,
                    size: sizePicker.value
                };
                break;
            case 'circle':
                const radius = Math.sqrt(Math.pow(currentX - startX, 2) + Math.pow(currentY - startY, 2));
                ctx.arc(startX, startY, radius, 0, Math.PI * 2);
                ctx.stroke();
                currentShape = {
                    type: 'circle',
                    startX, startY, radius,
                    color: colorPicker.value,
                    size: sizePicker.value
                };
                break;
            case 'line':
                ctx.moveTo(startX, startY);
                ctx.lineTo(currentX, currentY);
                ctx.stroke();
                currentShape = {
                    type: 'line',
                    startX, startY,
                    endX: currentX, endY: currentY,
                    color: colorPicker.value,
                    size: sizePicker.value
                };
                break;
        }
    }
}

// Xử lý sự kiện dừng vẽ
function stopDrawing() {
    if (isDrawing && currentShape) {
        shapes.push(currentShape);
        currentShape = null;
    }
    isDrawing = false;
}

// Xử lý sự kiện xóa canvas
clearButton.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    shapes = [];
    currentShape = null;
});

// Xử lý sự kiện lưu hình
saveButton.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'my-drawing.png';
    link.href = canvas.toDataURL();
    link.click();
});