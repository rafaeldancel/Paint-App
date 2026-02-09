/**
 * Paint App - Rafael Dancel
 */

// --- AGILE SETUP: Test Mode ---
const TEST_MODE = false; // <--- FALSE TO RUN THE APP, TRUE FOR TEST DEMO

let app;

function setup() {
    if (TEST_MODE) {
        let c = createCanvas(1, 1);
        c.style('display', 'none');

        noLoop();
        return;
    }

    app = new PaintApp();
    app.init();
}

function draw() {
    if (TEST_MODE) return;
    app.render();
}

// --- P5.JS INPUT HOOKS ---
function mousePressed() { if (!TEST_MODE) app.handleMousePressed(); }

function mouseDragged() { if (!TEST_MODE) app.handleMouseDragged(); }

function mouseReleased() { if (!TEST_MODE) app.handleMouseReleased(); }


/**
 * CLASS: PaintApp
 * Orchestrates the UI and Canvas using the State
 */
class PaintApp {
    constructor() {
        this.state = new PaintState();
        this.ui = new UIManager(this);
        this.canvas = new CanvasManager(this);
    }

    init() {
        let wrapper = createDiv('').class('paint-app');
        this.ui.createToolbar(wrapper);
        let workspace = createDiv('').class('workspace').parent(wrapper);
        this.canvas.setupCanvas(workspace);
    }

    render() {
        this.canvas.draw(this.state);
    }

    // Delegate actions to State Manager
    setTool(name) {
        this.state.setTool(name);
        this.ui.updateActiveButton(name);
    }
    setColor(hex) { this.state.setColor(hex); }
    setSize(val) { this.state.setSize(val); }

    // --- INTERACTION HANDLERS ---
    handleMousePressed() {
        if (!this.canvas.isMouseInside()) return;
        this.state.startDrag(mouseX, mouseY);

        if (this.state.tool === 'fill') {
            this.canvas.floodFill(mouseX, mouseY, this.state.color);
        } else if (this.state.tool === 'text') {
            let t = prompt("Enter Text:", "Hello World");
            if (t) this.canvas.drawText(t, mouseX, mouseY, this.state);
            this.state.isDragging = false;
        }
    }

    handleMouseDragged() {
        if (!this.state.isDragging) return;
        if (this.state.tool === 'brush' || this.state.tool === 'eraser') {
            this.canvas.drawFreehand(pmouseX, pmouseY, mouseX, mouseY, this.state);
        }
    }

    handleMouseReleased() {
        if (!this.state.isDragging) return;
        this.state.stopDrag();

        if (['rect', 'ellipse', 'line'].includes(this.state.tool)) {
            this.canvas.drawShape(this.state.tool, this.state.startX, this.state.startY, mouseX, mouseY, this.state);
        }
    }
}

/**
 * PaintState (LOGIC CLASS)
 * TEST
 */
class PaintState {
    constructor() {
        this.tool = 'brush';
        this.color = '#000000';
        this.size = 5;
        this.isDragging = false;
        this.startX = 0;
        this.startY = 0;
    }

    // Constraint Validation (Agile/TDD) 
    setSize(val) {
        // "Clamp" logic to ensure size stays within bounds
        if (val < 1) this.size = 1;
        else if (val > 50) this.size = 50;
        else this.size = val;
    }

    setTool(name) {
        this.tool = name;
    }

    setColor(hex) {
        this.color = hex;
    }

    startDrag(x, y) {
        this.isDragging = true;
        this.startX = x;
        this.startY = y;
    }

    stopDrag() {
        this.isDragging = false;
    }
}


/**
 * CLASS: CanvasManager
 * Responsibility: Handles the "Imperative Shell" (Drawing pixels)
 */
class CanvasManager {
    constructor(appContext) {
        this.app = appContext;
        this.pg = null;
        this.container = null;
    }

    setupCanvas(parentDiv) {
        this.container = createDiv('').class('canvas-box').parent(parentDiv);
        let c = createCanvas(800, 600);
        c.parent(this.container);
        this.pg = createGraphics(800, 600);
        this.pg.background(255);
        new ResizeObserver(() => this.handleResize()).observe(this.container.elt);
    }

    handleResize() {
        let w = this.container.elt.clientWidth;
        let h = this.container.elt.clientHeight;
        if (w > 0 && h > 0 && (w !== width || h !== height)) {
            let savedArt = this.pg.get();
            resizeCanvas(w, h);
            let newPG = createGraphics(w, h);
            newPG.background(255);
            newPG.image(savedArt, 0, 0);
            this.pg = newPG;
        }
    }

    draw(state) {
        background(200);
        image(this.pg, 0, 0);
        if (state.isDragging) this.renderPreview(state);
        if (this.isMouseInside()) {
            noFill();
            stroke(0);
            strokeWeight(1);
            ellipse(mouseX, mouseY, state.size, state.size);
        }
    }

    renderPreview(state) {
        push();
        stroke(state.color);
        strokeWeight(state.size);
        noFill();
        let w = mouseX - state.startX;
        let h = mouseY - state.startY;

        if (state.tool === 'rect') rect(state.startX, state.startY, w, h);
        else if (state.tool === 'ellipse') ellipse(state.startX, state.startY, w * 2, h * 2);
        else if (state.tool === 'line') line(state.startX, state.startY, mouseX, mouseY);
        else if (state.tool === 'select') {
            stroke(0);
            strokeWeight(1);
            drawingContext.setLineDash([5, 5]);
            rect(state.startX, state.startY, w, h);
            drawingContext.setLineDash([]);
        }
        pop();
    }

