'use strict';

describe('Service: robozzle', function () {

  // load the service's module
  beforeEach(module('robozzleObjects'));

  var Op, Color, Heading, Material;

  beforeEach(inject(function (_Op_, _Color_, _Heading_, _Material_) {
    Op = _Op_;
    Color = _Color_;
    Heading = _Heading_;
    Material = _Material_;
  }));

  describe('Factory: Step', function () {

    // instantiate factory
    var Step, randomStep, randomCode;

    beforeEach(inject(function (_Step_) {
      Step = _Step_;
      randomStep = new Step(
        _.random(_.keys(Op).length),
        _.random(_.keys(Color).length)
      );
      randomCode = 10 * randomStep.color + randomStep.op;
    }));

    it('should encode a random step', function () {
      expect(Step.encode(randomStep.op, randomStep.color)).toEqual(randomCode);
    });

    it('should decode a random code', function () {
      expect(Step.decode(randomCode)).toEqual(randomStep);
    });

  });

  describe('Factory: Stack', function () {

    // instantiate factory
    var Stack, someStack;

    beforeEach(inject(function (_Stack_) {
      Stack = _Stack_;
      someStack = new Stack();
    }));

    it('should behave like a stack', function () {

      expect(someStack.any()).toBe(false);

      someStack.push([3, 2, 1]);
      expect(someStack.any()).toBe(true);
      expect(someStack.pop()).toEqual(1);
      expect(someStack.pop()).toEqual(2);
      expect(someStack.any()).toBe(true);

      someStack.push([9, 8, 7]);
      expect(someStack.pop()).toEqual(7);
      expect(someStack.pop()).toEqual(8);
      expect(someStack.pop()).toEqual(9);
      expect(someStack.pop()).toEqual(3);
      expect(someStack.any()).toBe(false);

    });

  });

  describe('Factory: WorldEditor', function() {
    
    // instantiate factory
    var WorldEditor, someBuilder,
        maxX, maxY, randX, randY, shipX, shipY, randColor, randHeading;

    beforeEach(inject(function (_WorldEditor_) {
      WorldEditor = _WorldEditor_;
      maxX = 4;
      maxY = 3;
      someBuilder = new WorldEditor(maxX, maxY + 1);

      randX = _.random(maxX - 1);
      randY = _.random(maxY - 1);
      randColor = _.random(3);
      randHeading = _.random(3);

      shipX = _.random(maxX - 1);
      shipY = maxY;
    }));

    it('should un/set a ship', function() {
      var world = someBuilder
        .ship(shipX, shipY)
        .build();

      // todo: expect someBuilder.at...
      expect(someBuilder.at(shipX, shipY).isVoid).toBe(false);
      expect(someBuilder.at(shipX, shipY).hasStar).toBe(false);
      expect(someBuilder.at(shipX, shipY).hasShip).toBe(true);
      expect(someBuilder.at(shipX, shipY).color).toEqual(Color.CLEAR);
      expect(someBuilder.at(shipX, shipY).heading).toEqual(Heading.UP);

      expect(world.at(shipX, shipY).isVoid).toBe(false);
      expect(world.at(shipX, shipY).hasStar).toBe(false);
      expect(world.at(shipX, shipY).hasShip).toBe(true);
      expect(world.at(shipX, shipY).color).toEqual(Color.CLEAR);
      expect(world.at(shipX, shipY).heading).toEqual(Heading.UP);

      world = someBuilder
        .tile(shipX, shipY, randColor)
        .build();

      expect(someBuilder.at(shipX, shipY).color).toEqual(randColor);
      expect(world.at(shipX, shipY).color).toEqual(randColor);

      world = someBuilder
        .heading(randHeading)
        .build();

      expect(someBuilder.at(shipX, shipY).heading).toEqual(randHeading);
      expect(world.at(shipX, shipY).heading).toEqual(randHeading);

      expect(someBuilder.unsetShip().build).toThrow('missing heading');
    });

    it('should un/set a tile', function() {
      var world = someBuilder
        .ship(shipX, shipY)
        .tile(randX, randY)
        .build();

      expect(someBuilder.at(randX, randY).isVoid).toBe(false);
      expect(someBuilder.at(randX, randY).hasStar).toBe(false);
      expect(someBuilder.at(randX, randY).hasShip).toBe(false);
      expect(someBuilder.at(randX, randY).color).toEqual(Color.CLEAR);

      expect(world.at(randX, randY).isVoid).toBe(false);
      expect(world.at(randX, randY).hasStar).toBe(false);
      expect(world.at(randX, randY).hasShip).toBe(false);
      expect(world.at(randX, randY).color).toEqual(Color.CLEAR);

      world = someBuilder
        .tile(randX, randY, randColor)
        .build();

      expect(someBuilder.at(randX, randY).color).toEqual(randColor);
      expect(world.at(randX, randY).color).toEqual(randColor);

      world = someBuilder
        .unsetTile(randX, randY)
        .build();

      expect(someBuilder.at(randX, randY).isVoid).toBe(true);
      expect(world.at(randX, randY).isVoid).toBe(true);
    });

    it('should un/set a star', function() {
      var world = someBuilder
        .ship(shipX, shipY)
        .star(randX, randY)
        .build();

      expect(someBuilder.at(randX, randY).isVoid).toBe(false);
      expect(someBuilder.at(randX, randY).hasStar).toBe(true);
      expect(someBuilder.at(randX, randY).hasShip).toBe(false);
      expect(someBuilder.at(randX, randY).color).toEqual(Color.CLEAR);

      expect(world.at(randX, randY).isVoid).toBe(false);
      expect(world.at(randX, randY).hasStar).toBe(true);
      expect(world.at(randX, randY).hasShip).toBe(false);
      expect(world.at(randX, randY).color).toEqual(Color.CLEAR);

      world = someBuilder
        .tile(randX, randY, randColor)
        .build();

      expect(someBuilder.at(randX, randY).hasStar).toBe(true);
      expect(someBuilder.at(randX, randY).color).toEqual(randColor);

      expect(world.at(randX, randY).hasStar).toBe(true);
      expect(world.at(randX, randY).color).toEqual(randColor);

      world = someBuilder
        .unsetStar(randX, randY)
        .build();

      expect(someBuilder.at(randX, randY).isVoid).toBe(false);
      expect(someBuilder.at(randX, randY).hasStar).toBe(false);

      expect(world.at(randX, randY).isVoid).toBe(false);
      expect(world.at(randX, randY).hasStar).toBe(false);
    });

  });

  describe('Factory: World', function () {

    // instantiate factory
    var World, someWorld,
        maxX, maxY, currentHeading;

    beforeEach(inject(function (_World_) {
      World = _World_;
      maxX = 4;
      maxY = 3;
      currentHeading = Heading.RIGHT;
      someWorld = new World(maxX, maxY, currentHeading, 0, 1);
    }));

    it('should move about a trivial world', function () {

      _.each(_.range(maxY), function __fillY(y) {
        _.each(_.range(maxX), function __fillX(x) {
          someWorld.setTile(x, y, Material.TILE, Color.CLEAR);
        });
      });

      someWorld.advanceCursor(); // Heading.RIGHT
      expect(someWorld.currentX).toEqual(1);
      expect(someWorld.currentY).toEqual(1);

      someWorld.rotateCursorLeft();
      someWorld.advanceCursor(); // Heading.UP
      expect(someWorld.currentX).toEqual(1);
      expect(someWorld.currentY).toEqual(0);

      someWorld.rotateCursorRight();
      someWorld.advanceCursor(); // Heading.RIGHT
      expect(someWorld.currentX).toEqual(2);
      expect(someWorld.currentY).toEqual(0);

      someWorld.rotateCursorRight();
      someWorld.advanceCursor(); // Heading.DOWN
      someWorld.advanceCursor(); // Heading.DOWN
      expect(someWorld.currentX).toEqual(2);
      expect(someWorld.currentY).toEqual(2);

      someWorld.rotateCursorRight();
      someWorld.advanceCursor(); // Heading.LEFT
      expect(someWorld.currentX).toEqual(1);
      expect(someWorld.currentY).toEqual(2);

      someWorld.rotateCursorLeft();
      someWorld.rotateCursorLeft();
      someWorld.advanceCursor(); // Heading.RIGHT
      someWorld.advanceCursor(); // Heading.RIGHT
      expect(someWorld.currentX).toEqual(3);
      expect(someWorld.currentY).toEqual(2);

      expect(someWorld.safe).toBe(true);
      expect(someWorld.isComplete()).toBe(true);
      expect(someWorld.getCurrentTile().material).toEqual(Material.TILE);
      expect(someWorld.getCurrentTile().color).toEqual(Color.CLEAR);

      // now fall off 

      someWorld.advanceCursor(); // too far along x
      expect(someWorld.safe).toBe(false);
      expect(someWorld.getCurrentTile()).toBe(null);

    });

    it('should not be safe when cursor hits a void', function () {

      _.each(_.range(maxY), function __fillY(y) {
        _.each(_.range(maxX), function __fillX(x) {
          someWorld.setTile(x, y, Material.TILE, Color.CLEAR);
        });
      });

      someWorld.setTile(1, 1, Material.VOID, Color.CLEAR);

      someWorld.advanceCursor(); // Heading.RIGHT
      expect(someWorld.safe).toBe(false);
      expect(someWorld.currentX).toEqual(1);
      expect(someWorld.currentY).toEqual(1);
      expect(someWorld.getCurrentTile().material).toEqual(Material.VOID);
      expect(someWorld.getCurrentTile().color).toEqual(Color.CLEAR);

      someWorld.advanceCursor(); // can't move further from a void
      expect(someWorld.currentX).toEqual(1);
      expect(someWorld.currentY).toEqual(1);

    });

    it('should collect stars', function () {

      var stars = 0;

      _.each(_.range(1, maxX), function __fillX(x) {
        stars += 1;
        someWorld.setTile(x, 1, Material.STAR, Color.CLEAR);
      });

      expect(someWorld.isComplete()).toBe(false);

      _.each(_.range(1, maxX), function __moveX() {
        expect(someWorld.stars).toEqual(stars);
        expect(someWorld.safe).toBe(true);

        someWorld.advanceCursor();
        stars -= 1;
        expect(someWorld.getCurrentTile().material).toEqual(Material.BLANK);
      });

      expect(someWorld.isComplete()).toBe(true);

    });

  });

  describe('Factory: ProgramEditor', function() {
    
    // instantiate factory
    var ProgramEditor, someEditor, sizeFn1 = 3, sizeFn2 = 3;

    beforeEach(inject(function (_ProgramEditor_) {
      ProgramEditor = _ProgramEditor_;
      someEditor = new ProgramEditor(sizeFn1, sizeFn2);
    }));

    it('should set op of a step of a function', function() {
      expect(someEditor.at(1, 2).op).toEqual(Op.NOP);
      expect(someEditor.at(1, 2).color).toEqual(Color.CLEAR);

      var randOp = _.random(9);

      someEditor.op(1, 2, randOp);

      expect(someEditor.at(1, 2).op).toEqual(randOp);
      expect(someEditor.at(1, 2).color).toEqual(Color.CLEAR);

      var program = someEditor.build();

      expect(program.at(1, 2).op).toEqual(randOp);
      expect(program.at(1, 2).color).toEqual(Color.CLEAR);
    });

    it('should set color of step of a function', function() {
      expect(someEditor.at(0, 0).op).toEqual(Op.NOP);
      expect(someEditor.at(0, 0).color).toEqual(Color.CLEAR);

      var randColor = _.random(4),
          program = someEditor
            .color(0, 0, randColor)
            .op(0, 1, Op.F1)
            .color(0, 1, randColor)
            .build();

      expect(someEditor.at(0, 0).op).toEqual(Op.NOP);
      expect(someEditor.at(0, 0).color).toEqual(randColor);
      expect(someEditor.at(0, 1).op).toEqual(Op.F1);
      expect(someEditor.at(0, 1).color).toEqual(randColor);

      // noop are colorless
      expect(program.at(0, 0).op).toEqual(Op.NOP);
      expect(program.at(0, 0).color).toEqual(Color.CLEAR);
      expect(program.at(0, 1).op).toEqual(Op.F1);
      expect(program.at(0, 1).color).toEqual(randColor);
    });

    it('should resize the program in number of functions/steps', function() {
      expect(someEditor.fns()).toEqual(2);
      expect(function() { someEditor.at(2,0); }).toThrow('Assertion failed');

      someEditor.fns(3);
      someEditor.steps(2, 2);
      someEditor.at(2, 0, Op.L90, Color.RED);

      expect(someEditor.fns()).toEqual(3);
      expect(someEditor.steps(2)).toEqual(2);
      expect(someEditor.at(2, 0).op).toEqual(Op.L90);
      expect(someEditor.at(2, 0).color).toEqual(Color.RED);

      someEditor.steps(2, 1);
      expect(someEditor.fns()).toEqual(3);
      expect(someEditor.steps(2)).toEqual(1);
      expect(someEditor.at(2, 0).op).toEqual(Op.L90);
      expect(someEditor.at(2, 0).color).toEqual(Color.RED);

      someEditor.fns(2);
      expect(someEditor.fns()).toEqual(2);
      expect(function() { someEditor.at(2,0); }).toThrow('Assertion failed');
    });

  });

  describe('Factory: Program', function () {

    // instantiate factory
    var Program, someProgram, fns, poss;

    beforeEach(inject(function (_Program_) {
      Program = _Program_;
      fns     = 2;
      poss    = 10;
      var ini = _.map(_.range(fns), function() { return poss; });
      someProgram = new Program(ini);
    }));

    it('should create a program with a step', function () {
      var fn    = _.random(1,fns),
          pos   = _.random(0,9),
          op    = _.random(0,8),
          color = _.random(0,3);

      expect(someProgram.stepAt(fn, pos).op).toEqual(Op.NOP);
      expect(someProgram.stepAt(fn, pos).color).toEqual(Color.CLEAR);

      someProgram.setFuncStep(fn, pos, op, color);

      expect(someProgram.stepAt(fn, pos).op).toEqual(op);
      expect(someProgram.stepAt(fn, pos).color).toEqual(color);
    });

  });

  describe('Factory: Stepper', function() {

    // instantiate factory
    var Stepper, someStepper, someProgram, someWorld;

    function makeWorld (World) {
      var maxX = 4,
          maxY = 3,
          currentHeading = Heading.RIGHT,
          currentX = 0,
          currentY = 1,
          world = new World(maxX, maxY, currentHeading, currentX, currentY)
            .setTile(0, 1, Material.TILE, Color.GREEN)
            .setTile(1, 1, Material.TILE, Color.BLUE)
            .setTile(2, 1, Material.TILE, Color.RED)
            .setTile(3, 1, Material.STAR, Color.CLEAR);
      return world;
    }

    function makeProgram (Program, Op, Color) {
      var program = new Program([3,3,3,3,3])
            .setFuncStep(1, 0, Op.L90, Color.CLEAR)
            .setFuncStep(1, 1, Op.R90, Color.CLEAR)
            .setFuncStep(1, 2, Op.F2, Color.CLEAR)
            .setFuncStep(2, 1, Op.F3, Color.CLEAR) // should filter out noop @pos=0
            .setFuncStep(3, 2, Op.F4, Color.CLEAR) // should filter out noop @pos=0,1
            .setFuncStep(4, 0, Op.F5, Color.CLEAR)
            .setFuncStep(5, 0, Op.FWD, Color.CLEAR)
            .setFuncStep(5, 1, Op.F5, Color.CLEAR);
      return program;
    }

    beforeEach(inject(function(_Stepper_, _World_, _Program_, _Op_, _Color_) {
      Stepper = _Stepper_;
      someWorld = makeWorld(_World_);
      someProgram = makeProgram(_Program_, _Op_, _Color_);
      someStepper = new Stepper(someWorld, someProgram);
    }));

    it('should step through the world for a simple program', function() {
      var spyOnSafeStep = jasmine.createSpy('onSafeStep'),
          spyOnBadStep  = jasmine.createSpy('onBadStep'),
          spyOnComplete = jasmine.createSpy('onComplete'),
          tookStep;

      // first 5 steps

      tookStep = someStepper.step(6, spyOnSafeStep, spyOnBadStep, spyOnComplete);

      // steps expected:

      // L90 -> R90 -> F2 -> F3 -> F4 -> F5 
      // ^safe       ^safe         ^safe
      //       ^safe       ^safe         ^safe

      expect(spyOnSafeStep).toHaveBeenCalled();
      expect(spyOnSafeStep.callCount).toEqual(6);     // six initially ...

      expect(spyOnComplete).not.toHaveBeenCalled();
      expect(spyOnBadStep).not.toHaveBeenCalled();
      expect(tookStep).toBe(true);

      expect(someWorld.isComplete()).toBe(false);

      // more steps

      tookStep = someStepper.step(5, spyOnSafeStep, spyOnBadStep, spyOnComplete);

      // steps expected: 
      // -> FWD -> F5 -> FWD -> F5 -> FWD (complete)
      //    @(1,1)       @(2,1)       @(3,1,*)
      //    ^safe        ^safe        ^complete
      //           ^safe        ^safe

      expect(spyOnSafeStep).toHaveBeenCalled();
      expect(spyOnSafeStep.callCount).toEqual(6 + 4);  // and four more

      expect(spyOnComplete).toHaveBeenCalled();
      expect(spyOnComplete.callCount).toEqual(1);

      expect(spyOnBadStep).not.toHaveBeenCalled();
      expect(tookStep).toBe(true);

      expect(someWorld.isComplete()).toBe(true);

      // add another star, and move twice more...
      // -> F5 -> FWD -> stop
      //          @(4,1) = out of bounds
      //    ^safe
      //          ^bad!

      someWorld.setTile(3, 2, Material.STAR, Color.CLEAR);
      expect(someWorld.isComplete()).toBe(false);

      tookStep = someStepper.step(3, spyOnSafeStep, spyOnBadStep, spyOnComplete);

      expect(spyOnBadStep).toHaveBeenCalled();
      expect(spyOnBadStep.callCount).toEqual(1);

      expect(tookStep).toBe(false);

    });

  });

});
