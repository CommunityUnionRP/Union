/*
	17.11.2018 created by Carter.

	События для обработки и показа/скрытия инфо-окон (навыки перса, хар-ки окно, др. информация).
*/

exports = (menu) => {
    mp.events.add("infoTable.setValues", (infoTableName, values) => {
        menu.execute(`infoTableAPI.setValues('${infoTableName}', '${JSON.stringify(values)}')`);
    });

    mp.events.add("infoTable.show", (infoTableName, params = null) => {
        //alert(`infoTable.show: ${infoTableName} ${params}`);
        menu.execute(`infoTableAPI.show('${infoTableName}', '${JSON.stringify(params)}')`);
    });

    mp.events.add("infoTable.hide", () => {
        menu.execute(`infoTableAPI.hide()`);
    });
}
