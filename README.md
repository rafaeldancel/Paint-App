# MS Paint Clone (OOP & TDD Refactor)

## 🎨 Application Overview
This is a functional web-based drawing application built with **p5.js**. It replicates the core functionality of Microsoft Paint while demonstrating modern software engineering practices.

The project began as a simple imperative script and was refactored into a scalable **Object-Oriented** architecture with a custom **Test-Driven Development (TDD)** framework.

### Key Features
* **Tools:** Brush, Eraser, Flood Fill, Text Input, and Selection Marquee.
* **Shapes:** Dynamic preview and rendering for Rectangles, Ellipses, and Lines.
* **UI:** Ribbon-style toolbar with color swatches, a color picker, and a brush size slider.
* **Canvas:** Resizable workspace with a persistent graphics buffer to prevent data loss.

---

## 🛠️ Technical Architecture (`sketch.js`)
The application logic was refactored from global variables into a modular class-based system to ensure separation of concerns.

### 1. `PaintApp` (The Orchestrator)
* **Role:** Acts as the main controller. It initializes the app and coordinates communication between the State, UI, and Canvas.
* **Responsibility:** It listens for input events and delegates them to the appropriate manager.

### 2. `PaintState` (The Functional Core)
* **Role:** Pure logic and data management.
* **Responsibility:** Encapsulates the application state (current tool, color, brush size). It applies **Constraint Validation** (e.g., clamping brush size between 1-50) to ensure invalid data never enters the system.

### 3. `CanvasManager` (The Imperative Shell)
* **Role:** Handles all p5.js drawing side-effects.
* **Responsibility:** Manages the off-screen graphics buffer (`createGraphics`), renders shape previews during mouse drag, and executes final drawing commands.

### 4. `UIManager`
* **Role:** Manages the DOM (HTML) elements.
* **Responsibility:** Dynamically generates the toolbar, buttons, and sliders, and handles visual updates like highlighting the active tool.

---

## 🧪 Testing Strategy (TDD)
A custom **DIY Test Harness** was built to verify the "Functional Core" logic without relying on the browser's visual canvas. This ensures the app's logic is robust and predictable.

### How to Run Tests
1.  Open `sketch.js`.
2.  Set the flag `const TEST_MODE = true;` at the top of the file.
3.  Open `index.html` in a browser and check the **Console (F12)**.

### Test Coverage (10/10 Passing)
We validated **10 specific behaviors** across the application:
* **State Logic:** Verified that selecting tools and colors updates the state correctly.
* **Boundary Testing:** Confirmed that `setSize()` clamps values (e.g., inputting `-5` results in `1`).
* **Click Routing:** Tested that the `Button` class correctly detects mouse clicks within its bounding box.
* **Mocking:** Used a `FakeRenderer` to assert that drawing tools emit the correct mathematical commands (e.g., `line(x1, y1, x2, y2)`) without needing pixels.

---

## 🚀 Usage
1.  Clone the repository.
2.  Open `index.html` in a modern web browser (Edge/Chrome).
3.  Select a tool from the ribbon and start drawing!
4.  Use the **Save** button to download your artwork as a PNG.

## 👤 Author
**Rafael Dancel**
*Built as part of an Agile Software Development Sprint.*
