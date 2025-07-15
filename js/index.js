/**
 * DATASETS:
 * q0 = "Distancia percorrida".
 * q1 = "Media do veiculo em km/l".
 * litros = "Litros necessários".
 * q2 = "Postos de combust. encontrados".
 * q3 = "Valores respectivos".
 * diario = "Consumo diario".
 */
const respostas = {};
const main = document.getElementsByTagName("main")[0];
const template = document.getElementById("templateModal");

// Clone do template de modal basico
let clone = template.content.cloneNode(true);

/**
 * Função geradora de modais.
 * @param {string} title - Pergunta do formulário.
 * @param {string} placeholder - Placeholder do input
 * @param {string} inputReference - Referencia a pergunta com um parâmetro `data`
 * @param {boolean} multiVal - `false` para não ativar segundo `button` e `true` para ativá-lo.
 * @returns `dialog`
 */
function generateModal(title, placeholder, inputReference, multiVal = false) {
  if (clone === undefined || clone === null) {
    console.log("Template indefinido");
    return;
  }
  main.appendChild(clone);

  const dialog = document.querySelector("dialog");
  const form = document.querySelector("form");
  const legend = document.querySelector("legend");
  const input = document.querySelector("input");
  const buttons = document.querySelectorAll("button"); // Botao [0] = multiVal

  legend.innerText =
    typeof title === "string" && title.length > 0 ? title.trim() : "-";
  input.placeholder =
    typeof placeholder === "string" && placeholder.length > 0
      ? placeholder.trim()
      : "...";

  input.dataset.id = inputReference;

  // Para perguntas sequenciais, múltiplas respostas para uma pergunta.
  if (multiVal) buttons[0].disabled = false;

  // Ação de Validação
  buttons[1].addEventListener("click", (e) => {
    e.preventDefault();
    if (validacao(dialog, title, inputReference)) {
      console.log("Validacao de " + inputReference + " conluida");
      console.log("Removendo pop-up.");
      removeAllDialogs(inputReference);
      switch (inputReference) {
        case "q0":
          run(1);
          break;
        case "q1":
          run(2);
          respostas.q3 = [];
          break;
        case "q2":
          run(3);
          if ("q2" in respostas && respostas.q2 > 0) {
            console.log(buttons[1]);
            buttons[1].disabled = true;
            buttons[0].disabled = false;
            buttons[0].addEventListener("click", (e) => {
              const valid = validacao(dialog, title, "q3");
              if (valid === "fim") {
                removeAllDialogs("q3");
                printData(respostas);
              }
            });
          }
          break;
        case "q3":
          printData(respostas);
          break;
        default:
          run(0);
          break;
      }
    }
  });

  return dialog;
}

function run(index) {
  let q = [
    {
      title: "Qual a distancia percorrida de sua casa ao seu trabalho?",
      placeholder: "KM",
      inputReference: "q0",
    },
    {
      title: "Qual o consumo médio do seu veículo? (em KM/L)",
      placeholder: "KM/L",
      inputReference: "q1",
    },
    {
      title: "Quantos postos você pesquisou o preço do combustível?",
      placeholder: "Postos",
      inputReference: "q2",
    },
    {
      title: "Respectivamente, indique os valores do combustível: (R$)",
      placeholder: "R$",
      inputReference: "q3",
    },
  ];

  let modalinfo = q[index];
  let modal = generateModal(
    modalinfo.title,
    modalinfo.placeholder,
    modalinfo.inputReference,
  );
  modal.showModal();
}

/**
 * Remove os dialogs remanescentes
 * @param {string} ref
 * Referenciar o element correto para exclusao
 */
function removeAllDialogs(ref = "q0") {
  const dialog = document.querySelectorAll("dialog");
  for (let d of dialog) {
    const inputref = d.querySelector("input");
    if (inputref.dataset.id == ref) d.close();
  }
}

