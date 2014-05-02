'use strict';

// To define an instantiatable class / constructor, we can
// use either the Factory() of the Value() method. I prefer
// the Factory since it allows for dependency injection.

angular.module('robozzleObjects', [])
  .factory('Person', [function __classFactory() {


    // Define the constructor function.
    function Person( firstName, lastName ) {

      this.firstName = firstName || '';
      this.lastName = lastName || '';

    }


    // Define the "instance" methods using the prototype
    // and standard prototypal inheritance.
    Person.prototype = {

      getFirstName: function() {

        return( this.firstName );

      },

      getFullName: function() {

        return( this.firstName + ' ' + this.lastName );

      }

    };


    // Define the "class" / "static" methods. These are
    // utility methods on the class itself; they do not
    // have access to the "this" reference.
    Person.fromFullName = function( fullName ) {

      var parts = ( fullName || '' ).split( /\s+/gi );

      return(
        new Person(
            parts[ 0 ],
            parts.splice( 0, 1 ) && parts.join( ' ' )
        )
      );

    };


    // Return constructor - this is what defines the actual
    // injectable in the DI framework.
    return( Person );

  }])

  .value('assert', function (assertion, message) {
    if (!assertion) {
      throw message || 'Assertion failed';
    }
  })

  .value('Op', {

    NOP   :  0,
    F1    :  1,
    F2    :  2,
    F3    :  3,
    F4    :  4,
    F5    :  5,
    FWD   :  6,
    L90   :  7,
    R90   :  8

  })

  .value('Color', {

    CLEAR :  0,
    RED   :  1,
    BLUE  :  2,
    GREEN :  3

  })

  .value('Heading', {

    UP    :  0,
    RIGHT :  1,
    DOWN  :  2,
    LEFT  :  3

  })

  .value('Material', {

    TILE  :  0,
    STAR  :  1,
    VOID  :  2,
    BLANK :  3

  })

  .factory('Step', [function __classFactory() {

    function Step(op, color) {
      this.op = op;
      this.color = color;
    }

    function stepOf(index) {
      var op = index % 10,
          color = Math.floor(index / 10);
      return new Step(op, color);
    }

    Step.encode = function (op, color) {
      return 10 * color + op;
    };

    Step.decode = function (encoded) {
      var decoder = _.memoize(function (e) { return stepOf(e); });
      return decoder(encoded);
    };

    return Step;

  }])

  .factory('Stack', [function __classFactory() {

    function Stack() {
      this.tape = [];
    }

    Stack.prototype = {
      any: function () {
        return this.tape.length > 0;
      },
      pop: function () {
        return this.tape.pop();
      },
      push: function (opCodes) {
        // todo: filter NOP
        this.tape = this.tape.concat(opCodes);
      }
    };

    return Stack;

  }])

  .factory('Tile', ['Color', 'Material', function __classFactory(
    Color, Material) {

    function Tile(material, color) {
      this.material = material || Material.VOID;
      this.color = color || Color.CLEAR;
    }

    return Tile;

  }])

  .factory('World', ['Heading', 'Material', 'Tile', 'assert', function __classFactory(
    Heading, Material, Tile, assert) {

    function World(maxX, maxY, currentHeading, currentX, currentY) {
      assert(currentX < maxX);
      assert(currentY < maxY);
      this.maxX = maxX;
      this.maxY = maxY;
      this.currentHeading = currentHeading;
      this.currentX = currentX;
      this.currentY = currentY;
      this.safe = true;
      this.stars = 0;

      this.grid = _.map(_.range(maxY), function () {
        return _.map(_.range(maxX), function () {
          return new Tile();
        });
      });
    }

    World.prototype = {
      setTile: function (x, y, material, color) {
        var oldMaterial = this.grid[y][x].material;
        this.grid[y][x].material = material;
        this.grid[y][x].color = color;
        if (oldMaterial !== material) {
          if (material === Material.STAR) { this.stars += 1; }
          if (oldMaterial === Material.STAR) { this.stars -= 1; }
        }
      },
      getCurrentTile: function () {
        if (this.currentY >= 0 && this.currentY < this.maxY && this.currentX >= 0 && this.currentX < this.maxX) {
          return this.grid[this.currentY][this.currentX];
        } else {
          return null;
        }
      },
      advanceCursor: function () {

        // don't move unless safe
        if (!this.safe) { return; }

        switch (this.currentHeading) {

          case Heading.UP:
            this.currentY -= 1;
            break;

          case Heading.RIGHT:
            this.currentX += 1;
            break;

          case Heading.DOWN:
            this.currentY += 1;
            break;

          case Heading.LEFT:
            this.currentX -= 1;
            break;

        }

        if (this.currentX < 0 || this.currentX >= this.maxX || this.currentY < 0 || this.currentY >= this.maxY) {

          this.safe = false;

        } else {

          var currentTile = this.getCurrentTile();

          switch (currentTile.material) {

            case Material.VOID:
              this.safe = false;
              break;

            case Material.STAR:
              this.setTile(this.currentX, this.currentY, Material.BLANK, currentTile.color);
              break;

          }

        }

      },
      rotateCursorLeft: function () {
        // don't move unless safe
        if (!this.safe) { return; }

        this.currentHeading = ( this.currentHeading + 3 ) % 4;
      },
      rotateCursorRight: function () {
        // don't move unless safe
        if (!this.safe) { return; }

        this.currentHeading = ( this.currentHeading + 1 ) % 4;
      },
      isComplete: function () {

        return this.stars === 0;
      }
    };

    return World;

  }])

  .factory('Program', ['Color', 'Op', 'Stack', 'Step', 'assert', function __classFactory(
    Color, Op, Stack, Step, assert) {

    var maxFuncs = 5,
        maxStepsPerFunc = 10;

    function Program(funcSteps) {
      assert(funcSteps.length <= maxFuncs);

      this.functions = _.map(funcSteps, function __initProgram(steps) {
        assert(steps <= maxStepsPerFunc);
        return arrayOf(steps, Step.encode(Op.NOP, Color.CLEAR));
      });

      this.success = false;
    }

    function arrayOf(n, opCode) {
      return _.map(_.range(n), function () { return opCode; });
    }

    Program.prototype = {
      stepAt: function (fn, pos) {
        assert(fn <= maxFuncs);

        var fun = this.functions[fn - 1],
            len = fun.length;

        assert(pos < len);

        var opCode = fun[len-pos-1],
            step = Step.decode(opCode);

        return step;
      },
      setFuncStep: function (fn, pos, action, color) {
        assert(fn <= this.functions.length);

        var fun = this.functions[fn - 1],
            len = fun.length;
        
        assert(pos < len);

        fun[len-pos-1] = Step.encode(action, color);
      },
      run: function (world) {
        var stack = new Stack();
        stack.push(this.functions[0]);

        while(stack.any() && world.safe && !world.isComplete()) {
          var opCode = stack.pop(),
              step = Step.decode(opCode),
              currentTile = world.getCurrentTile();

          switch (step.op) {

            case Op.NOP:
              break;
            
            case Op.F1:
              if (currentTile.color === step.color) { stack.push(this.functions[0]); }
              break;

            case Op.F2:
              if (currentTile.color === step.color) { stack.push(this.functions[1]); }
              break;

            case Op.F3:
              if (currentTile.color === step.color) { stack.push(this.functions[2]); }
              break;

            case Op.F4:
              if (currentTile.color === step.color) { stack.push(this.functions[3]); }
              break;

            case Op.F5:
              if (currentTile.color === step.color) { stack.push(this.functions[4]); }
              break;

            case Op.FWD:
              if (currentTile.color === step.color) { world.advanceCursor(); }
              break;

            case Op.L90:
              if (currentTile.color === step.color) { world.rotateCursorLeft(); }
              break;

            case Op.R90:
              if (currentTile.color === step.color) { world.rotateCursorRight(); }
              break;

          }

          if (world.safe && world.isComplete()) {
            this.success = true;
          }

        }
      }
    };

    return Program;

  }]);
