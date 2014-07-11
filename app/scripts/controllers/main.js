'use strict';

angular.module('robozzleMain', ['robozzleObjects', 'robozzleWidgets'])
  .controller('MainCtrl', [
    '$scope', 'Stepper', 'WorldEditor', 'ProgramEditor', 'StyleMap', 'Heading', 'Material', 'Color', 'Op',
    function ($scope, Stepper, WorldEditor, ProgramEditor, StyleMap, Heading, Material, Color, Op) {
    
      $scope.range = _.range;

      function init() {
        $scope.view = {
          world: {
            offset: {
              x: 100,
              y: 2.5
            },
            tile: {
              height: 36,
              width: 36,
              horizPad: 1,
              verticalPad: 1
            }
          },
          program: {
            offset: {
              x: 175,
              y: 325
            },
            tile: {
              height: 24,
              width: 24,
              horizPad: 1,
              verticalPad: 1
            }
          },
          menu: {
            eye: 15,
            arcPad: 0,
            arcWidth: 25,
            arcShift: 2
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

        $scope.worldBuilder = builder;
        $scope.world = builder.build();
      }

      function initProgram() {
        var builder = new ProgramEditor(5)
          .op(0, 0, Op.FWD)
          .op(0, 1, Op.R90)
          .op(0, 2, Op.F1);

        $scope.programBuilder = builder;
        $scope.program = builder.build();
      }

      function initWorldHelpers() {

        $scope.world.classAt = function (x, y) {

          var tile = $scope.world.at(x, y),
              classes = [];

          if (tile.isVoid) {
            classes = classes.concat(StyleMap.classes.board[Material.VOID]);
          } else {
            classes = classes.concat(StyleMap.classes.colors[tile.color]);
            if (tile.hasStar) {
              classes = classes.concat(StyleMap.classes.board[Material.STAR]);
            }
            if (tile.hasShip) {
              classes = classes.concat(StyleMap.classes.board[Material.SHIP]);
            }
          }
            
          return classes.join(' ');
        };

        $scope.world.iconAt = function (x, y) {

          var tile = $scope.world.at(x, y);

          if (tile.isVoid) {
            return StyleMap.icons.board[Material.VOID].join('');
          } else {
            if (tile.hasStar) {
              return StyleMap.icons.board[Material.STAR].join('');
            }
            if (tile.hasShip) {
              return StyleMap.icons.headings[tile.heading].join('');
            }
          }

        };

      }

      function initProgramHelpers() {
        $scope.program.isCurrent = function (r, c) {
          return (r + 1 === $scope.currentFn && c === $scope.currentPos);
        };

        $scope.program.classAt = function (r, c) {

          var tile = $scope.program.at(r, c),
              classes = [];

          if (tile.isNoOp()) {
            classes = classes.concat(StyleMap.classes.steps[Op.NOP]);
          } else {
            classes = classes.concat(StyleMap.classes.colors[tile.color]);
          }

          if ($scope.program.isCurrent(r, c)) {
            classes = classes.concat(StyleMap.classes.steps.cursor);
          }

          return classes.join(' ');
        };

        $scope.program.iconAt = function (r, c) {
          var step = $scope.program.at(r, c);
          return StyleMap.icons.ops[step.op][0];
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

      function initContextMenus() {

        function setProgram(name, attr) {
          return function (c, r) {
            $scope.programCxtMenu = false;
            $scope.programBuilder[name](r, c, attr);
            $scope.program = $scope.programBuilder.build();
            initProgramHelpers();
            initStepper();
          };
        }

        function setWorld(name, attr, attr2) {
          return function (x, y) {
            $scope.worldCxtMenu = false;
            $scope.worldBuilder[name](x, y, attr, attr2);
            $scope.world = $scope.worldBuilder.build();
            initWorldHelpers();
            initStepper();
          };
        }

        function findElementWith(element) {
          var attrs = Array.prototype.slice.call(arguments, 1),
              hasAttribute = function (a) { return element.hasAttribute(a); };
          while (element) {
            if (_.all(attrs, hasAttribute)) {
              return element;
            }
            element = element.parentNode;
          }
          return null;
        }

        function toggleCxtMenu(scope, menu, offset, config) {
          return function (event) {
            var cell = findElementWith(event.target, 'pos-x', 'pos-y'),
                posX = cell.getAttribute('pos-x'),
                posY = cell.getAttribute('pos-y');
            if (!scope[menu]) {
              var box = event.target.getBBox(),
                  cx = box.x + box.width/2 + offset.x,
                  cy = box.y + box.height/2 + offset.y;
              scope[menu] = {'cx': cx, 'cy': cy, 'x': posX, 'y': posY, 'menus': config};
            } else {
              scope[menu] = false;
            }
          };
        }

        function worldCxtMenuBuilder() {
          var colorStyles = StyleMap.classes.colors,
              colorIcon = '',
              boardStyles = StyleMap.classes.board,
              boardIcons = StyleMap.icons.board,
              shipStyle = colorStyles[Color.CLEAR],
              starStyle = colorStyles[Color.CLEAR],
              headingIcons = StyleMap.icons.headings,
              cellColor = [[colorStyles[Color.CLEAR].join(''),colorIcon,setWorld('tile',Color.CLEAR)],
                           [colorStyles[Color.RED].join(''),colorIcon,setWorld('tile',Color.RED)],
                           [colorStyles[Color.BLUE].join(''),colorIcon,setWorld('tile',Color.BLUE)],
                           [colorStyles[Color.GREEN].join(''),colorIcon,setWorld('tile',Color.GREEN)]
                          ],
              cellHeading = [[shipStyle.join(''),headingIcons[Heading.UP][0],setWorld('ship',false,Heading.UP)],
                             [shipStyle.join(''),headingIcons[Heading.DOWN][0],setWorld('ship',false,Heading.DOWN)],
                             [shipStyle.join(''),headingIcons[Heading.LEFT][0],setWorld('ship',false,Heading.LEFT)],
                             [shipStyle.join(''),headingIcons[Heading.RIGHT][0],setWorld('ship',false,Heading.RIGHT)]
                            ],
              cellTile = [[boardStyles[Material.VOID].join(''),'',setWorld('unsetTile')],
                          [starStyle.join(''),boardIcons[Material.STAR][0],setWorld('star')]
                         ],
              config = [[],cellColor,cellHeading,cellTile,[],[],[],[],[],[]];
          return config;
        }

        function programCxtMenuBuilder() {
          var colorStyles = StyleMap.classes.colors,
              colorIcon = '',
              opStyle = colorStyles[Color.CLEAR],
              opIcons = StyleMap.icons.ops,
              noOpStyle = StyleMap.classes.steps[Op.NOP],
              cellColor = [[colorStyles[Color.CLEAR].join(''),colorIcon,setProgram('color',Color.CLEAR)],
                           [colorStyles[Color.RED].join(''),colorIcon,setProgram('color',Color.RED)],
                           [colorStyles[Color.BLUE].join(''),colorIcon,setProgram('color',Color.BLUE)],
                           [colorStyles[Color.GREEN].join(''),colorIcon,setProgram('color',Color.GREEN)]
                          ],
              cellFn = [[opStyle.join(''),opIcons[Op.F1][0],setProgram('op',Op.F1)],
                        [opStyle.join(''),opIcons[Op.F2][0],setProgram('op',Op.F2)],
                        [opStyle.join(''),opIcons[Op.F3][0],setProgram('op',Op.F3)],
                        [opStyle.join(''),opIcons[Op.F4][0],setProgram('op',Op.F4)],
                        [opStyle.join(''),opIcons[Op.F5][0],setProgram('op',Op.F5)]
                       ],
              cellOp = [[noOpStyle.join(''),opIcons[Op.NOP][0],setProgram('op',Op.NOP)],
                        [opStyle.join(''),opIcons[Op.FWD][0],setProgram('op',Op.FWD)],
                        [opStyle.join(''),opIcons[Op.L90][0],setProgram('op',Op.L90)],
                        [opStyle.join(''),opIcons[Op.R90][0],setProgram('op',Op.R90)]
                       ],
              config = [[],cellColor, cellFn, cellOp,[],[],[],[],[],[]];

          return config;
        }

        var worldCxtMenuConfig = worldCxtMenuBuilder(),
            programCxtMenuConfig = programCxtMenuBuilder();

        $scope.worldCxtMenu = false;
        $scope.toggleWorldCxtMenu = toggleCxtMenu($scope, 'worldCxtMenu',
                                                  $scope.view.world.offset,
                                                  worldCxtMenuConfig);

        $scope.programCxtMenu = false;
        $scope.toggleProgramCxtMenu = toggleCxtMenu($scope, 'programCxtMenu',
                                                    $scope.view.program.offset,
                                                    programCxtMenuConfig);

      }

      init();
      initWorld();
      initWorldHelpers();
      initProgram();
      initProgramHelpers();
      initStepper();
      initContextMenus();

    }
  ]);
