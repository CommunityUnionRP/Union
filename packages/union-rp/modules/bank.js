const BankInfo = {
  minimal_summa: 1, // Минимальная сумма пополнения|снятия
  maximum_summa: 1000000, // Макисмальная сумма пополнения|снятия
  functions: {
    updateBalanceMoney(player, isAtm = false) {
			if (isAtm) {
				player.call("show.bank.menu", [player.bank, [], [], true]);
				return;
			}

			let houses = mp.houses.getArrayByOwner(player.sqlId);
			let id_houses = [], houses_balance = [];

			for (let i = 0; i < houses.length; i++) {
				let hprice = houses[i].getTax();

				id_houses.push("№" + houses[i].sqlId);
				houses_balance.push("$" + houses[i].balance + " из " + Math.round(hprice * 24 * 14));
			}

			player.call("show.bank.menu", [player.bank, houses_balance, id_houses]);
    },
    putBalanceMoney(player, money) {
      if (money < BankInfo.minimal_summa) {
        player.utils.warning("Минимальная сумма пополнения $" + BankInfo.minimal_summa);
        return;
      }

      if (money > BankInfo.maximum_summa) {
        player.utils.warning("Максимальная сумма пополнения $" + BankInfo.maximum_summa);
        return;
      }

      if (player.money < money) {
        player.utils.warning("У вас недостаточно денег!");
        return;
      }

      // let bmoney = player.bank + money;
      player.utils.setMoney(player.money - money);
      player.utils.setBankMoney(player.bank + money);
      player.utils.bank("Пополнение счёта", "На ваш счет зачисленно ~g~$" + money);
      player.call("modal.hide");
    },
    takeBalanceMoney(player, money) {
      if (money < BankInfo.minimal_summa) {
        player.utils.warning("Минимальная сумма вывода $" + BankInfo.minimal_summa);
        return;
      }

      if (money > BankInfo.maximum_summa) {
        player.utils.warning("Максимальная сумма вывода $" + BankInfo.maximum_summa);
        return;
      }

      if (player.bank < money) {
        player.utils.warning("На балансе недостаточно денег!");
        return;
      }

      player.utils.setMoney(player.money + money);
      player.utils.setBankMoney(player.bank - money);
      player.utils.bank("Вывод с счёта", "С вашего счёта снято ~r~$" + money);
      player.call("modal.hide");
    },
    giveBankMoneyHouse(player, money, house) {
      return player.utils.error("Налоги на дом выключены!");
      let houses = mp.houses.getArrayByOwner(player.sqlId);
      let id_houses = [], myhouse;
      for (let i = 0; i < houses.length; i++) id_houses.push(houses[i].sqlId);

      if (id_houses.includes(house)) {
        myhouse = houses[id_houses.indexOf(house)];
      } else {
        player.utils.warning("Вы не владеете домом №" + house);
        return;
      }

      if (money < BankInfo.minimal_summa) {
        player.utils.warning("Минимальная сумма пополнения $" + BankInfo.minimal_summa);
        return;
      }

      if (money > BankInfo.maximum_summa) {
        player.utils.warning("Максимальная сумма пополнения $" + BankInfo.maximum_summa);
        return;
      }

      if (player.bank < money) {
        player.utils.warning("На балансе недостаточно денег!");
        return;
      }

      let hprice = myhouse.getTax() * 24 * 14;
      let hbalance = parseInt(myhouse.balance, 10) + parseInt(money, 10);
      if (hbalance > hprice) {
        player.utils.warning("Вы не можете положить столько денег на счёт!");
        return;
      }

      myhouse.setBalance(hbalance);
      player.utils.setBankMoney(player.bank - parseInt(money, 10));
      player.utils.bank("Пополнение счёта", "На счет вашего дома ~g~№" + house + " ~w~зачисленно ~g~$" + money);
      player.call("modal.hide");
    },
    takeBankMoneyHouse(player, money, house) {
      return player.utils.error("Налоги на дом выключены!");
      let houses = mp.houses.getArrayByOwner(player.sqlId);
      let id_houses = [], myhouse;
      for (let i = 0; i < houses.length; i++) id_houses.push(houses[i].sqlId);

      if (id_houses.includes(house)) {
        myhouse = houses[id_houses.indexOf(house)];
      } else {
        player.utils.warning("Вы не владеете домом №" + house);
        return;
      }

      if (money < BankInfo.minimal_summa) {
        player.utils.warning("Минимальная сумма вывода $" + BankInfo.minimal_summa);
        return;
      }

      if (money > BankInfo.maximum_summa) {
        player.utils.warning("Максимальная сумма вывода $" + BankInfo.maximum_summa);
        return;
      }

      if (myhouse.balance < money) {
        player.utils.warning("На балансе дома недостаточно денег!");
        return;
      }

      let hbalance = parseInt(myhouse.balance, 10) - parseInt(money, 10);
      myhouse.setBalance(hbalance);
      player.utils.setBankMoney(player.bank + parseInt(money, 10));
      player.utils.bank("Пополнение счёта", "На ваш счет зачисленно ~g~$" + money);
      player.call("modal.hide");
    },
    transferBalanceMoney(player, name, money) {
      if (mp.convertMinutesToLevelRest(player.minutes).level < 2) return player.utils.error("Вы не достигли 2 уровня!");
      DB.Handle.query("SELECT * FROM characters WHERE name=?", [name], (e, result) => {
          if (e) {
            callback("Ошибка выполнения запроса в БД!");
            return terminal.error(e);
          }
          if (result.length < 1) {
            player.utils.warning("Игрока с таким именем не существует!");
            return;
          }

          let dbplayer = result[0];

          if (money < BankInfo.minimal_summa) {
            player.utils.warning("Минимальная сумма перевода $" + BankInfo.minimal_summa);
            return;
          }

          if (money > BankInfo.maximum_summa) {
            player.utils.warning("Максимальная сумма перевода $" + BankInfo.maximum_summa);
            return;
          }

          if (player.bank < money) {
            player.utils.warning("На балансе недостаточно денег!");
            return;
          }

          let target = mp.players.getBySqlId(dbplayer.id);
          if (target === undefined) {
            DB.Handle.query("UPDATE characters SET bank=bank+? WHERE id=?", [money, dbplayer.id], (e, result) => {
                if (e) {
                    callback("Ошибка выполнения запроса в БД!");
                    return terminal.error(e);
                  }
                });
          } else {
            target.utils.setBankMoney(target.bank + money);
            target.utils.bank("Пополнение счёта", "~g~" + player.name + " ~w~перечислил на ваш счёт ~g~$" + money);
          }

          player.utils.setBankMoney(player.bank - money);
          player.utils.bank("Перевод средств", "Вы перевели " + dbplayer.name + " ~g~$" + money);
          player.call("modal.hide");
          return;
      });
    }
  }
}

