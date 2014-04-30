'use strict';

describe('Service: robozzle', function () {

  // load the service's module
  beforeEach(module('robozzleApp'));

  var Op, Color, Heading, Material;

  beforeEach(inject(function (_Op_, _Color_, _Heading_, _Material_) {
    Op = _Op_;
    Color = _Color_;
    Heading = _Heading_;
    Material = _Material_;
  }));

  describe('Factory: Person', function () {

    // instantiate factory
    var Person, albert, galileo;
    beforeEach(inject(function (_Person_) {
      Person = _Person_;
      albert = new Person('Albert', 'Einstein');
      galileo = new Person('Galileo', 'Galilei');
    }));

    it('should get first name', function () {
      expect(albert.getFirstName()).toEqual('Albert');
    });

    it('should get full name', function () {
      expect(albert.getFullName()).toEqual('Albert Einstein');
    });

    it('should create Person from full name', function () {
      expect(Person.fromFullName('Albert Einstein')).toEqual(albert);
      expect(Person.fromFullName('Albert Einstein')).not.toEqual(galileo);
    });

  });

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

  describe('Factory: Program', function () {

    // instantiate factory
    var Program;

    beforeEach(inject(function (_Program_) {
      Program = _Program_;
    }));

    describe('should run a simple program', function () {
      
    });

  });

});