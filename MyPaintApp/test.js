/**
 * TEST RUNNER & SUITE (Agile / TDD Demo)
 * Rafael Dancel
 */

/* ---------------------------
   TEST HARNESS
---------------------------- */

let __t = { total: 0, passed: 0, failed: 0, suiteStack: [] };

function describe(name, fn) {
    __t.suiteStack.push(name);
    try {
        fn();
    } finally {
        __t.suiteStack.pop();
    }
}

function it(name, fn) {
    const suite = __t.suiteStack.join(" > ");
    const fullName = suite ? `${suite} > ${name}` : name;

    __t.total++;
    try {
        fn();
        __t.passed++;
        console.log(`✅ ${fullName}`);
    } catch (err) {
        __t.failed++;
        console.error(`❌ ${fullName}\n   ${err.message}`);
    }
}

function expect(actual) {
    return {
        toBe(expected) {
            if (actual !== expected)
                throw new Error(`Expected ${expected} but got ${actual}`);
        },
        toEqual(expected) {
            if (JSON.stringify(actual) !== JSON.stringify(expected))
                throw new Error(`Expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`);
        }
    };
}

function testSummary() {
    console.log(
        `\n🧪 TEST SUMMARY: ${__t.total} Tests | ✅ ${__t.passed} Passed | ❌ ${__t.failed} Failed\n`
    );
}

/* ---------------------------
 WAIT FOR APP LOGIC FUNCTION
---------------------------- */

function waitForPaintState(cb) {
    const interval = setInterval(() => {
        if (typeof PaintState === "function") {
            clearInterval(interval);
            cb();
        }
    }, 50);
}

// TEST SUITE

console.log("🚀 Tests registered in test.js");

function runProjectTests() {

    if (typeof PaintState !== "function") {
        throw new Error("PaintState not loaded. Tests cannot run.");
    }

    /* ---------------------------------
       PaintState (Functional Core)
    --------------------------------- */
    describe("PaintState (Functional Core)", () => {

        it("Clamps brush size to minimum (1)", () => {
            const state = new PaintState();
            state.setSize(-5);
            expect(state.size).toBe(1);
        });

        it("Clamps brush size to maximum (50)", () => {
            const state = new PaintState();
            state.setSize(999);
            expect(state.size).toBe(50);
        });

        it("Updates active tool correctly", () => {
            const state = new PaintState();
            state.setTool("eraser");
            expect(state.tool).toBe("eraser");
        });

        it("Updates color correctly", () => {
            const state = new PaintState();
            state.setColor("#ff0000");
            expect(state.color).toBe("#ff0000");
        });
    });

    /* ---------------------------------
       ToolSettings w/ Clamp Logic applied
    --------------------------------- */
    describe("ToolSettings (Clamp Rules)", () => {

        it("Clamps size below 1", () => {
            const s = new ToolSettings();
            s.setSize(-10);
            expect(s.size).toBe(1);
        });

        it("Clamps size above 50", () => {
            const s = new ToolSettings();
            s.setSize(999);
            expect(s.size).toBe(50);
        });
    });

    /* ---------------------------------
       Button Click Routing
    --------------------------------- */
    describe("Button (Click Routing)", () => {

        it("Detects clicks inside button", () => {
            let clicked = false;
            const btn = new Button(0, 0, 100, 50, () => clicked = true);
            btn.click(10, 10);
            expect(clicked).toBe(true);
        });

        it("Ignores clicks outside button", () => {
            let clicked = false;
            const btn = new Button(0, 0, 100, 50, () => clicked = true);
            btn.click(200, 200);
            expect(clicked).toBe(false);
        });
    });

    /* ---------------------------------
       FakeRenderer (Draw Commands)
    --------------------------------- */
    describe("FakeRenderer (Command Output)", () => {

        it("Records a line command", () => {
            const r = new FakeRenderer();
            r.line(0, 0, 10, 10);

            expect(r.commands.length).toBe(1);
            expect(r.commands[0].type).toBe("line");
        });

        it("Records a rect command", () => {
            const r = new FakeRenderer();
            r.rect(5, 5, 20, 10);

            expect(r.commands[0].type).toBe("rect");
        });
    });

    testSummary();
}


waitForPaintState(() => {
    console.log("🧪 PaintState detected. Running tests...");
    runProjectTests();
});