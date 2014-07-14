'use strict';

angular.module('robozzleApp')

  .value('ViewConfigs', {

    port: {
      width: 600,
      height: 580
    },

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
        y: 425
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

  })

  .controller('DemoCtrl', ['$scope', '$interval', function ($scope, $interval) {

    $scope.abs = Math.abs;
    $scope.neg = function (x) { return x && x<0; };
    $scope.fadeout = function (secs) {
      var stopUpdate;
      function updateOpacity() {
        $scope.o -= 0.05;
        if ($scope.o < 0.01) { $scope.o = 0; }
      }
      stopUpdate = $interval(updateOpacity, 25.0*secs, 20);
    };

  }])

  .controller('MainCtrl', [
    '$scope', '$interval', 'PuzzleResource', 'ViewConfigs', 'Puzzle', 'Stepper', 'WorldEditor', 'ProgramEditor', 'StyleMap', 'Heading', 'Material', 'Color', 'Op',
    function ($scope, $interval, PuzzleResource, ViewConfigs, Puzzle, Stepper, WorldEditor, ProgramEditor, StyleMap, Heading, Material, Color, Op) {

      function runQuery() {
        PuzzleResource.query({}, function (res) { $scope.puzzles = res; });
      }    

      runQuery();

      $scope.view = ViewConfigs;
      $scope.range = _.range;
      $scope.reset = false;
      $scope.valid = false;
      $scope.play = false;

      $scope.puzzleConf = {
        edit: false,
        width: 9,
        height: 9,
        steps: [10, 10, 10, 10, 10]
      };

      $scope.load = function (id) {
        PuzzleResource.get({id: id}, function (res) {
          var we = WorldEditor.fromJson(res.we),
              pe = ProgramEditor.fromJson(res.pe);
          initWorldBuilder(we);
          initProgramBuilder(pe);
          rebuildState();
        });
      };

      $scope.save = function () {
        var json = $scope.puzzle.toJson();
        PuzzleResource.save(json, function () {
          runQuery();
        });
      };

      function rebuildState() {

        initPuzzle();
        initWorldHelpers();
        initProgramHelpers();

      }

      function initWorldBuilder(builder) {

        if (!builder) {
          builder = new WorldEditor($scope.puzzleConf.width, $scope.puzzleConf.height)
            .ship($scope.puzzleConf.width/2, $scope.puzzleConf.height/2)
            .heading(Heading.UP);
        }

        $scope.worldBuilder = builder;
        $scope.view.world.offset.x = ($scope.view.port.width - ($scope.view.world.tile.width + $scope.view.world.tile.verticalPad * 2) * builder.maxX) / 2;
        $scope.view.program.offset.y = 25 + ($scope.view.world.tile.height + $scope.view.world.tile.verticalPad * 2) * builder.maxY;

      }

      function initProgramBuilder(builder) {

        if (!builder) {
          builder = new ProgramEditor()
            .fns($scope.puzzleConf.steps.length);
          for (var i=0; i<$scope.puzzleConf.steps.length; i++) {
            builder.steps(i, $scope.puzzleConf.steps[i]);
          }
        }

        $scope.programBuilder = builder;
        // todo(clt): fix Math.max.apply(null, $scope.puzzleConf.steps) expression
        $scope.view.program.offset.x = ($scope.view.port.width - ($scope.view.program.tile.width + $scope.view.program.tile.verticalPad * 2) * Math.max.apply(null, $scope.puzzleConf.steps)) / 2;

      }

      function initPuzzle() {

        $scope.puzzle = new Puzzle($scope.worldBuilder, $scope.programBuilder);
        $scope.world = $scope.puzzle.worldEditor.build();
        $scope.program = $scope.puzzle.programEditor.build();
        $scope.stepper = new Stepper($scope.world, $scope.program);
        $scope.valid = $scope.puzzle.isValid();

        $scope.currentFn = undefined;
        $scope.currentPos = undefined;
        $scope.message = undefined;

      }

      function initWorldHelpers() {

        $scope.world.classAt = function (x, y) {

          var tile = this.at(x, y),
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

          var tile = this.at(x, y);

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

          var tile = this.at(r, c),
              classes = [];

          if (tile.isNoOp()) {
            classes = classes.concat(StyleMap.classes.steps[Op.NOP]);
          } else {
            classes = classes.concat(StyleMap.classes.colors[tile.color]);
          }

          if (this.isCurrent(r, c)) {
            classes = classes.concat(StyleMap.classes.steps.cursor);
          }

          return classes.join(' ');
        };

        $scope.program.iconAt = function (r, c) {
          var step = this.at(r, c);
          return StyleMap.icons.ops[step.op][0];
        };

      }

      function initWatchers() {
        
        $scope.$watch(
          'puzzleConf.width',
          function __changeWorld() {
            initWorldBuilder();
            if ($scope.worldBuilder && $scope.programBuilder) {
              rebuildState();
            }
          });

        $scope.$watch(
          'puzzleConf.height',
          function __changeWorld() {
            initWorldBuilder();
            if ($scope.worldBuilder && $scope.programBuilder) {
              rebuildState();
            }
          });

        $scope.$watch(
          'puzzleConf.steps',
          function __changeProgram() {
            initProgramBuilder();
            if ($scope.worldBuilder && $scope.programBuilder) {
              rebuildState();
            }
          }, true);

        function updateMessage(message, andDoThis) {
          message = message || '';
          return function (fn, pos, status) {
            $scope.currentFn = fn;
            $scope.currentPos = pos;
            $scope.message = message;
            console.log(status, fn, pos);
            if (andDoThis) {
              andDoThis();
            }
          };
        }

        $scope.onSafeStep = updateMessage();
        $scope.onBadStep = updateMessage('Oops!');
        $scope.onComplete = updateMessage('Well done!');

        function playOn(fn, pos, status) {
          function resetPlay() {
            $scope.play = false;
          }
          $scope.currentFn = fn;
          $scope.currentPos = pos;
          $interval(function () {
            if ($scope.play) {
              $scope.stepper.step(
                1, playOn,
                updateMessage('Oops!', resetPlay),
                updateMessage('Well done!', resetPlay));
            }
          }, 500, 1);
          console.log(status, fn, pos);
        }

        $scope.onSafeStepPlayOn = playOn;
        $scope.resetStepper = rebuildState;

      }

      function initContextMenus() {

        function setProgram(name, attr) {
          return function (c, r) {
            $scope.programCxtMenu = false;
            $scope.programBuilder[name](r, c, attr);
            rebuildState();
          };
        }

        function setWorld(name, attr, attr2) {
          return function (x, y) {
            $scope.worldCxtMenu = false;
            $scope.worldBuilder[name](x, y, attr, attr2);
            rebuildState();
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
              config = {down: [[],cellColor,cellFn,cellOp,[],[],[],[],[],[]],
                        up: [[],[],[],[],[],[],cellOp,cellFn.reverse(),cellColor,[]]
                       };

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
                                                    programCxtMenuConfig.up);

      }

      initWatchers();
      initContextMenus();

    }
  ]);
