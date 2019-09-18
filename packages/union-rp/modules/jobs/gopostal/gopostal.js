mp.blips.new(616, new mp.Vector3(-258.56, -841.53, 31.42), { name: 'Почтовый курьер Go Postal', color: 4, scale: 0.7, shortRange: true});
const PostalJob = {
  salary_min: 10, // Минимальная сумма прибыли
  salary_max: 1000, // Макисмальная сумма прибыли
  order_min: 8, // Минимальное кол-во заказов
  order_max: 15, // Максимальное кол-во заказов
  postals: [],
  colshapes: {
    joinjob: mp.colshapes.newSphere(-258.56, -841.53, 31.42, 1.5),

    //storage: mp.colshapes.newSphere(573.03, 128.86, 99.47, 1.0)
  },
  functions: {
    defaultPostal(player) {
      player.utils.changeJob(0);
      // player.utils.setLocalVar("gopostalLeader", undefined);
      player.body.loadItems();
      player.call("setPostalJobStatus", [false]);
      player.call("remove.all.gopostal.data");
      player.utils.putObject();
    },
    leavePostalJob(player) {
      player.utils.success("Вы уволились из Go Postal!");
      PostalJob.functions.defaultPostal(player);
      PostalJob.functions.leaveVehicle(player);
      let team = getPostalTeam(player);
      if (team) {
        if (team.leader === player) {
          if (team.target) {
             team.target.error("Глава группы уволился, рабочий день закончился!");
             PostalJob.functions.defaultPostal(team.target);
          }
        }
        if (team.target === player) {
          if (team.leader) {
            // team.leader.utils.setLocalVar("gopostalLeader", undefined);
            team.leader.error("Ваш помощник уволился, рабочий день закончился!");
            PostalJob.functions.defaultPostal(team.leader);
          }
        }
        PostalJob.postals.splice(PostalJob.postals.indexOf(team), 1);
      }
    },
    joinPostalJob(player) {
      if (mp.convertMinutesToLevelRest(player.minutes).level < 3) return player.utils.error("Вы не достигли 3 уровня!");
      player.utils.success("Вы устроились курьером в Go Postal!");
      player.utils.changeJob(10);
      player.call("setPostalJobStatus", [true]);
      player.call("control.gopostal.blip", [1]);
      let job = new PostalOrder(player, undefined, undefined, 0, 0, 0, undefined);
      PostalJob.postals.push(job);
      // player.call("create.pizza.places", [ mp.houses[arr[0]].position, mp.houses[arr[1]].position, mp.houses[arr[2]].position ]);
      /*player.body.clearItems();
      if (player.sex === 1) {
        // Одежда мужская
        player.setClothes(3, 61, 0, 2);
        player.setClothes(4, 36, 0, 2);
        player.setClothes(6, 12, 0, 2);
        player.setClothes(8, 59, 1, 2);
        player.setClothes(11, 57, 0, 2);
      } else {
        // Одежда женская
        player.setClothes(3, 62, 0, 2);
        player.setClothes(4, 35, 0, 2);
        player.setClothes(6, 26, 0, 2);
        player.setClothes(8, 36, 1, 2);
        player.setClothes(11, 50, 0, 2);
      }*/
    },
    leaveVehicle(player) {
      let team = getPostalTeam(player);
      if (team) {
        team.orders = 0;
        if (team.vehicle) {
          let vehicle = team.vehicle;
          if (player.vehicle === vehicle) player.removeFromVehicle();
          removeAllHumansFromVehicle(vehicle);
          setTimeout(() => {
            try {
              vehicle.repair();
              vehicle.dimension = 0;
              vehicle.position = vehicle.spawnPos;
              vehicle.rotation = new mp.Vector3(0, 0, vehicle.spawnPos.h);
              vehicle.utils.setFuel(vehicle.vehPropData.maxFuel);
              vehicle.engine = false;
              //console.log("INFORMATION GOPOSTAL: " + vehicle.dimension + " | " + vehicle.spawnPos + " | " + vehicle.vehPropData.fuel + " | " + vehicle.engine + " | " + vehicle.spawnPos.h);
            } catch (err) {
                console.log(err);
                return;
            }
          }, 200);
        }
      }
    },
    invitePlayer(player, recId) {
      var rec = mp.players.at(recId);
      if (!rec) return player.utils.error(`Гражданин не найден!`);
      if (rec === player) return player.utils.error(`Вы не можете пригласить себя!`);
      var dist = player.dist(rec.position);
      if (dist > Config.maxInteractionDist) return player.utils.error(`Гражданин далеко!`);
      if (player.job !== 10) return player.utils.error(`Вы не работаете почтальном в Go Postal!`);
      if (rec.job !== 10) return player.utils.error(`Игрок не работает почтальном в Go Postal!`);
      let team = getPostalTeam(player);
      if (team === undefined) return player.utils.error(`Вы не можете пригласить игрока в группу!`);
      if (team.target) return player.utils.error(`У вас уже есть 1 участник в группе!`);
      if (team.orders > 0) return player.utils.error(`Вы не можете создать группу, не закончив заказ!`);
      if (!team.vehicle) return player.utils.error(`У главы группы нет фургона!`);

      rec.inviteOffer = {
          leaderId: player.id
      };

      player.utils.info(`Вы пригласили ${rec.name} в группу`);
      rec.utils.info(`Получено приглашение в группу`);
      rec.call("choiceMenu.show", ["acccept_gopostal_team", {
          name: player.name
      }]);
    },
    uninvitePlayer(player, recId) {
      var rec = mp.players.at(recId);
      if (!rec) return player.utils.error(`Гражданин не найден!`);
      if (rec === player) return player.utils.error(`Вы не можете уволить себя!`);
      var dist = player.dist(rec.position);
      if (dist > Config.maxInteractionDist) return player.utils.error(`Гражданин далеко!`);
      if (player.job !== 10) return player.utils.error(`Вы не работаете почтальном в Go Postal!`);
      let team = getPostalTeam(player);
      if (team === undefined) return player.utils.error(`Вы не можете уволить игрока из группы!`);
      if (team.target !== rec) return player.utils.error(`У вас нет участников в группе!`);
      if (team.orders > 0) return player.utils.error(`Вы не можете уволить участника, не закончив заказ!`);
      player.utils.warning("Вы уволили " + rec.name + " из группы!");
      rec.utils.error(player.name + " уволил вас из группы!");
      // player.utils.setLocalVar("gopostalLeader", 1);
      // rec.call("update.trash.vehicle", ["cancel", 0, 0]);
      // rec.call("createPlaceTrasher", [0, 0, 0, false]);
      delete team.target;
    },
    acceptInvite(player) {
      if (!player.inviteOffer) return player.utils.error(`Предложение не найдено!`);
      var rec = mp.players.at(player.inviteOffer.leaderId);
      if (!rec) return player.utils.error(`Отправитель не найден!`);
      var dist = player.dist(rec.position);
      if (dist > 5) return player.utils.error(`Отправитель слишком далеко!`);
      if (player.job !== 10) return player.utils.error(`Вы не работаете почтальном в Go Postal!`);
      if (rec.job !== 10) return player.utils.error(`Отправить не работает почтальном в Go Postal!`);
      let team = getPostalTeam(rec);
      if (!team) return player.utils.error(`Отправитель больше не является главой группы!`);
      let ourteam = getPostalTeam(player);
      if (ourteam) return player.utils.error(`Вы не можете вступить в группы!`);
      if (team.target) return player.utils.error(`У отправителя уже полная группа!`);
      if (team.orders > 0) return player.utils.error(`Отправитель больше не может создать группу!`);
      if (!team.vehicle) return player.utils.error(`У главы группы нет фургона!`);
      delete player.inviteOffer;

      player.utils.success(`Вы вступили в группу!`);
      rec.utils.info(`${player.name} принял приглашение в группу!`);
      // rec.utils.setLocalVar("gopostalLeader", 2);
      team.target = player;
      player.call("control.gopostal.blip", [2]);
      player.call("set.gopostal.vehicle", [team.vehicle]);
    },
    unacceptInvite(player) {
      if (!player.inviteOffer) return;
      var rec = mp.players.at(player.inviteOffer.leaderId);
      if (rec) rec.utils.error(`${player.name} отказался вступить в группу!`);
    },
    takeBox(player) {

      if (player.getVariable("attachedObject") === "v_ind_cs_box02") {
        player.utils.error("Вы уже взяли коробку!");
        return;
      }

      player.utils.takeObject("v_ind_cs_box02");
      player.utils.error("Вы должны погрузить коробку в задний сектор фургона!");
      player.call("prompt.show", ["Для того, чтобы положить коробку нажмите <span>Е</span>"]);
    },
    putBox(player) {
      if (player.getVariable("attachedObject") !== "v_ind_cs_box02") return;
      player.utils.putObject();
      let team = getPostalTeam(player);
      if (!team) return;
      team.boxes++;
      player.utils.warning("Загружено коробок " + team.boxes + " из " + team.orders);
      if (team.boxes === team.orders) {
        player.utils.success("Фургон загружен, развезите почту по требуемым местам!");
        player.call("clear.storage.gopostal");
        let target;
        if (team.leader === player && team.target) target = team.target;
        else if (team.target === player && team.leader) target = team.leader;

        if (target) {
          target.utils.success("Фургон загружен, развезите почту по требуемым местам!");
          target.call("clear.storage.gopostal");
          target.utils.putObject();
        }
      }
    },
    startDay(player) {
      let team = getPostalTeam(player);
      if (team) {
        if (team.vehicle) {
          if (team.orders > 0) return player.utils.error("Сначала закончите предыдущий заказ!");
          player.utils.success("Вы начали погрузку!");
          let count = grn(PostalJob.order_min, PostalJob.order_max);
          let arr = getFreeHousePos(count);
          player.call("create.gopostal.day", [JSON.stringify(arr)]);
          player.call("control.gopostal.blip", [3]);
          team.orders = count;
          team.position = player.position;
          if (team.target) {
            team.target.utils.success("Загрузите фургон почтой!");
            team.target.call("create.gopostal.day", [JSON.stringify(arr)]);
            team.target.call("control.gopostal.blip", [3]);
            team.orders = count * 2;
          }
        } else {
          player.utils.error("У вас нет используемого транспорта Go Postal!");
        }
      } else {
        player.utils.error("Вы не работаете почтальном в Go Postal!");
      }
    }
  }
};

