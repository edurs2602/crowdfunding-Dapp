// ENDEREÇO EHTEREUM DO CONTRATO
var contractAddress = "0xAC11a76cadE844314C5765698E10E9772c1e9565";

// Inicializa o objeto DApp
document.addEventListener("DOMContentLoaded", onDocumentLoad);
function onDocumentLoad() {
  DApp.init();
}

// Nosso objeto DApp que irá armazenar a instância web3
const DApp = {
  web3: null,
  contracts: {},
  account: null,

  init: function () {
    return DApp.initWeb3();
  },

  // Inicializa o provedor web3
  initWeb3: async function () {
    if (typeof window.ethereum !== "undefined") {
      try {
        const accounts = await window.ethereum.request({ // Requisita primeiro acesso ao Metamask
          method: "eth_requestAccounts",
        });
        DApp.account = accounts[0];
        window.ethereum.on('accountsChanged', DApp.updateAccount); // Atualiza se o usuário trcar de conta no Metamaslk
      } catch (error) {
        console.error("Usuário negou acesso ao web3!");
        return;
      }
      DApp.web3 = new Web3(window.ethereum);
    } else {
      console.error("Instalar MetaMask!");
      return;
    }
    return DApp.initContract();
  },

  // Atualiza 'DApp.account' para a conta ativa no Metamask
  updateAccount: async function() {
    DApp.account = (await DApp.web3.eth.getAccounts())[0];
    atualizaInterface();
  },

  // Associa ao endereço do seu contrato
  initContract: async function () {
    DApp.contracts.Crowdfunding = new DApp.web3.eth.Contract(abi, contractAddress);
    return DApp.render();
  },

  // Inicializa a interface HTML com os dados obtidos
  render: async function () {
    inicializaInterface();
  },
};

// *** MÉTODOS (de consulta - view) DO CONTRATO ** //

function verDeadline() {
  return DApp.contracts.Crowdfunding.methods.getDeadline().call();
}

function verValorArrecadado() {
  return DApp.contracts.Crowdfunding.methods.getRaisedFunds().call();
}

function isOwner() {
  return DApp.contracts.Crowdfunding.methods.isOwner().call({ from: DApp.account });
}

// *** MÉTODOS (de escrita) DO CONTRATO ** //

function contribute() {
  let quant = document.getElementById("quantidade").value;
  let preco = 1000000000000000 * quant;
  return DApp.contracts.Crowdfunding.methods.contribute(quant).send({ from: DApp.account, value: preco }).then(atualizaInterface);;
}

function createCrowd() {
  let walletTarget = document.getElementById("walletTarget").value;
  let words = walletTarget.split(",")
  let wallet = words[0];
  let targetString = words[1];
  let target = parseInt(targetString)
  return DApp.contracts.Crowdfunding.methods.createCrowd(wallet, target).send({ from: DApp.account, _recipient: wallet, _crowdValue: target }).then(atualizaInterface);;
}

function withdraw() {
  return DApp.contracts.Crowdfunding.methods.withdraw().send({ from: DApp.account }).then(atualizaInterface);;
}

// *** ATUALIZAÇÃO DO HTML *** //

function inicializaInterface() {
    document.getElementById("btnCreateCrowd").onclick = createCrowd;
    document.getElementById("btnWithdraw").onclick = withdraw;
    document.getElementById("btnDoar").onclick = contribute;
    atualizaInterface();
}

function atualizaInterface() {  
  verValorArrecadado().then((result) => {
    document.getElementById("valor-arrecadado").innerHTML = 
      result;
  });

  verDeadline().then((result) => {
    document.getElementById("deadline").innerHTML = result + " Dias";
  });

  let walletTarget = document.getElementById("walletTarget").value;
  let words = walletTarget.split(",")
  let targetString = words[1];
  document.getElementById("meta").innerHTML = targetString;

  document.getElementById("btnWithdraw").style.display = "none";
  isOwner().then((result) => {
    if (result) {
      document.getElementById("btnWithdraw").style.display = "block";
    }
  });
}