mp.events.add("show.bank.menu", (player, isAtm = false) => {
    try
    {
       BankInfo.functions.updateBalanceMoney(player, isAtm);
    }
    catch (err) {
        console.log(err);
        return;
    }
});
mp.events.add("take.bank.money", (player, money) => {
    try
    {
       BankInfo.functions.takeBalanceMoney(player, money);
    }
    catch (err) {
        console.log(err);
        return;
    }
});
mp.events.add("put.bank.money", (player, money) => {
    try
    {
       BankInfo.functions.putBalanceMoney(player, money);
    }
    catch (err) {
        console.log(err);
        return;
    }
});
mp.events.add("transfer.bank.money", (player, name, money) => {
    try
    {
       BankInfo.functions.transferBalanceMoney(player, name, money);
    }
    catch (err) {
        console.log(err);
        return;
    }
});
mp.events.add("give.bank.money.house", (player, money, house) => {
    try
    {
       BankInfo.functions.giveBankMoneyHouse(player, money, house);
    }
    catch (err) {
        console.log(err);
        return;
    }
});
mp.events.add("take.bank.money.house", (player, money, house) => {
    try
    {
       BankInfo.functions.takeBankMoneyHouse(player, money, house);
    }
    catch (err) {
        console.log(err);
        return;
    }
});