mp.events.add("give.gopostal.item", (player, i) => {
    try
    {
      if (player.job !== 10) return;

      let team = getPostalTeam(player);
      if (team) {
        if (team.orders > 0 && team.vehicle) {
            let money = Math.trunc(player.dist(team.position) * mp.economy["postal_salary"].value);

            if (team.target === player) money = Math.round(money / 100 * mp.economy["postal_salary_procent"].value);
            if (money < PostalJob.salary_min) money = PostalJob.salary_min;
            else if (money > PostalJob.salary_max) money = PostalJob.salary_max;

            team.boxes--;
            player.call("delete.gopostal.colshape", [i, team.boxes]);
            team.position = player.position;
            if (team.boxes === 0) {
              team.orders = 0;
              player.utils.success("Вы заработали $" + money);
              player.utils.setMoney(player.money + money);
              if (team.target) {
                team.target.utils.success("Вы заработали $" + money);
                team.target.utils.setMoney(player.money + money);
              }
              return;
            }

            player.utils.success("Отправляйтесь к следующему дому!");
        }
      }
    }
    catch (err) {
        console.log(err);
        return;
    }
});

class PostalOrder {
    constructor(owner, target, vehicle, orders, money, countbox, position) {
        this.owner = owner;
        this.target = target;
        this.vehicle = vehicle;
        this.orders = orders;
        this.money = money;
        this.boxes = countbox;
        this.position = position;
    }
}
function getPostalTeam(data) {
    try
    {
        for (let i = 0; i < PostalJob.postals.length; i++) {
            if (PostalJob.postals[i].owner === data || PostalJob.postals[i].target === data || PostalJob.postals[i].vehicle === data) {
                return PostalJob.postals[i];
            }
        }
        return undefined;
    } catch (err) {
        console.log(err);
        return undefined;
    }
}
mp.events.add("take.gopostal.object", (player) => {
    try
    {
      if (player.job === 10) PostalJob.functions.takeBox(player);
    }
    catch (err) {
        console.log(err);
        return;
    }
});
mp.events.add("put.gopostal.object", (player) => {
    try
    {
      if (player.job === 10) PostalJob.functions.putBox(player);
    }
    catch (err) {
        console.log(err);
        return;
    }
});
mp.events.add("leave.gopostal.job", (player) => {
    try
    {
      if (player.job === 10) PostalJob.functions.leavePostalJob(player);
    }
    catch (err) {
        console.log(err);
        return;
    }
});
mp.events.add("job.gopostal.agree", (player) => {
    try
    {
      if (player.job !== 0 && player.job !== 10) {
        player.utils.warning("Вы уже где-то работаете!");
        return;
      }

      if (player.job === 10)
        PostalJob.functions.leavePostalJob(player);
      else
        PostalJob.functions.joinPostalJob(player);
    }
    catch (err) {
        console.log(err);
        return;
    }
});
mp.events.add("playerDeath", function playerDeathHandler(player, reason, killer) {
   if (player.job === 10) PostalJob.functions.leavePostalJob(player);
});
mp.events.add("playerQuit", function playerQuitHandler(player, exitType, reason) {
  try
  {
      if (player.job === 10) PostalJob.functions.leavePostalJob(player);
  } catch (err) {
      console.log(err);
      return;
  }
});
mp.events.add("playerEnterColshape", function onPlayerEnterColShape(player, shape) {
    try
    {
        if (!player.vehicle) {
          if (shape === PostalJob.colshapes.joinjob) player.call("getPostalJobStatus", [player.job !== 10 ? false : true]);
        }
    } catch (err) {
        console.log(err);
        return;
    }
});
mp.events.add("playerExitColshape", function onPlayerExitColShape(player, shape) {
    try
    {
      if (shape === PostalJob.colshapes.joinjob) player.call("getPostalJobStatus", ["cancel"]);
    } catch (err) {
        console.log(err);
        return;
    }
});
mp.events.add("playerEnterVehicle", function playerEnterVehicleHandler(player, vehicle, seat) {
	if (vehicle.owner === -10 && player.job === 10 && seat === -1) {
    let vteam = getPostalTeam(vehicle);
    if (vteam !== undefined) {
      if (!mp.players.exists(vteam.owner)) delete vteam.vehicle;
      else if (getPostalTeam(player).vehicle != vteam.vehicle) delete vteam.vehicle;
      else if (vteam.owner === player) {
        player.call("time.remove.back.gopostal");
      } else {
        player.removeFromVehicle();
        player.utils.warning("Данное транспортное средство уже занято!");
      }
    } else {
      let team = getPostalTeam(player);
      if (team !== undefined) {
        if (team.vehicle !== undefined) {
          player.removeFromVehicle();
          player.utils.warning("Вы уже заняли одно транспортное средство!");
        } else {
         if (!haveLicense(player, vehicle)) return;
         team.vehicle = vehicle;
         vehicle.utils.setFuel(vehicle.vehPropData.maxFuel);
         player.call("control.gopostal.blip", [2]);
         player.call("set.gopostal.vehicle", [vehicle]);
         // player.utils.setLocalVar("gopostalLeader", 1);
       }
      }
    }
  }
});
mp.events.add("playerExitVehicle", function playerExitVehicleHandler(player, vehicle) {
  if (vehicle.owner === -10 && player.job === 10) {
    let team = getPostalTeam(player);
    if (team !== undefined) {
      if (team.vehicle === vehicle) {
        player.call("time.add.back.gopostal");
        player.utils.warning("У вас есть 3 минуты, чтобы вернуться в транспорт.");
      }
    }
  }
});
mp.events.add("begin.jobday.gopostal", (player) => {
    try
    {
       PostalJob.functions.acceptInvite(player);
    }
    catch (err) {
        console.log(err);
        return;
    }
});
mp.events.add("gopostal.team.startday", (player) => {
    try
    {
       PostalJob.functions.startDay(player);
    }
    catch (err) {
        console.log(err);
        return;
    }
});
mp.events.add("gopostal.team.cancel", (player) => {
    try
    {
       PostalJob.functions.unacceptInvite(player);
    }
    catch (err) {
        console.log(err);
        return;
    }
});
mp.events.add("gopostal.invite.player", (player, id) => {
    try
    {
       PostalJob.functions.invitePlayer(player, id);
    }
    catch (err) {
        console.log(err);
        return;
    }
});
mp.events.add("gopostal.uninvite.player", (player, id) => {
    try
    {
       PostalJob.functions.uninvitePlayer(player, id);
    }
    catch (err) {
        console.log(err);
        return;
    }
});

