  module.exports = {
      "cutscene_start": {
          description: "Запустить катсцену.",
          minLevel: 6,
          syntax: "[id]:n",
          handler: (player, args) => {
              player.call(`startCutscene`, [args[0]]);
          }
      },
      "cutscene_stop": {
          description: "Остановить катсцену.",
          minLevel: 6,
          syntax: "",
          handler: (player, args) => {
              player.call(`finishMoveCam`);
          }
      },
      "cutscenes_list": {
          description: "Посмотреть список катсцен.",
          minLevel: 6,
          syntax: "",
          handler: (player, args) => {
              var text = "Список катсцен:<br/>";
              for (var i in mp.cutscenes) {
                  var c = mp.cutscenes[i];
                  text += `${i}) Имя: ${c.name}. Финальный текст: ${c.finalText}. Кадры: ${c.points.length} шт.<br/>`;
              }

              terminal.log(text, player);
          }
      },
      "set_cutscene_name": {
          description: "Изменить имя катсцены.",
          minLevel: 6,
          syntax: "[id]:n [name]:s",
          handler: (player, args) => {
              var c = mp.cutscenes[args[0]];
              if (!c) return terminal.error(`Катсцена с ID: ${args[0]} не найдена!`, player);
              args.splice(0, 1);
              c.setName(args.join(" "));
              terminal.info(`${player.name} изменил имя у катсцены с ID: ${c.id}`);
          }
      },
      "set_cutscene_finaltext": {
          description: "Изменить финальный текст катсцены.",
          minLevel: 6,
          syntax: "[id]:n [text]:s",
          handler: (player, args) => {
              var c = mp.cutscenes[args[0]];
              if (!c) return terminal.error(`Катсцена с ID: ${args[0]} не найдена!`, player);
              args.splice(0, 1);
              c.setFinalText(args.join(" "));
              terminal.info(`${player.name} изменил финальный текст у катсцены с ID: ${c.id}`);
          }
      },
      "cutscene_points": {
          description: "Посмотреть список кадров у катсцены.",
          minLevel: 6,
          syntax: "[id]:n",
          handler: (player, args) => {
              var c = mp.cutscenes[args[0]];
              if (!c) return terminal.error(`Катсцена с ID: ${args[0]} не найдена!`, player);

              var text = "Список кадров катсцены:<br/>";
              for (var i = 0; i < c.points.length; i++) {
                  var p = c.points[i];
                  text += `${i+1}) ${p.text}. Скорость: ${p.speed}. Позиция: ${JSON.stringify(p.startPosition)} -> ${JSON.stringify(p.endPosition)}. Поворот: ${JSON.stringify(p.startRotation)} -> ${JSON.stringify(p.endRotation)}.<br/>`;
              }

              terminal.log(text, player);
          }
      },
      "set_cutscene_point_text": {
          description: "Изменить текст кадра катсцены.",
          minLevel: 6,
          syntax: "[cutscene_id]:n [point_id]:n [text]:s",
          handler: (player, args) => {
              var c = mp.cutscenes[args[0]];
              if (!c) return terminal.error(`Катсцена с ID: ${args[0]} не найдена!`, player);
              var pId = args[1] - 1;
              var p = c.points[pId];
              if (!p) return terminal.error(`Кадр катсцены с ID: ${args[1]} не найден!`, player);
              args.splice(0, 2);
              c.setPointText(pId, args.join(" "));
              terminal.info(`${player.name} изменил текст у кадра катсцены с ID: ${pId}`);
          }
      },
      "set_cutscene_point_speed": {
          description: "Изменить скорость полета камеры у кадра катсцены.",
          minLevel: 6,
          syntax: "[cutscene_id]:n [point_id]:n [speed]:n",
          handler: (player, args) => {
              var c = mp.cutscenes[args[0]];
              if (!c) return terminal.error(`Катсцена с ID: ${args[0]} не найдена!`, player);
              var pId = args[1] - 1;
              var p = c.points[pId];
              if (!p) return terminal.error(`Кадр катсцены с ID: ${args[1]} не найден!`, player);
              c.setPointSpeed(pId, args[2]);
              terminal.info(`${player.name} изменил скорость полеты камеры у кадра катсцены с ID: ${pId}`);
          }
      },
      "set_cutscene_point_startpos": {
          description: "Изменить начальную позицию камеры у кадра катсцены.",
          minLevel: 6,
          syntax: "[cutscene_id]:n [point_id]:n [x]:n [y]:n [z]:n",
          handler: (player, args) => {
              var c = mp.cutscenes[args[0]];
              if (!c) return terminal.error(`Катсцена с ID: ${args[0]} не найдена!`, player);
              var pId = args[1] - 1;
              var p = c.points[pId];
              if (!p) return terminal.error(`Кадр катсцены с ID: ${args[1]} не найден!`, player);
              var pos = new mp.Vector3(args[2], args[3], args[4]);
              c.setPointStartPositon(pId, pos);
              terminal.info(`${player.name} изменил начальную позицию камеры у кадра катсцены с ID: ${pId}`);
          }
      },
      "set_cutscene_point_endpos": {
          description: "Изменить конечную позицию камеры у кадра катсцены.",
          minLevel: 6,
          syntax: "[cutscene_id]:n [point_id]:n [x]:n [y]:n [z]:n",
          handler: (player, args) => {
              var c = mp.cutscenes[args[0]];
              if (!c) return terminal.error(`Катсцена с ID: ${args[0]} не найдена!`, player);
              var pId = args[1] - 1;
              var p = c.points[pId];
              if (!p) return terminal.error(`Кадр катсцены с ID: ${args[1]} не найден!`, player);
              var pos = new mp.Vector3(args[2], args[3], args[4]);
              c.setPointEndPositon(pId, pos);
              terminal.info(`${player.name} изменил конечную позицию камеры у кадра катсцены с ID: ${pId}`);
          }
      },
      "set_cutscene_point_startrot": {
          description: "Изменить начальный поворот камеры у кадра катсцены.",
          minLevel: 6,
          syntax: "[cutscene_id]:n [point_id]:n [x]:n [y]:n [z]:n",
          handler: (player, args) => {
              var c = mp.cutscenes[args[0]];
              if (!c) return terminal.error(`Катсцена с ID: ${args[0]} не найдена!`, player);
              var pId = args[1] - 1;
              var p = c.points[pId];
              if (!p) return terminal.error(`Кадр катсцены с ID: ${args[1]} не найден!`, player);
              var pos = new mp.Vector3(args[2], args[3], args[4]);
              c.setPointStartRotation(pId, pos);
              terminal.info(`${player.name} изменил начальный поворот камеры у кадра катсцены с ID: ${pId}`);
          }
      },
      "set_cutscene_point_endrot": {
          description: "Изменить конечный поворот камеры у кадра катсцены.",
          minLevel: 6,
          syntax: "[cutscene_id]:n [point_id]:n [x]:n [y]:n [z]:n",
          handler: (player, args) => {
              var c = mp.cutscenes[args[0]];
              if (!c) return terminal.error(`Катсцена с ID: ${args[0]} не найдена!`, player);
              var pId = args[1] - 1;
              var p = c.points[pId];
              if (!p) return terminal.error(`Кадр катсцены с ID: ${args[1]} не найден!`, player);
              var pos = new mp.Vector3(args[2], args[3], args[4]);
              c.setPointEndRotation(pId, pos);
              terminal.info(`${player.name} изменил конечный поворот камеры у кадра катсцены с ID: ${pId}`);
          }
      },
      "cutscene_add_point": {
          description: "Добавить кадр в катсцену.",
          minLevel: 6,
          syntax: "[cutscene_id]:n [speed]:n [name]:s",
          handler: (player, args) => {
              var c = mp.cutscenes[args[0]];
              if (!c) return terminal.error(`Катсцена с ID: ${args[0]} не найдена!`, player);
              var speed = args[1];
              args.splice(0, 2);
              c.addPoint(speed, args.join(" "))
              terminal.info(`${player.name} добавил кадр к катсцене с ID: ${c.id}`);
          }
      },
      "cutscene_delete_point": {
          description: "Удалить кадр из катсцены.",
          minLevel: 6,
          syntax: "[cutscene_id]:n [point_id]:n",
          handler: (player, args) => {
              var c = mp.cutscenes[args[0]];
              if (!c) return terminal.error(`Катсцена с ID: ${args[0]} не найдена!`, player);
              c.deletePoint(args[1] - 1);
              terminal.info(`${player.name} удалил кадр у катсцены с ID: ${c.id}`);
          }
      },
  }
