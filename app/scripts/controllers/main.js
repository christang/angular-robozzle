'use strict';

angular.module('robozzleMain', ['robozzleObjects'])
  .controller('MainCtrl', [
    '$scope', 'Stepper', 'WorldEditor', 'ProgramEditor', 'Heading', 'Material', 'Color', 'Op',
    function ($scope, Stepper, WorldEditor, ProgramEditor, Heading, Material, Color, Op) {
    
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
        var builder = new ProgramEditor(5)
          .op(0, 0, Op.FWD)
          .op(0, 1, Op.R90)
          .op(0, 2, Op.F1);

        $scope.program = builder.build();
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

        $scope.program.isCurrent = function (r, c) {
          return (r + 1 === $scope.currentFn && c === $scope.currentPos);
        }

        $scope.program.classAt = function (r, c) {

          var tile = $scope.program.at(r, c),
              classes = [];

          classes.push(tile.isNoOp() ? classNOP[0] : classMap[tile.color][0]);
          if ($scope.program.isCurrent()) {
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

        $scope.program.iconAt = function (r, c) {
          var step = $scope.program.at(r, c);
          return iconMap[step.op][0];
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
