import Web3 from "web3"

export async function unlockAccount() {

    const web3 = new Web3('http://localhost:8545'); // Update with your provider URL

    const accounts = await web3.eth.getAccounts()

}