function getFreeHousePos(count) {
  try
  {
    let arr = [];
    for (let i = 0; i < count; i++) {
       let num = getRandomNumber(0, mp.houses.length - 1, arr);
       let house = {x: mp.houses[num].position.x, y: mp.houses[num].position.y, z: mp.houses[num].position.z};
       arr.push(house);
    }
    return arr;
  } catch (err){
      console.log(err);
      return undefined;
  }
}
function haveLicense(player, vehicle) {
    if (!vehicle.license) return true;
    var docs = player.inventory.getArrayByItemId(16);
    for (var sqlId in docs) {
        if (docs[sqlId].params.licenses.indexOf(vehicle.license) != -1) return true;
    }
    return false;
}
function getRandomNumber(min, max, arr) {
    try
    {
        let massive = 1, num = 0;
        for (let i = 0; i < massive; i++) {
          num = Math.floor(Math.random() * (max - min)) + min;
          if (arr.includes({x: mp.houses[num].position.x, y: mp.houses[num].position.y, z: mp.houses[num].position.z})) massive++;
        }
        return num;
    } catch (err) {
        console.log(err);
        return -1;
    }
}
function grn(min, max) {
    try
    {
        return Math.floor(Math.random() * (max - min)) + min;
    } catch (err){
        console.log(err);
        return -1;
    }
}

function removeAllHumansFromVehicle(vehicle) {
  try
  {
    let array = vehicle.getOccupants();
    for (let i = 0; i < array.length; i++) array[i].removeFromVehicle();
  }
  catch (err)
  {
      console.log(err);
      return;
  }
}
