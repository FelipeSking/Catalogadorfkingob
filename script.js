document.getElementById('catalogForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const inputText = document.getElementById('inputText').value;
    if (inputText) {
        processInputData(inputText);
        document.getElementById('inputText').value = '';
    }
});

document.getElementById('filter').addEventListener('change', function() {
    const inputText = document.getElementById('inputText').value;
    if (inputText) {
        processInputData(inputText);
    }
});

document.getElementById('percentageFilter').addEventListener('change', function() {
    const inputText = document.getElementById('inputText').value;
    if (inputText) {
        processInputData(inputText);
    }
});

function processInputData(inputText) {
    const catalog = document.getElementById('catalog');
    catalog.innerHTML = ''; // Limpa o conteúdo anterior

    const filterDays = parseInt(document.getElementById('filter').value);
    const percentageFilter = parseInt(document.getElementById('percentageFilter').value);
    const lines = inputText.split('\n'); // Divide o texto por linhas
    const timeData = {};

    // Converte as datas e organiza os dados por data
    const dataEntries = lines.map(line => {
        const items = line.split(/\s+/); // Divide a linha por espaços
        const dateParts = items[0].split('.');
        const date = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
        const time = items[1]; // Hora
        const value1 = parseFloat(items[2]);
        const value4 = parseFloat(items[5]);
        return { date, time, value1, value4 };
    }).sort((a, b) => b.date - a.date); // Ordena por data decrescente

    // Filtra os dados com base no filtro selecionado
    const filteredData = [];
    const uniqueDates = new Set();
    for (const entry of dataEntries) {
        if (uniqueDates.size < filterDays) {
            uniqueDates.add(entry.date.toDateString());
            filteredData.push(entry);
        } else if (uniqueDates.has(entry.date.toDateString())) {
            filteredData.push(entry);
        }
    }

    // Processa os dados filtrados
    filteredData.forEach(entry => {
        const { time, value1, value4 } = entry;
        if (!timeData[time]) {
            timeData[time] = { green: 0, red: 0 };
        }
        if (value1 > value4) {
            timeData[time].red += 1;
        } else {
            timeData[time].green += 1;
        }
    });

    // Cria a tabela de resultados
    const resultTable = document.createElement('table');
    const headerRow = document.createElement('tr');
    const headers = ['Hora', 'Hora Ajustada', 'Condição', 'Velas Verdes', 'Velas Vermelhas', 'Resultado', 'Porcentagem'];
    headers.forEach(headerText => {
        const header = document.createElement('th');
        header.textContent = headerText;
        headerRow.appendChild(header);
    });
    resultTable.appendChild(headerRow);

    // Adiciona os dados à tabela de resultados
    const sortedTimes = Object.keys(timeData).sort();
    sortedTimes.forEach(time => {
        const dataRow = document.createElement('tr');
        const timeCell = document.createElement('td');
        timeCell.textContent = time;
        dataRow.appendChild(timeCell);

        // Calcula a hora ajustada
        const [hours, minutes] = time.split(':').map(Number);
        let adjustedHours = hours - 5;
        if (adjustedHours < 0) {
            adjustedHours += 24;
        }
        const adjustedTime = `${String(adjustedHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
        const adjustedTimeCell = document.createElement('td');
        adjustedTimeCell.textContent = adjustedTime;
        dataRow.appendChild(adjustedTimeCell);

        const conditionCell = document.createElement('td');
        if (timeData[time].green > timeData[time].red) {
            conditionCell.textContent = 'Compra';
        } else {
            conditionCell.textContent = 'Venda';
        }
        dataRow.appendChild(conditionCell);

        const greenCell = document.createElement('td');
        greenCell.textContent = timeData[time].green;
        dataRow.appendChild(greenCell);

        const redCell = document.createElement('td');
        redCell.textContent = timeData[time].red;
        dataRow.appendChild(redCell);

        const resultCell = document.createElement('td');
        const total = timeData[time].green + timeData[time].red;
        let percentage;
        if (timeData[time].green > timeData[time].red) {
            resultCell.className = 'green-cell';
            resultCell.textContent = 'Verde';
            percentage = ((timeData[time].green / total) * 100).toFixed(2);
        } else {
            resultCell.className = 'red-cell';
            resultCell.textContent = 'Vermelha';
            percentage = ((timeData[time].red / total) * 100).toFixed(2);
        }

        // Aplica o filtro de porcentagem
        if (percentageFilter === 0 || percentage >= percentageFilter) {
            dataRow.appendChild(resultCell);

            const percentageCell = document.createElement('td');
            percentageCell.textContent = `${percentage}%`;
            dataRow.appendChild(percentageCell);

            resultTable.appendChild(dataRow);
        }
    });

    catalog.appendChild(resultTable);
}
