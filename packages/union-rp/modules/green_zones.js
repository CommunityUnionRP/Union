const greenZones = new Set();

mp.events.add("playerBrowserReady", (player) => {
	player.call("green_zone::load", [JSON.stringify([...greenZones])]);
});

mp.events.add("green_zone::add", (player, interior) => {
	if (interior === 0) {
		terminal.error("Нелья добавить зелёную зону на улице", player);
		return;
	}

	if (greenZones.has(interior)) {
		terminal.error("Такая зелёная зона уже существует", player);
		return;
	}

	DB.Handle.query("INSERT INTO green_zones (interior_id) VALUES(?)", [interior], (e) => {
		if (e) {
			console.log(`Ошибка добавления зелёной зоны. ${e}`);
			terminal.error("Зелёная зона не добавлена. Попробуйте позже", player);
			return;
		}

		terminal.info("Зелёная зона успешно добавлена", player);
		greenZones.add(interior);
		mp.players.call("green_zone::add", [interior]);
	});
});

mp.events.add("green_zone::remove", (player, interior) => {
	if (!greenZones.has(interior)) {
		terminal.error("Данная область не является зелёной зоной", player);
		return;
	}

	DB.Handle.query("DELETE FROM green_zones WHERE interior_id = ? LIMIT 1", [interior], (e) => {
		if (e) {
			console.log(`Ошибка удаления зелёной зоны. ${e}`);
			terminal.error("Зелёная зона не удалена. Попробуйте позже", player);
			return;
		}

		terminal.info("Зелёная зона успешно удалена", player);
		greenZones.delete(interior);
		mp.players.call("green_zone::remove", [interior]);
	});
});

module.exports = {
	Init: () => {
		return new Promise((resolve, reject) => {
			DB.Handle.query("SELECT * FROM green_zones", (e, result) => {
				if (e) {
					console.log(`Не удалось загрузить зелёные зоны. ${e}`);
					reject(e);
					return;
				}

				for (const greenZone of result) {				
					greenZones.add(greenZone.interior_id);
				}

				console.log(`Загружено ${result.length} зелёных зон`);
				resolve();
			});
		});
	}
};
