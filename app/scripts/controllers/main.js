'use strict';

angular.module('robozzleApp')
  .controller('MainCtrl', [
    '$scope', 'World', 'Heading', 'Material', 'Color', 'Program', 'Op',
    function ($scope, World, Heading, Material, Color, Program, Op) {
    
      $scope.range = _.range;

      function init() {
        $scope.tileHeight = 16;
        $scope.tileWidth = 16;
        $scope.tileHeightPad = 2;
        $scope.tileWidthPad = 2;

        $scope.coordOfX = function (x) {
          return x * $scope.tileWidth + ( 2 * x + 1 ) * $scope.tileWidthPad;
        };
        $scope.coordOfY = function (y) {
          return y * $scope.tileHeight + ( 2 * y + 1 ) * $scope.tileHeightPad;
        };
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
            world.setTile(currentX - dx, currentY + dy, Material.TILE, Color.CLEAR);
          });
        });
 
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

      init();
      initWorld();
      initProgram();

    }
  ]);
