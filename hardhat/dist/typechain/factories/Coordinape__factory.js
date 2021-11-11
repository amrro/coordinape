"use strict";
/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Coordinape__factory = void 0;
const ethers_1 = require("ethers");
const _abi = [
    {
        inputs: [],
        name: "EXTERNAL",
        outputs: [
            {
                internalType: "uint8",
                name: "",
                type: "uint8",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "GIVER",
        outputs: [
            {
                internalType: "uint8",
                name: "",
                type: "uint8",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "PARTICIPANT",
        outputs: [
            {
                internalType: "uint8",
                name: "",
                type: "uint8",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "RECEIVER",
        outputs: [
            {
                internalType: "uint8",
                name: "",
                type: "uint8",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
];
const _bytecode = "0x610154610053600b82828239805160001a607314610046577f4e487b7100000000000000000000000000000000000000000000000000000000600052600060045260246000fd5b30600052607381538281f3fe73000000000000000000000000000000000000000030146080604052600436106100565760003560e01c806308bd6e7e1461005b578063ad7430cc14610079578063f384524b14610097578063f3e4b0b9146100b5575b600080fd5b6100636100d3565b60405161007091906100f6565b60405180910390f35b6100816100d8565b60405161008e91906100f6565b60405180910390f35b61009f6100dd565b6040516100ac91906100f6565b60405180910390f35b6100bd6100e2565b6040516100ca91906100f6565b60405180910390f35b600481565b600281565b600081565b600181565b6100f081610111565b82525050565b600060208201905061010b60008301846100e7565b92915050565b600060ff8216905091905056fea2646970667358221220dd2b7b0ce3c889dfdc987206e76e412fd6e53a0b751e070a2357cd095523743d64736f6c63430008020033";
class Coordinape__factory extends ethers_1.ContractFactory {
    constructor(...args) {
        if (args.length === 1) {
            super(_abi, _bytecode, args[0]);
        }
        else {
            super(...args);
        }
    }
    deploy(overrides) {
        return super.deploy(overrides || {});
    }
    getDeployTransaction(overrides) {
        return super.getDeployTransaction(overrides || {});
    }
    attach(address) {
        return super.attach(address);
    }
    connect(signer) {
        return super.connect(signer);
    }
    static createInterface() {
        return new ethers_1.utils.Interface(_abi);
    }
    static connect(address, signerOrProvider) {
        return new ethers_1.Contract(address, _abi, signerOrProvider);
    }
}
exports.Coordinape__factory = Coordinape__factory;
Coordinape__factory.bytecode = _bytecode;
Coordinape__factory.abi = _abi;