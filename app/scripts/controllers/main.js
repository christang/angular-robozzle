'use strict';

angular.module('robozzleMain', ['robozzleObjects'])
  .controller('MainCtrl', [
    '$scope', 'Stepper', 'WorldEditor', 'Heading', 'Material', 'Color', 'Program', 'Op',
    function ($scope, Stepper, WorldEditor, Heading, Material, Color, Program, Op) {
    
      $scope.range = _.range;

      function init() {
        $scope.view = {
          world: {
            tile: {
              height: 36,
              width: 36,
              horizPad: 1,
              verticalPad: 1
            }
          },
          program: {
            tile: {
              height: 24,
              width: 24,
              horizPad: 1,
              verticalPad: 1
            }
          }
        };
      }

      function initWorld() {
        var builder = new WorldEditor(9, 7)
          .ship(4, 3)
          .tile(5, 3)
          .tile(4, 2)
          .star(5, 2)
          .heading(Heading.UP);

        $scope.world = builder.build();
      }

      function initProgram() {
        var funcSteps = [10, 10, 10, 10, 10],
            program = new Program(funcSteps);

        program.setFuncStep(1, 0, Op.FWD, Color.CLEAR);
        program.setFuncStep(1, 1, Op.R90, Color.CLEAR);
        program.setFuncStep(1, 2, Op.F1, Color.CLEAR);

        $scope.program = program;
      }

      var classMap = {};

      classMap[Color.CLEAR] = ['tile-clear', ''];
      classMap[Color.RED]   = ['tile-red', ''];
      classMap[Color.BLUE]  = ['tile-blue', ''];
      classMap[Color.GREEN] = ['tile-green', ''];

      function initWorldHelpers() {
        var classVoid = ['tile-void', ''],
            classStar = ['tile-star', ''],
            classShip = ['tile-ship', ''];

        $scope.world.classAt = function (x, y) {

          var tile = $scope.world.at(x, y),
              classes = [];

          // if scope.world.at(x,y).isVoid 
          //   classes.push(StyleMap.void)
          // else /tile/
          //   classes.push(StyleMap.tile, StyleMap.color[c])
          //   if /tile/ hasStar 
          //     classes.push(StyleMap.star)
          //   if /tile/ hasShip
          //     classes.push(StyleMap.ship)

          if (tile.isVoid) {
            classes.push(classVoid[0]);
          } else {
            classes.push(classMap[tile.color][0]);
            if (tile.hasStar) {
              classes.push(classStar[0]);
            }
            if (tile.hasShip) {
              classes.push(classShip[0]);
            }
          }
            
          return classes.join(' ');
        };

        var iconMap = {};

        // FontAwesome mappings

        iconMap[Heading.UP]    = ['\uf077', ''];
        iconMap[Heading.RIGHT] = ['\uf054', ''];
        iconMap[Heading.DOWN]  = ['\uf078', ''];
        iconMap[Heading.LEFT]  = ['\uf053', ''];

        var starTile = ['\uf08a', ''];

        $scope.world.iconAt = function (x, y) {

          var tile = $scope.world.at(x, y);

          if (tile.isVoid) {
            return ' ';
          } else {
            if (tile.hasStar) {
              return starTile[0];
            }
            if (tile.hasShip) {
              return iconMap[tile.heading][0];
            }
          }

        };
      }

      function initProgramHelpers() {
        var classNOP    = ['tile-nop', ''],
            classCursor = ['tile-cursor', ''];

        $scope.program.classAt = function (fn, pos) {
          var step = $scope.program.stepAt(fn + 1, pos),
              color = step.color,
              isNOP = (step.op === Op.NOP),
              classes = [];

          classes.push(isNOP ? classNOP[0] : classMap[color][0]);

          var isCurrent = (fn + 1 === $scope.currentFn && pos === $scope.currentPos);

          if (isCurrent) {
            classes.push(classCursor[0]);
          }

          return classes.join(' ');
        };

        var iconMap = {};

        iconMap[Op.NOP] = [' ', ''];
        iconMap[Op.F1]  = ['1', ''];
        iconMap[Op.F2]  = ['2', ''];
        iconMap[Op.F3]  = ['3', ''];
        iconMap[Op.F4]  = ['4', ''];
        iconMap[Op.F5]  = ['5', ''];
        iconMap[Op.FWD] = ['\uf062', ''];
        iconMap[Op.L90] = ['\uf0e2', ''];
        iconMap[Op.R90] = ['\uf01e', ''];

        $scope.program.iconAt = function (x, y) {
          var step = $scope.program.stepAt(x + 1, y),
              op = step.op;

          return iconMap[op][0];
        };
      }

      function initStepper() {

        function callback(fn, pos, status) {
          $scope.currentFn = fn;
          $scope.currentPos = pos;
          console.log(status, fn, pos);
        }

        $scope.stepper = new Stepper($scope.world,
                                     $scope.program);

        $scope.onSafeStep =
        $scope.onBadStep =
        $scope.onComplete = callback;

      }

      init();
      initWorld();
      initWorldHelpers();
      initProgram();
      initProgramHelpers();
      initStepper();

    }
  ]);
