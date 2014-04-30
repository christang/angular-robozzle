'use strict';

angular.module('robozzleApp')
  .controller('MainCtrl', [
    '$scope', 'World', 'Heading', 'Material', 'Color', 'Program', 'Op',
    function ($scope, World, Heading, Material, Color, Program, Op) {
    
      $scope.range = _.range;

      function init() {
        $scope.tileHeight = 36;
        $scope.tileWidth = 36;
        $scope.tileHeightPad = 1;
        $scope.tileWidthPad = 1;
      }

      function initWorld() {
        var maxX = 9,
          maxY = 7,
          currentHeading = Heading.UP,
          currentX = 4,
          currentY = 3,
          world = new World(maxX, maxY, currentHeading, currentX, currentY);

        _.each(_.range(2), function (dy) {
          _.each(_.range(2), function (dx) {
            world.setTile(currentX + dx, currentY - dy, Material.TILE, Color.CLEAR);
          });
        });
 
        world.setTile(currentX + 1, currentY - 1, Material.STAR, Color.CLEAR);

        $scope.world = world;
      }

      function initProgram() {
        var funcSteps = [10, 10, 10, 10, 10],
          program = new Program(funcSteps);

        program.setFuncStep(1, 0, Op.FWD, Color.CLEAR);
        program.setFuncStep(1, 1, Op.R90, Color.CLEAR);
        program.setFuncStep(1, 2, Op.F1, Color.CLEAR);

        $scope.program = program;
      }

      function initHelpers() {
        var classMap = {};

        classMap[Color.CLEAR] = ['tile-clear', ''];
        classMap[Color.RED]   = ['tile-red', ''];
        classMap[Color.BLUE]  = ['tile-blue', ''];
        classMap[Color.GREEN] = ['tile-green', ''];

        var classVoid   = ['tile-void', ''],
            classStar   = ['tile-star', ''],
            classCursor = ['tile-cursor', ''];

        $scope.classAt = function (x, y) {
          var tile = $scope.world.grid[y][x],
              color = tile.color,
              isVoid = (tile.material === Material.VOID),
              classes = [];

          classes.push(isVoid ? classVoid[0] : classMap[color][0]);

          var currentX = $scope.world.currentX,
              currentY = $scope.world.currentY,
              isCurrent = (currentX === x && currentY === y);

          if (isCurrent) {
            classes.push(classCursor[0]);
          }

          var isStar = (tile.material === Material.STAR);

          if (isStar) {
            classes.push(classStar[0]);
          }

          return classes.join(' ');
        };

        var iconMap = {};

        iconMap[Heading.UP]    = ['\ue113', ''];
        iconMap[Heading.RIGHT] = ['\ue080', ''];
        iconMap[Heading.DOWN]  = ['\ue114', ''];
        iconMap[Heading.LEFT]  = ['\ue079', ''];

        var starTile = ['\ue104', ''];

        $scope.iconAt = function (x, y) {
          var currentX = $scope.world.currentX,
              currentY = $scope.world.currentY,
              currentHeading = $scope.world.currentHeading,
              isCurrent = (currentX === x && currentY === y);

          if (isCurrent) {
            return iconMap[currentHeading][0];
          }

          var tile = $scope.world.grid[y][x],
              isStar = (tile.material === Material.STAR);

          return isStar ? starTile[0] : ' ';
        };
      }

      init();
      initWorld();
      initProgram();
      initHelpers();

    }
  ]);
