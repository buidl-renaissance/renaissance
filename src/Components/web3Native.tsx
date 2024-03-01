import React, { useState } from 'react';
import Web3 from 'web3';

const App = () => {
  const [web3, setWeb3] = useState(null);

  useEffect(() => {
    async function connectToMetaMask() {
      const web3 = new Web3(Web3.givenProvider);

      // Set the web3 instance in the state
      setWeb3(web3);
    }

    connectToMetaMask();
  }, []);

  const handleSendTransaction = async () => {
    // Check if web3 is initialized
    if (!web3) {
      return;
    }

    // Get the accounts from MetaMask
    const accounts = await web3.eth.getAccounts();

    // Check if there are any accounts
    if (accounts.length === 0) {
      return;
    }

    // Set the account to use for the transaction
    const from = accounts[0];

    // Set the recipient and amount for the transaction
    const to = '0x...';
    const value = '1000000000000000000'; // 1 ETH

    // Set the transaction options
    const options = {
      from,
      to,
      value,
    };

    // Send the transaction
    const result = await web3.eth.sendTransaction(options);
    console.log(result);
  };

  return (
    <View>
      <Button onPress={handleSendTransaction} title="Send Transaction" />
    </View>
  );
};