    drawFreehand(x1, y1, x2, y2, state) {
        this.pg.stroke(state.tool === 'eraser' ? 255 : state.color);
        this.pg.strokeWeight(state.size);
        this.pg.line(x1, y1, x2, y2);
    }

    drawShape(type, x1, y1, x2, y2, state) {
        this.pg.stroke(state.color);
        this.pg.strokeWeight(state.size);
        this.pg.noFill();
        let w = x2 - x1;
        let h = y2 - y1;
        if (type === 'rect') this.pg.rect(x1, y1, w, h);
        else if (type === 'ellipse') this.pg.ellipse(x1, y1, w * 2, h * 2);
        else if (type === 'line') this.pg.line(x1, y1, x2, y2);
    }

    drawText(textStr, x, y, state) {
        this.pg.fill(state.color);
        this.pg.noStroke();
        this.pg.textSize(state.size * 2);
        this.pg.text(textStr, x, y);
    }

    floodFill(x, y, color) { this.pg.background(color); }
    clearCanvas() { this.pg.background(255); }
    saveImage() { saveCanvas(this.pg, 'my_art', 'png'); }
    loadImageFromFile(file) {
        if (file.type === 'image') loadImage(file.data, img => this.pg.image(img, 0, 0, 200, 200));
    }
    isMouseInside() { return mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height; }
}

/**
 * CLASS: UIManager
 */
class UIManager {
    constructor(appContext) {
        this.app = appContext;
        this.buttons = {};
        this.colorPicker = null;
    }

    createToolbar(parentDiv) {
        let bar = createDiv('').class('toolbar').parent(parentDiv);

        let tools = this.createSection(bar, 'Tools');
        this.createBtn(tools, '✏️', 'brush', true);
        this.createBtn(tools, '🧽', 'eraser');
        this.createBtn(tools, '🪣', 'fill');
        this.createBtn(tools, 'A', 'text');
        this.createBtn(tools, '✂️', 'select');

        let shapes = this.createSection(bar, 'Shapes');
        this.createBtn(shapes, '⬜', 'rect');
        this.createBtn(shapes, '⚪', 'ellipse');
        this.createBtn(shapes, '📏', 'line');

        let colors = this.createSection(bar, 'Colors');
        this.createSwatches(colors);
        this.colorPicker = createColorPicker(this.app.state.color).parent(colors).class('picker');
        this.colorPicker.input(() => this.app.setColor(this.colorPicker.value()));

        let settings = this.createSection(bar, 'Settings');
        createSpan('Size: ').parent(settings);
        let slider = createSlider(1, 50, 5).parent(settings).style('width', '80px');
        slider.input(() => this.app.setSize(slider.value()));

        let files = this.createSection(bar, 'File');
        createFileInput(f => this.app.canvas.loadImageFromFile(f)).parent(files).class('file-input');
        createButton('💾').parent(files).mousePressed(() => this.app.canvas.saveImage());
        createButton('🗑️').parent(files).mousePressed(() => this.app.canvas.clearCanvas());
    }

    createSwatches(parent) {
        let swatchGrid = createDiv('').class('swatch-grid').parent(parent);
        let defaultColors = ['#000000', '#ffffff', '#ed1c24', '#ff7f27', '#fff200', '#22b14c', '#00a2e8', '#3f48cc', '#a349a4'];

        defaultColors.forEach(hex => {
            let s = createButton('').class('swatch').parent(swatchGrid);
            s.style('background-color', hex);
            s.mousePressed(() => {
                this.app.setColor(hex);
                this.colorPicker.value(hex);
            });
        });
    }

    createSection(parent, title) {
        let s = createDiv('').class('tool-section').parent(parent);
        createDiv(title).class('section-title').parent(s);
        return createDiv('').class('tool-grid').parent(s);
    }

    createBtn(parent, label, toolName, active = false) {
        let b = createButton(label).parent(parent).class('tool-btn');
        if (active) b.addClass('active');
        b.mousePressed(() => this.app.setTool(toolName));
        this.buttons[toolName] = b;
    }

    updateActiveButton(toolName) {
        Object.values(this.buttons).forEach(b => b.removeClass('active'));
        if (this.buttons[toolName]) this.buttons[toolName].addClass('active');
    }
}

// TEST SUPPORT CLASSES (Unit Testing)

/**
 * ToolSettings
 * Isolated version of size logic for TDD clamp testing
 */
class ToolSettings {
    constructor() {
        this.size = 5;
    }

    setSize(val) {
        if (val < 1) this.size = 1;
        else if (val > 50) this.size = 50;
        else this.size = val;
    }
}

/**
 * Button (Logic Only)
 * Used to test click routing and hit detection
 */
class Button {
    constructor(x, y, w, h, action) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.action = action;
    }

    contains(px, py) {
        return (
            px >= this.x &&
            px <= this.x + this.w &&
            py >= this.y &&
            py <= this.y + this.h
        );
    }

    click(px, py) {
        if (this.contains(px, py)) {
            this.action();
        }
    }
}

/**
 * FakeRenderer
 * Simulates drawing commands for test verification
 */
class FakeRenderer {
    constructor() {
        this.commands = [];
    }

    line(x1, y1, x2, y2) {
        this.commands.push({ type: "line", x1, y1, x2, y2 });
    }

    rect(x, y, w, h) {
        this.commands.push({ type: "rect", x, y, w, h });
    }
}