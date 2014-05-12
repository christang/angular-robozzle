'use strict';

angular.module('robozzleWidgets', ['robozzleObjects'])

  .factory('StyleMap', [
    'Op', 'Color', 'Heading', 'Material',
    function __instanceFactory(Op, Color, Heading, Material) {

      var colorClasses = {};

      colorClasses[Color.CLEAR] = ['tile-clear'];
      colorClasses[Color.RED]   = ['tile-red'];
      colorClasses[Color.BLUE]  = ['tile-blue'];
      colorClasses[Color.GREEN] = ['tile-green'];

      var boardClasses = {};

      boardClasses[Material.VOID] = ['tile-void'];
      boardClasses[Material.STAR] = ['tile-star'];
      boardClasses[Material.SHIP] = ['tile-ship'];

      var stepClasses = {};

      stepClasses[Op.NOP] = ['tile-nop'];
      stepClasses.cursor = ['tile-cursor'];

      var headingIcons = {};

      headingIcons[Heading.UP]    = ['\uf077'];
      headingIcons[Heading.RIGHT] = ['\uf054'];
      headingIcons[Heading.DOWN]  = ['\uf078'];
      headingIcons[Heading.LEFT]  = ['\uf053'];

      var boardIcons = {};
      boardIcons[Material.VOID] = [' '];
      boardIcons[Material.STAR] = ['\uf08a'];

      var opIcons = {};

      opIcons[Op.NOP] = [' '];
      opIcons[Op.F1]  = ['1'];
      opIcons[Op.F2]  = ['2'];
      opIcons[Op.F3]  = ['3'];
      opIcons[Op.F4]  = ['4'];
      opIcons[Op.F5]  = ['5'];
      opIcons[Op.FWD] = ['\uf062'];
      opIcons[Op.L90] = ['\uf0e2'];
      opIcons[Op.R90] = ['\uf01e'];

      return {
        icons: {
          headings: headingIcons,
          board: boardIcons,
          ops: opIcons
        },
        classes: {
          colors: colorClasses,
          board: boardClasses,
          steps: stepClasses
        }
      };

    }
  ]);