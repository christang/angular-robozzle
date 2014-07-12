'use strict';

// To define an instantiatable class / constructor, we can
// use either the Factory() of the Value() method. I prefer
// the Factory since it allows for dependency injection.

angular.module('robozzleApp')

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

  .value('Configs', {

    maxFuncs        : 5,
    maxStepsPerFunc : 10

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

    Step.isNoOp = function (encoded) {
      return encoded % 10 === 0;
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

        return this;
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

  .factory('WorldEditor', ['World', 'Material', 'Color', 'Heading', 'assert', function __classFactory (
    World, Material, Color, Heading, assert) {

    function WorldEditor (maxX, maxY) {
      this.maxX = maxX || 10;
      this.maxY = maxY || 10;
      this.tiles = {};
      this.stars = {};
    }

    function assertBounds(self) {
      assert(!!self.maxX, 'x bound not set');
      assert(!!self.maxY, 'y bound not set');
    }

    function assertWithinBounds(self, x, y) {
      assertBounds(self);
      assert(x >= 0 && x < self.maxX, 'x not within bounds');
      assert(y >= 0 && y < self.maxY, 'y not within bounds');
    }

    function assertWellDefined(self) {
      assert(_.isNumber(self.H), 'missing heading');
      assert(_.isNumber(self.X), 'missing X');
      assert(_.isNumber(self.Y), 'missing Y');
      assertWithinBounds(self, self.X, self.Y);
    }

    WorldEditor.prototype = {
      at: function (x, y) {
        var t = [x,y].join(':'),
          tileHelper = {
            isVoid: !(this.tiles[t] || this.tiles[t] === 0)
          };

        if (!tileHelper.isVoid) {
          tileHelper.hasStar = !!this.stars[t];
          tileHelper.hasShip = (this.X === x && this.Y === y);
          tileHelper.color = this.tiles[t];
          if (tileHelper.hasShip) {
            tileHelper.heading = this.H;
          }
        }
        return tileHelper;
      },
      tile: function(x, y, c) {
        assertWithinBounds(this, x, y);
        var t = [x,y].join(':');
        this.tiles[t] = c || Color.CLEAR ;
        return this;
      },
      unsetTile: function(x, y) {  // an unset tile is a void
        var t = [x,y].join(':');
        delete(this.tiles[t]);
        delete(this.stars[t]);  // unsetting a tile with a star unsets the star
        if (x === this.X && y === this.Y) {
          this.unsetShip();  // unsetting a tile with a ship unsets the ship
        }
        return this;
      },
      star: function(x, y, c) {
        assertWithinBounds(this, x, y);
        var t = [x,y].join(':');
        this.stars[t] = true;
        this.tiles[t] = c || this.tiles[t] || Color.CLEAR;  // adding a star on a void changes it to tile
        if (x === this.X && y === this.Y) {
          this.unsetShip();  // setting a tile with a ship to star unsets the ship
        }
        return this;
      },
      unsetStar: function(x, y) {
        var t = [x,y].join(':');
        delete(this.stars[t]);
        return this;
      },
      ship: function(x, y, c, h) {
        assertWithinBounds(this, x, y);
        var t = [x,y].join(':');
        this.X = parseInt(x);
        this.Y = parseInt(y);
        this.H = h || this.H || Heading.UP;
        this.tiles[t] = c || this.tiles[t] || Color.CLEAR;  // adding a ship on a void changes it to tile
        delete(this.stars[t]);  // adding a ship on a star unsets it
        return this;
      },
      unsetShip: function() {
        this.X = null;
        this.Y = null;
        this.H = null;
        return this;
      },
      heading: function(h) {
        // assert ship here?
        this.H = parseInt(h);
        return this;
      },
      height: function(h) {
        if (!h) {
          // get current value of maxY
          return this.maxY;
        }
        // OR set new value of maxY
        this.maxY = h;
        return this;
      },
      width: function(w) {
        if (!w) {
          // get current value of maxX
          return this.maxX;
        }
        // OR set new value of maxX
        this.maxX = w;
        return this;
      },
      build: function () {
        assertWellDefined(this);
        var world = new World(this.maxX, this.maxY, this.H, this.X, this.Y);
        _.each(this.tiles, function(val, key) {
          var t = key.split(':'),
              x = parseInt(t[0]),
              y = parseInt(t[1]),
              c = parseInt(val);
          world.setTile(x, y, Material.TILE, c);
        });

        var tiles = this.tiles;
        _.each(this.stars, function(val, key) {
          var t = key.split(':'),
              x = parseInt(t[0]),
              y = parseInt(t[1]),
              c = tiles[key];
          world.setTile(x, y, Material.STAR, c);
        });

        world.at = function (x, y) {
          var tileHelper = {
            isVoid: this.grid[y][x].material === Material.VOID
          };

          if (!tileHelper.isVoid) {
            tileHelper.hasStar = this.grid[y][x].material === Material.STAR;
            tileHelper.hasShip = this.currentX === x && this.currentY === y;
            tileHelper.color = this.grid[y][x].color;
            if (tileHelper.hasShip) {
              tileHelper.heading = this.currentHeading;
            }
          }

          return tileHelper;
        };

        return world;
      },
      toJson: function () {
        var obj = {
          maxX: this.maxX,
          maxY: this.maxY,
          tiles: this.tiles,
          stars: this.stars
        };
        return JSON.stringify(obj);
      }
    };

    WorldEditor.fromJson = function (json) {
      var editor = new WorldEditor(),
          obj = JSON.parse(json);
      for (var key in obj) {
        editor[key] = obj[key];
      }
      return editor;
    };

    return WorldEditor;

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
        return this;
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
        if (!this.safe) { return this; }

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

        return this;
      },
      rotateCursorLeft: function () {
        // don't move unless safe
        if (this.safe) {
          this.currentHeading = ( this.currentHeading + 3 ) % 4;
        }
        return this;
      },
      rotateCursorRight: function () {
        // don't move unless safe
        if (this.safe) {
          this.currentHeading = ( this.currentHeading + 1 ) % 4;
        }
        return this;
      },
      isComplete: function () {

        return this.stars === 0;
      }
    };

    return World;

  }])

  .factory('ProgramEditor', ['Configs', 'Color', 'Op', 'Program', 'Step', 'assert', function __classFactory(
    Configs, Color, Op, Program, Step, assert) {

    function ProgramEditor () {
      var mem = this.mem = [];
      assert(arguments.length <= Configs.maxFuncs);
      _.each(arguments, function (val) {
        mem.push(fill(val));
      });
    }

    function fill (len) {
      assert(len >= 0 && len < Configs.maxStepsPerFunc);
      return _.map(_.range(len), function () {
        return new Step(Op.NOP, Color.CLEAR);
      });
    }

    ProgramEditor.prototype = {
      at: function (r, c, newOp, newColor) {
        var mem = this.mem;
        // two-way binding
        assert(r >= 0 && r < mem.length);
        assert(c >= 0 && c < mem[r].length);
        if (newOp || newColor) {
          mem[r][c].op = newOp || mem[r][c].op;
          mem[r][c].color = newColor || mem[r][c].color;
          return this;
        }
        mem[r][c].isNoOp = function () { return this.op === Op.NOP; };
        return mem[r][c];
      },
      op: function (r, c, newOp) {
        var mem = this.mem;
        assert(r >= 0 && r < mem.length);
        assert(c >= 0 && c < mem[r].length);
        mem[r][c].op = newOp;
        return this;
      },
      color: function (r, c, newColor) {
        var mem = this.mem;
        assert(r >= 0 && r < mem.length);
        assert(c >= 0 && c < mem[r].length);
        mem[r][c].color = newColor;
        return this;
      },
      fns: function (mLength) {
        var mem = this.mem;
        // return the length of program
        if (!mLength) {
          return mem.length;
        }
        // or set its length
        assert(mLength >= 0 && mLength <= Configs.maxFuncs);
        if (mLength < mem.length) {
          mem = this.mem = mem.slice(0, mLength);
        } else if (mLength > mem.length) {
          _.each(_.range(mLength - mem.length), function () {
            mem.push([]);
          });
        }
        return this;
      },
      steps: function (r, rLength) {
        var mem = this.mem;
        // return the length of function
        assert(r >= 0 && r < mem.length);
        if (!rLength) {
          return mem[r].length;
        }
        // or set its length
        assert(rLength >= 0 && rLength < Configs.maxStepsPerFunc);
        if (rLength < mem[r].length) {
          mem[r] = mem[r].slice(0, rLength);
        } else if (rLength > mem[r].length) {
          _.each(_.range(rLength - mem[r].length), function () {
            mem[r].push(new Step(Op.NOP, Color.CLEAR));
          });
        }
        return this;
      },
      build: function () {
        var mem = this.mem;
        var program = new Program(_.map(mem, function (fn) {
          return fn.length;
        }));

        _.each(mem, function (fn, r) {
          _.each(fn, function (step, c) {
            // make noop colorless
            var color = step.op === Op.NOP ? Color.CLEAR : step.color;
            program.setFuncStep(r + 1, c, step.op, color);
          });
        });

        program.at = function (r, c) {
          // one-way binding
          var tile = program.stepAt(r + 1, c);
          tile.isNoOp = function () { return this.op === Op.NOP; };
          return tile;
        };

        return program;
      },
      toJson: function () {
        var obj = {
          mem: this.mem
        };
        return JSON.stringify(obj);
      }
    };

    ProgramEditor.fromJson = function (json) {
      var obj = JSON.parse(json),
          editor = new ProgramEditor();
      for (var key in obj) {
        editor[key] = obj[key];
      }
      return editor;
    };

    return ProgramEditor;

  }])

  .factory('Program', ['Configs', 'Color', 'Op', 'Stack', 'Step', 'assert', function __classFactory(
    Configs, Color, Op, Stack, Step, assert) {

    function Program(funcSteps) {
      assert(funcSteps.length <= Configs.maxFuncs);

      this.functions = _.map(funcSteps, function __initProgram(steps) {
        assert(steps <= Configs.maxStepsPerFunc);
        return arrayOf(steps, Step.encode(Op.NOP, Color.CLEAR));
      });

      this.success = false;
    }

    function arrayOf(n, opCode) {
      return _.map(_.range(n), function () { return opCode; });
    }

    Program.prototype = {
      stepAt: function (fn, pos) {
        assert(fn <= Configs.maxFuncs);

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
        
        return this;
      }
    };

    return Program;

  }])

  .factory('Stepper', ['Color', 'Op', 'Step', 'Stack', function __classFactory(Color, Op, Step, Stack) {

    function noop() {}

    function pushFunction(fn, program, stack) {
      var fun = program.functions[fn-1],
          len = fun.length,
          data = _.map(fun, function (f, i) {
            return [f, fn, len-i-1];
          });
      data = _.filter(data, function (o) {
        return !Step.isNoOp(o[0]);
      });

      stack.push(data);
    }

    function stepAllowed(tile, step) {
      return step.color === Color.CLEAR || tile.color === step.color;
    }

    function takeStep(world, program, stack, onSafeStep, onBadStep, onComplete) {

      var popped = stack.pop(),
          opCode = popped[0],
          step = Step.decode(opCode),
          currentTile = world.getCurrentTile();

      switch (step.op) {

        case Op.NOP:
          break;
        
        case Op.F1:
          if (stepAllowed(currentTile, step)) { pushFunction(1, program, stack); }
          break;

        case Op.F2:
          if (stepAllowed(currentTile, step)) { pushFunction(2, program, stack); }
          break;

        case Op.F3:
          if (stepAllowed(currentTile, step)) { pushFunction(3, program, stack); }
          break;

        case Op.F4:
          if (stepAllowed(currentTile, step)) { pushFunction(4, program, stack); }
          break;

        case Op.F5:
          if (stepAllowed(currentTile, step)) { pushFunction(5, program, stack); }
          break;

        case Op.FWD:
          if (stepAllowed(currentTile, step)) { world.advanceCursor(); }
          break;

        case Op.L90:
          if (stepAllowed(currentTile, step)) { world.rotateCursorLeft(); }
          break;

        case Op.R90:
          if (stepAllowed(currentTile, step)) { world.rotateCursorRight(); }
          break;

      }

      var fn = popped[1],
          pos = popped[2];

      if (world.safe) {
        if (world.isComplete()) {
          program.success = true;
          onComplete(fn, pos, 'complete!');
        } else {
          onSafeStep(fn, pos, 'safe');
        }
      } else {
        onBadStep(fn, pos, 'bad');
      }

    }

    function Stepper(world, program) {
      var stack = new Stack();
      pushFunction(1, program, stack);

      this.step = function (n, onSafeStep, onBadStep, onComplete) {
        n = n || 1;
        onComplete = onComplete || noop;
        onSafeStep = onSafeStep || noop;
        onBadStep = onBadStep || noop;

        while (n > 0) {
          if (stack.any() && world.safe && !world.isComplete()) {
            takeStep(world, program, stack, onSafeStep, onBadStep, onComplete);
          } else {
            return false;
          }

          n -= 1;
        }

        return true;
      };
    }

    return Stepper;

  }])

  ;
