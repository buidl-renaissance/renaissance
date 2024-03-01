import Web3 from "web3";
import BN from "bn.js";
import TruffleContract from "@truffle/contract";
import grantGovernanceTruffle from "../build/contracts/GrantGovernance.json";

// @ts-ignore
const GrantGovernance = TruffleContract(grantGovernanceTruffle);


export async function createProposal(
    web3: Web3,
    account: string,
    // we would later add other params as needed, hence making a json ogj
    params: {
        description: string;
    }
    ) {
    const  { description }  = params;

    GrantGovernance.setProvider(web3.currentProvider);
    const grantGovernance = await GrantGovernance.deployed();

    await grantGovernance.createProposal(description, {
        from: account
    });
}