function validacao(dialog, pergunta, inputRef) {
  const form = dialog.querySelector("form");
  const input = dialog.querySelector("input");
  const submitBtn = dialog.querySelectorAll("button")[1];
  if (input.dataset.id !== inputRef) {
    console.warn("Referencia incoerente. Recriando...");
    return;
  } else {
    console.log("Referencia igual");
  }

  console.log("Valor do input: " + input.value);
  /**
   * Verifica se o valor é um `NaN` ou está vazia.
   * Recomendado utilizar após a confirmação de formatação de números flutuantes.
   * @param {string} value
   * @returns
   */
  const validInput = (value) => {
    const pattern = /[\d,\.]+$/;
    if (isNaN(value) || !pattern.test(value)) {
      alert("Valor inválido.");
      return false;
    }

    if (value.length === 0) {
      alert("Preencha o campo");
      return false;
    }

    if (Number(value) && value < 0) {
      alert("Valores negativos proibidos.");
      return false;
    }
    return true;
  };

  /**
   * Transformar valores numericos em string, para valores numericos reais.
   * @param {string} value
   * Valor do input
   * @returns novoValor
   */
  const floatTransform = (value) => {
    let novoValor = 0;
    if (value.search(",") >= 0) {
      novoValor = value.replace(".", "");
      novoValor = novoValor.replace(",", ".");
      if (Number(novoValor))
        novoValor = parseFloat(Number.parseFloat(novoValor).toFixed(2));
    } else {
      novoValor = parseFloat(Number.parseFloat(value).toFixed(2));
    }
    return novoValor;
  };

  const moedaTransform = (value) => {
    if (typeof value !== "number") return 0;

    return value.toLocaleString("pt-br", {
      style: "currency",
      currency: "BRL",
    });
  };

  let novoValor;
  novoValor = floatTransform(input.value);
  if (!validInput(novoValor) || novoValor <= 0) {
    input.value = "";
    alert("Insira um valor válido: maior que 0");
    return;
  }
  input.focus();

  if (inputRef !== "q3") respostas[inputRef] = novoValor;
  if ("q0" in respostas && "q1" in respostas && !("litros" in respostas)) {
    console.log("Q0 e Q1 existem");
    // Calculando litros consumidos nessa distancia
    const consumoVeiculo = respostas.q1;
    const distanciaPercorrida = respostas.q0;
    respostas.litros = parseFloat(
      (distanciaPercorrida / consumoVeiculo).toFixed(2),
    );
    console.warn(`Litros consumidos: ${respostas.litros}`);
  }

  // Se a quantidade de postos foi informada, vamos inserir um loop para os valores de combustiveis
  if ("q2" in respostas && "litros" in respostas) {
    if (novoValor > 10 && inputRef === "q2") {
      alert("Limite máximo: 10");
      return;
    } else if (novoValor % 1 !== 0) {
      alert("Error! Valores decimais para postos.")
      return
    }
    console.log("Esperando respostas: Valores de postos");
  }

  if (inputRef === "q3" && respostas.q3.length < respostas.q2) {
    respostas.q3.push(novoValor);
    console.log("Valores de postos: ");
    console.log(respostas.q3);
    if (respostas.q3.length === respostas.q2) {
      alert("FINALIZANDO CONTAGEM: " + respostas.q2 + " postos");
      let somaValores = 0;
      for (let val of respostas.q3) {
        console.log(val);
        somaValores += val;
      }

      respostas.valoresMedia = somaValores / respostas.q2;
      respostas.menorValor = respostas.q3.sort((num1, num2) => num1 - num2);
      respostas.menorValor = respostas.menorValor[0];

      respostas.diarioConsumo = moedaTransform(
        2 * (respostas.litros * respostas.menorValor),
      );

      respostas.valoresMedia = moedaTransform(respostas.valoresMedia);
      respostas.menorValor = moedaTransform(respostas.menorValor);

      console.log(`Valor médio de valores: ${respostas.valoresMedia}`);
      console.log(`Menor valor de combustível: ${respostas.menorValor}`);
      console.log(
        `O valor em R$ gasto diariamente é: ${respostas.diarioConsumo}`,
      );
      return "fim";
    }
  } else {
    input.value = "";
    console.log({ respostas });
    return true;
  }

  input.value = "";
  console.log({ respostas });
  return true;
}

/**
 * @param {object} dados
 * Respostas armazenadas
 */
function printData(dados) {
  const container = document.querySelector(".container");
  console.log(container);
  if (container === null || container === undefined) return;

  const divTerminal = document.createElement("div"); // Caixa principal do terminal
  const divLabel = document.createElement("div"); // Div que guarda usuariuo e icone
  const divText = document.createElement("div");
  const icon = document.createElement("span"); // Icone
  const label = document.createElement("p"); // Marcacao de usuario

  divTerminal.classList.add("line-terminal");
  divLabel.classList.add("line-label");
  divText.classList.add("line-code");
  icon.classList.add("line-icon");

  label.innerText = "Ford@root";
  icon.innerText = ">";

  divLabel.appendChild(label);
  divLabel.appendChild(icon);
  divTerminal.appendChild(divLabel);

  const respostasNecessarias = [
    { titulo: "Distância percorrida: ", valor: respostas.q0 + " km" },
    { titulo: "Consumo do Veiculo: ", valor: respostas.q1 + " km" },
    { titulo: "Combustivel consumido: ", valor: respostas.litros + " litros" },
    { titulo: "Postos pesquisados: ", valor: respostas.q2 + " postos" },
    { titulo: "Menor valor: ", valor: respostas.menorValor },
    { titulo: "Gasto diario: ", valor: respostas.diarioConsumo },
  ];

  let text;
  for (let i of respostasNecessarias) {
    console.log(i.valor);
    text = document.createElement("p");
    text.innerHTML = `${i.titulo} <strong>${i.valor}</strong>`;
    divText.appendChild(text);
  }

  divTerminal.appendChild(divText);

  container.appendChild(divTerminal);

  return;
}

run(0);
