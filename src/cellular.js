(function(exportName) {
/*

   【0,0】【0,1】【0,2】【0,3】【0,4】
【1,0】【1,1】【1,2】【1,3】【1,4】
   【2,0】【2,1】【2,2】【2,3】【2,4】
【3,0】【3,1】【3,2】【3,3】【3,4】
   【4,0】【4,1】【4,2】【4,3】【4,4】
【5,0】【5,1】【5,2】【5,3】【5,4】

*/
  var exports = exports || {};

  var edges = 6;

  /**
   * 格式化函数
   *
   * @param {string} template 模板
   * @param {Object} json 数据项
   */
  function format(template, json) {
    return template.replace(/#\{(.*?)\}/g, function(all, key) {
      return json && (key in json) ? json[key] : "";
    });
  }

  /**
   * 随机打乱数组
   *
   * @param {Array} arr 数组
   * @return 返回该数组
   */
  function shuffle(arr) {
    for (var i = 0; i < arr.length; i++) {
      var j = parseInt(Math.random() * (arr.length - i));
      var t = arr[j];
      arr[j] = arr[arr.length - i - 1];
      arr[arr.length - i - 1] = t;
    }
    return arr;
  }

  function q2c(p1, a, p2) {
    var _13 = 1 / 3;
    var _23 = 2 / 3;
    return [
      [
        _13 * p1[0] + _23 * a[0],
        _13 * p1[1] + _23 * a[1]
      ],
      [
        _13 * p2[0] + _23 * a[0],
        _13 * p2[1] + _23 * a[1]
      ]
    ];
  }

  /**
   * 创建六角形
   *
   * @param {Object} options
   * @param {Array} options.center 中心坐标
   * @param {number} options.angle 角度，单位 1/6 圆
   * @param {number} options.radius 半径
   * @return {Object} 返回六角形实例
   */
  function createHexagon(options) {
    var instance = {};
    options = options || {};
    options.container = options.container || document.body;
    var pathHexagon = jpaths.create({
      parent: 'canvas',
      strokeWidth: 2
    });

    var center = options.center || [150, 150];
    var angle = options.angle || 0;
    var radius = options.radius || 70;

    // 正六边形
    var hexagon = jmaths.regularPolygon(edges, center[0], center[1], radius,
      60 / 360 * Math.PI);
    pathHexagon.attr('path', format('M #{0} L #{1},#{2},#{3},#{4},#{5} Z', hexagon));

    var joints = [];
    var indexs = [];
    for (var i = 0; i < hexagon.length; i++) {
      indexs.push(i, edges + i);
      var j = (i + 1) % hexagon.length;
      joints.push(jmaths.bezier([hexagon[i], hexagon[j]], 1 / 3));
      joints.push(jmaths.bezier([hexagon[i], hexagon[j]], 2 / 3));
    }

    shuffle(indexs);
    // console.log(indexs);

    var pathJoints = jpaths.create({
      parent: 'canvas',
      stroke: 'red',
      strokeWidth: 2
    });

    function render() {
      var p = '';
      for (var i = 0; i < indexs.length; i += 2) {
        var a = joints[(indexs[i] + angle * 2) % joints.length];
        var b = joints[(indexs[i + 1] + angle * 2) % joints.length];
        var c = q2c(a, center, b);
        p += format('M #{0} C #{1} #{2} #{3}', [a, c[0], c[1], b]);
      }
      // console.log(p);
      pathJoints.attr('path', p);
      // console.log(JSON.stringify(joints, null, '  '));      
    }

    render();

    function rotateTo(value) {
      if (value === angle) {
        return;
      }
      angle = value % edges;
      if (angle < 0) {
        angle = value + edges;
      }
      render();
    }
    instance.rotateTo = rotateTo;

    function rotateBy(value) {
      if (value === 0) {
        return;
      }
      rotateTo(angle + value);
    }
    instance.rotateBy = rotateBy;

    function getAngle() {
      return angle;
    }
    instance.getAngle = getAngle;

    var freed;
    instance.free = function() {
      if (freed) {
        return;
      }
      freed = true;
      pathJoints.free();
    };

    return instance;
  }

  exports.createHexagon = createHexagon;

  if (typeof define === 'function') {
    if (define.amd || define.cmd) {
      define(function() {
        return exports;
      });
    }
  } else if (typeof module !== 'undefined' && module.exports) {
    module.exports = exports;
  } else {
    window[exportName] = exports;
  }

})('cellular');

/**
var hexagon = createHexagon(options)
hexagon.rotate(1);

var game = createGame(options);

game.replay();
game.kata();

 */